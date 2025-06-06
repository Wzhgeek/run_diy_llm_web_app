#!/bin/bash

# Dify ChatFlow Web应用快速更新脚本
# 作者: Wzhgeek
# 用途: 快速拉取最新代码并重启服务

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 配置变量
APP_NAME="dify-chatflow-web"
APP_DIR="/srv/${APP_NAME}"
VENV_DIR="$APP_DIR/venv"

# 检查是否为root用户或有sudo权限
if [[ $EUID -eq 0 ]]; then
    SUDO=""
else
    if ! command -v sudo &> /dev/null; then
        log_error "需要sudo权限，但sudo命令不存在"
        exit 1
    fi
    SUDO="sudo"
fi

log_step "开始更新 Dify ChatFlow Web 应用..."

# 1. 检查项目目录是否存在
if [ ! -d "$APP_DIR" ]; then
    log_error "项目目录不存在: $APP_DIR"
    log_info "请先运行部署脚本: ./deploy.sh"
    exit 1
fi

# 2. 进入项目目录
log_step "进入项目目录..."
cd "$APP_DIR"
log_info "当前目录: $(pwd)"

# 3. 检查Git状态
log_step "检查Git状态..."
if [ ! -d ".git" ]; then
    log_error "不是Git仓库，无法更新"
    exit 1
fi

# 显示当前版本信息
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_BRANCH=$(git branch --show-current)
log_info "当前分支: $CURRENT_BRANCH"
log_info "当前版本: $CURRENT_COMMIT"

# 4. 停止服务
log_step "停止应用服务..."
if $SUDO systemctl is-active --quiet "$APP_NAME"; then
    $SUDO systemctl stop "$APP_NAME"
    log_info "服务已停止"
else
    log_warn "服务未在运行"
fi

# 5. 备份当前版本（可选）
log_step "备份当前代码..."
BACKUP_FILE="/tmp/${APP_NAME}_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$BACKUP_FILE" --exclude=venv --exclude=.git .
log_info "代码已备份到: $BACKUP_FILE"

# 6. 拉取最新代码
log_step "拉取最新代码..."
git fetch origin
git reset --hard origin/main
NEW_COMMIT=$(git rev-parse --short HEAD)
log_info "更新到版本: $NEW_COMMIT"

# 7. 检查是否有更新
if [ "$CURRENT_COMMIT" = "$NEW_COMMIT" ]; then
    log_info "已是最新版本，无需更新"
else
    log_info "代码已更新: $CURRENT_COMMIT -> $NEW_COMMIT"
    
    # 显示更新日志
    echo ""
    echo "=== 更新日志 ==="
    git log --oneline $CURRENT_COMMIT..HEAD
    echo ""
fi

# 8. 检查requirements.txt是否有变化
log_step "检查依赖更新..."
if [ -f "requirements.txt" ]; then
    # 验证虚拟环境
    if [ -f "$VENV_DIR/bin/python" ] && [ -f "$VENV_DIR/bin/activate" ]; then
        log_info "激活虚拟环境: $VENV_DIR"
        source "$VENV_DIR/bin/activate"
        
        # 验证Python路径
        PYTHON_PATH=$(which python)
        log_info "使用Python路径: $PYTHON_PATH"
        
        # 更新依赖
        log_info "更新Python依赖包"
        pip install --upgrade pip
        pip install -r requirements.txt
        log_info "依赖包更新完成"
    else
        log_warn "虚拟环境不存在或损坏: $VENV_DIR"
        log_warn "建议重新运行部署脚本: ./deploy.sh"
    fi
else
    log_warn "requirements.txt 不存在，跳过依赖更新"
fi

# 验证关键文件
log_step "验证应用文件..."
if [ ! -f "run.py" ]; then
    log_error "关键文件 run.py 不存在！"
    exit 1
fi

if [ ! -f "app.py" ]; then
    log_warn "app.py 文件不存在，可能影响应用运行"
fi

log_info "应用文件验证完成"

# 9. 重启服务
log_step "启动应用服务..."
$SUDO systemctl start "$APP_NAME"

# 等待服务启动
sleep 3

# 10. 检查服务状态
log_step "检查服务状态..."
if $SUDO systemctl is-active --quiet "$APP_NAME"; then
    log_info "✅ 服务启动成功！"
    
    # 显示服务状态
    echo ""
    echo "=== 服务状态 ==="
    $SUDO systemctl status "$APP_NAME" --no-pager -l
    
else
    log_error "❌ 服务启动失败！"
    echo ""
    echo "=== 错误日志 ==="
    $SUDO journalctl -u "$APP_NAME" --no-pager -l --since "2 minutes ago"
    
    # 提示恢复备份
    log_warn "如需回滚，请执行："
    echo "  cd $APP_DIR"
    echo "  sudo systemctl stop $APP_NAME"
    echo "  tar -xzf $BACKUP_FILE"
    echo "  sudo systemctl start $APP_NAME"
    
    exit 1
fi

# 11. 显示更新完成信息
echo ""
echo "=========================="
log_info "🎉 更新完成！"
echo "=========================="
echo ""
echo "📋 更新信息:"
echo "   版本变更: $CURRENT_COMMIT -> $NEW_COMMIT"
echo "   备份文件: $BACKUP_FILE"
echo "   应用目录: $APP_DIR"
echo ""
echo "🔧 常用命令:"
echo "   查看状态: sudo systemctl status $APP_NAME"
echo "   查看日志: sudo journalctl -u $APP_NAME -f"
echo "   重启服务: sudo systemctl restart $APP_NAME"
echo ""
echo "🌐 应用地址: http://localhost:8888"
echo ""
echo "更新脚本执行完成！" 