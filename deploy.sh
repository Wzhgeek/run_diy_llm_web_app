#!/bin/bash

# Dify ChatFlow Web应用部署脚本
# 作者: Wzhgeek
# 用途: 自动配置Python环境、安装依赖、创建systemd服务

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
APP_DIR="$(pwd)"
USER_NAME="$(whoami)"
PYTHON_VERSION="3.8"
VENV_DIR="$APP_DIR/venv"
SERVICE_FILE="/etc/systemd/system/${APP_NAME}.service"
LOG_DIR="/var/log/${APP_NAME}"

log_step "开始部署 Dify ChatFlow Web 应用..."

# 检查是否为root用户或有sudo权限
if [[ $EUID -eq 0 ]]; then
    log_info "检测到root用户权限"
    SUDO=""
else
    if ! command -v sudo &> /dev/null; then
        log_error "需要sudo权限来创建systemd服务，但sudo命令不存在"
        exit 1
    fi
    log_info "使用sudo权限执行系统配置"
    SUDO="sudo"
fi

# 1. 检查并安装系统依赖
log_step "检查系统依赖..."

# 检查Python版本
if ! command -v python3 &> /dev/null; then
    log_error "Python3 未安装，请先安装 Python 3.8+"
    exit 1
fi

PYTHON_CMD=$(command -v python3)
PYTHON_VER=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
log_info "检测到Python版本: $PYTHON_VER"

# 检查pip
if ! command -v pip3 &> /dev/null; then
    log_warn "pip3 未安装，尝试安装..."
    $SUDO apt-get update
    $SUDO apt-get install -y python3-pip
fi

# 检查venv模块
if ! $PYTHON_CMD -m venv --help &> /dev/null; then
    log_warn "python3-venv 未安装，尝试安装..."
    $SUDO apt-get install -y python3-venv
fi

# 2. 创建和配置Python虚拟环境
log_step "配置Python虚拟环境..."

if [ -d "$VENV_DIR" ]; then
    log_warn "虚拟环境已存在，删除并重新创建..."
    rm -rf "$VENV_DIR"
fi

log_info "创建虚拟环境: $VENV_DIR"
$PYTHON_CMD -m venv "$VENV_DIR"

# 激活虚拟环境
log_info "激活虚拟环境"
source "$VENV_DIR/bin/activate"

# 升级pip
log_info "升级pip到最新版本"
pip install --upgrade pip

# 3. 安装Python依赖
log_step "安装Python依赖包..."

if [ -f "requirements.txt" ]; then
    log_info "从requirements.txt安装依赖包"
    pip install -r requirements.txt
else
    log_warn "requirements.txt不存在，手动安装基础依赖"
    pip install flask requests
fi

# 4. 创建日志目录
log_step "创建应用日志目录..."
$SUDO mkdir -p "$LOG_DIR"
$SUDO chown "$USER_NAME:$USER_NAME" "$LOG_DIR"
log_info "日志目录创建完成: $LOG_DIR"

# 5. 创建systemd服务文件
log_step "创建systemd服务文件..."

# 检查应用入口文件
if [ ! -f "$APP_DIR/run.py" ]; then
    log_error "应用入口文件 run.py 不存在"
    exit 1
fi

# 创建服务文件内容
SERVICE_CONTENT="[Unit]
Description=Dify ChatFlow Web Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$APP_DIR
Environment=PATH=$VENV_DIR/bin
ExecStart=$VENV_DIR/bin/python run.py
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=5
StandardOutput=append:$LOG_DIR/app.log
StandardError=append:$LOG_DIR/error.log

# 安全设置
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR $LOG_DIR

[Install]
WantedBy=multi-user.target"

# 写入服务文件
log_info "写入systemd服务文件: $SERVICE_FILE"
echo "$SERVICE_CONTENT" | $SUDO tee "$SERVICE_FILE" > /dev/null

# 6. 重新载入systemd配置
log_step "重新载入systemd配置..."
$SUDO systemctl daemon-reload
log_info "systemd配置已重新载入"

# 7. 启用并启动服务
log_step "启用并启动服务..."
$SUDO systemctl enable "$APP_NAME"
log_info "服务已设置为开机自启动"

if $SUDO systemctl is-active --quiet "$APP_NAME"; then
    log_info "服务正在运行，重启服务..."
    $SUDO systemctl restart "$APP_NAME"
else
    log_info "启动服务..."
    $SUDO systemctl start "$APP_NAME"
fi

# 8. 检查服务状态
log_step "检查服务状态..."
sleep 3

if $SUDO systemctl is-active --quiet "$APP_NAME"; then
    log_info "✅ 服务启动成功！"
    
    # 显示服务状态
    echo ""
    echo "=== 服务状态 ==="
    $SUDO systemctl status "$APP_NAME" --no-pager -l
    
    echo ""
    echo "=== 最近日志 ==="
    $SUDO journalctl -u "$APP_NAME" --no-pager -l --since "5 minutes ago"
    
else
    log_error "❌ 服务启动失败！"
    echo ""
    echo "=== 错误日志 ==="
    $SUDO journalctl -u "$APP_NAME" --no-pager -l --since "5 minutes ago"
    exit 1
fi

# 9. 显示部署信息
echo ""
echo "=========================="
log_info "🎉 部署完成！"
echo "=========================="
echo ""
echo "📋 部署信息:"
echo "   应用名称: $APP_NAME"
echo "   应用目录: $APP_DIR"
echo "   虚拟环境: $VENV_DIR"
echo "   服务文件: $SERVICE_FILE"
echo "   日志目录: $LOG_DIR"
echo "   运行用户: $USER_NAME"
echo ""
echo "🔧 常用命令:"
echo "   查看状态: sudo systemctl status $APP_NAME"
echo "   启动服务: sudo systemctl start $APP_NAME"
echo "   停止服务: sudo systemctl stop $APP_NAME"
echo "   重启服务: sudo systemctl restart $APP_NAME"
echo "   查看日志: sudo journalctl -u $APP_NAME -f"
echo "   禁用服务: sudo systemctl disable $APP_NAME"
echo ""
echo "📁 日志文件:"
echo "   应用日志: $LOG_DIR/app.log"
echo "   错误日志: $LOG_DIR/error.log"
echo "   系统日志: sudo journalctl -u $APP_NAME"
echo ""

# 检查防火墙状态
if command -v ufw &> /dev/null; then
    if $SUDO ufw status | grep -q "Status: active"; then
        log_warn "检测到UFW防火墙已启用，请确保开放8888端口："
        echo "   sudo ufw allow 8888"
    fi
fi

if command -v firewall-cmd &> /dev/null; then
    if $SUDO firewall-cmd --state 2>/dev/null | grep -q "running"; then
        log_warn "检测到firewalld防火墙已启用，请确保开放8888端口："
        echo "   sudo firewall-cmd --permanent --add-port=8888/tcp"
        echo "   sudo firewall-cmd --reload"
    fi
fi

echo ""
log_info "🌐 应用应该运行在: http://localhost:8888"
log_info "📊 如需外网访问，请配置反向代理(Nginx)和防火墙规则"

echo ""
echo "部署脚本执行完成！" 