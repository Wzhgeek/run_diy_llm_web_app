# 🚀 Dify智能助手Web应用

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-2.3+-green.svg)
![Bootstrap](https://img.shields.io/badge/bootstrap-5.3-purple.svg)

*基于Dify ChatFlow API的智能助手Web应用，提供AI对话、文档处理和知识库管理的一站式服务平台*

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术架构](#-技术架构) • [API文档](#-api-接口) • [部署指南](#-部署指南)

</div>

---

## 📋 项目概览

**Dify智能助手Web应用**是一个功能完善的Web平台，基于Dify ChatFlow API构建，为用户提供智能对话、文档处理和知识库管理等核心功能。应用采用现代化的Web技术栈，提供直观易用的用户界面和稳定可靠的后端服务。

### 🎯 设计理念

- **用户体验优先**：响应式设计，支持桌面端和移动端
- **功能模块化**：清晰的功能分离，便于维护和扩展
- **API原生集成**：深度集成Dify API，充分发挥AI能力
- **安全可靠**：完善的错误处理和安全机制

## ✨ 功能特性

### 🤖 智能对话模块
- **实时流式对话**：支持实时流式AI响应，提供自然的对话体验
- **多模态交互**：支持文本、图片上传识别，实现多维度智能交互
- **会话管理**：完整的对话历史管理，支持会话创建、重命名、删除
- **消息反馈**：用户可对AI回答进行点赞/点踩反馈，优化体验
- **建议问题**：智能生成相关问题建议，引导深入对话

### 📄 文档处理模块
- **多语言翻译**：支持多种语言间的文档翻译服务
- **智能摘要**：自动生成文档摘要和关键信息提取
- **内容改写**：文本优化、改写和风格调整
- **批量处理**：支持批量文档处理，提高工作效率
- **格式保持**：保持原有文档格式，支持多种文件类型

### 📚 知识库管理模块
- **知识库CRUD**：完整的知识库创建、查看、更新、删除操作
- **文档上传**：支持多格式文档上传（PDF、Word、Excel、TXT等）
- **智能索引**：自动文档分段和向量化索引
- **检索测试**：内置检索测试功能，验证知识库效果
- **状态监控**：实时监控文档处理状态和索引进度

### 🔧 工作流支持
- **Workflow执行**：支持Dify工作流的执行和管理
- **流程监控**：实时监控工作流执行状态
- **日志查看**：详细的工作流执行日志和调试信息

## 🏗️ 技术架构

### 后端技术栈
```
Flask 2.3+           # Web框架
Werkzeug 2.3+        # WSGI工具库
Requests 2.31+       # HTTP客户端
Python-dotenv 1.0+   # 环境变量管理
Gunicorn 21.2+       # WSGI服务器
```

### 前端技术栈
```
Bootstrap 5.3        # CSS框架
JavaScript ES6+      # 前端脚本
Font Awesome         # 图标库
Chart.js            # 数据可视化
WebSocket            # 实时通信
```

### 文档处理支持
```
PyPDF2 3.0+          # PDF处理
python-docx 0.8+     # Word文档处理
pandas 2.0+          # 数据分析
openpyxl 3.1+        # Excel处理
```

### 架构设计
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端界面       │    │   Flask应用      │    │   Dify API     │
│                │    │                │    │                │
│  • Bootstrap   │◄──►│  • 路由处理      │◄──►│  • 聊天服务     │
│  • JavaScript │    │  • 模板渲染      │    │  • 知识库API   │
│  • CSS样式     │    │  • API集成      │    │  • 文件处理     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 快速开始

### 系统要求
- **Python 3.8+**
- **pip** (Python包管理器)
- **2GB+** 可用内存
- **1GB+** 可用存储空间

### 1. 克隆项目
```bash
git clone <repository-url>
cd run_diy_llm_web_app-version2
```

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 配置环境
编辑 `config.py` 文件，配置您的API密钥：
```python
# Dify API配置
CHAT_API_KEY = "your-chat-api-key"
DATASET_API_KEY = "your-dataset-api-key"
BASE_URL = "http://your-dify-instance/v1"
```

### 4. 启动应用
```bash
# 开发模式启动
python run.py

# 或者直接运行Flask应用
python app.py
```

### 5. 访问应用
打开浏览器访问：`http://localhost:8888`

## 📁 项目结构

```
run_diy_llm_web_app-version2/
├── 📁 应用核心
│   ├── app.py                    # Flask主应用 (965行)
│   ├── run.py                    # 启动脚本
│   ├── config.py                 # 配置文件 (229行)
│   └── requirements.txt          # Python依赖
│
├── 📁 前端模板
│   ├── templates/
│   │   ├── base.html            # 基础模板 (470行)
│   │   ├── index.html           # 主页 (469行)
│   │   ├── chat.html            # 聊天页面 (267行)
│   │   ├── document.html        # 文档处理 (412行)
│   │   ├── knowledge.html       # 知识库管理 (794行)
│   │   ├── 404.html            # 错误页面
│   │   └── components/          # 组件模板
│   │
│   └── static/
│       ├── custom.css           # 自定义样式 (1512行)
│       ├── js/                  # JavaScript文件
│       ├── css/                 # 额外CSS文件
│       └── images/              # 图片资源
│
├── 📁 文档与配置
│   ├── README.md               # 项目说明
│   ├── 产品设计文档.md         # 产品设计文档 (209行)
│   ├── API-file.txt           # API接口文档 (1256行)
│   ├── chonggou.txt           # 重构说明
│   └── docs/                  # 额外文档
│
├── 📁 部署与运维
│   ├── deploy.sh              # 部署脚本 (319行)
│   ├── update.sh              # 更新脚本 (200行)
│   └── diagnose_api.py        # API诊断工具 (226行)
│
└── 📁 临时文件
    ├── uploads/               # 文件上传目录
    └── __pycache__/          # Python缓存
```

## 🔌 API 接口

### 聊天对话API
| 接口 | 方法 | 描述 |
|------|------|------|
| `/chat-messages` | POST | 创建聊天消息 |
| `/conversations` | GET | 获取会话列表 |
| `/files/upload` | POST | 上传文件 |
| `/messages/{id}/feedbacks` | POST | 消息反馈 |

### 知识库管理API
| 接口 | 方法 | 描述 |
|------|------|------|
| `/datasets` | GET/POST | 知识库列表/创建 |
| `/datasets/{id}/documents` | GET/POST | 文档管理 |
| `/datasets/{id}/retrieve` | POST | 知识检索 |

### 工作流API
| 接口 | 方法 | 描述 |
|------|------|------|
| `/workflows/run` | POST | 执行工作流 |
| `/workflows/logs` | GET | 工作流日志 |

详细API文档请参考：[API-file.txt](API-file.txt)

## 🎮 使用指南

### 智能对话
1. **创建会话**：点击"新对话"按钮创建新的聊天会话
2. **发送消息**：在输入框中输入问题，点击发送或按Enter键
3. **上传图片**：点击图片图标或拖拽图片到对话框进行多模态交互
4. **管理会话**：在左侧面板查看、重命名或删除历史会话

### 文档处理
1. **选择功能**：在顶部选择翻译、摘要或改写功能
2. **输入内容**：上传文件或直接输入文本内容
3. **配置参数**：设置目标语言、摘要长度等参数
4. **查看结果**：实时查看处理进度和结果

### 知识库管理
1. **创建知识库**：点击"创建知识库"按钮，输入名称和描述
2. **上传文档**：选择知识库后上传PDF、Word等格式文档
3. **监控状态**：查看文档处理状态和索引进度
4. **测试检索**：使用内置检索功能测试知识库效果

## 🛠️ 部署指南

### 开发环境部署
```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python run.py
```

### 生产环境部署

#### 1. 使用Gunicorn
```bash
# 安装Gunicorn
pip install gunicorn

# 启动生产服务器
gunicorn -w 4 -b 0.0.0.0:8888 app:app
```

#### 2. 使用部署脚本
```bash
# 执行自动部署
chmod +x deploy.sh
./deploy.sh
```

#### 3. 使用Docker（推荐）
```dockerfile
FROM python:3.8-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8888

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8888", "app:app"]
```

### Nginx反向代理配置
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ⚙️ 配置说明

### 环境变量配置
```bash
# API配置
export DIFY_API_BASE="http://your-dify-instance/v1"
export DIFY_CHAT_API_KEY="your-chat-api-key"
export DIFY_DATASET_API_KEY="your-dataset-api-key"

# 应用配置
export APP_PORT=8888
export APP_DEBUG=false
export FLASK_ENV=production
```

### 应用配置文件
主要配置选项在 `config.py` 中：
- **API端点配置**：Dify API的各个端点URL
- **认证配置**：API密钥和请求头
- **文件上传配置**：支持的文件类型和大小限制
- **默认参数**：对话、知识库等功能的默认设置

## 🔐 安全最佳实践

### API安全
- **密钥管理**：使用环境变量存储API密钥，避免硬编码
- **请求验证**：所有API请求都包含适当的认证头
- **错误处理**：敏感信息不会在错误消息中暴露

### 文件安全
- **类型检查**：严格限制上传文件类型
- **大小限制**：设置合理的文件大小上限（50MB）
- **临时清理**：自动清理临时上传文件

### 传输安全
- **HTTPS建议**：生产环境建议使用HTTPS
- **CORS配置**：适当的跨域资源共享设置
- **输入验证**：对所有用户输入进行验证和过滤

## 📊 监控与维护

### 日志管理
应用提供详细的日志记录：
- **访问日志**：记录所有HTTP请求
- **错误日志**：记录异常和错误信息
- **API调用日志**：记录与Dify API的交互

### 性能监控
- **响应时间**：监控API响应时间
- **错误率**：追踪错误发生频率
- **资源使用**：监控CPU、内存使用情况

### 诊断工具
使用 `diagnose_api.py` 进行API连接诊断：
```bash
python diagnose_api.py
```

## 🔄 更新与升级

### 自动更新
```bash
# 使用更新脚本
chmod +x update.sh
./update.sh
```

### 手动更新
```bash
# 拉取最新代码
git pull origin main

# 更新依赖
pip install -r requirements.txt --upgrade

# 重启服务
sudo systemctl restart dify-web-app
```

## 🤝 贡献指南

我们欢迎社区贡献！请遵循以下步骤：

1. **Fork项目**到您的GitHub账户
2. **创建特性分支**：`git checkout -b feature/new-feature`
3. **提交更改**：`git commit -am 'Add new feature'`
4. **推送分支**：`git push origin feature/new-feature`
5. **创建Pull Request**

### 代码规范
- 遵循PEP 8 Python代码规范
- 添加适当的注释和文档字符串
- 确保所有测试通过
- 更新相关文档

## 🐛 问题排查

### 常见问题

**Q: 应用启动失败**
```
A: 检查Python版本(3.8+)和依赖安装
   python --version
   pip install -r requirements.txt
```

**Q: API连接失败**
```
A: 验证API配置和网络连接
   python diagnose_api.py
```

**Q: 文件上传失败**
```
A: 检查文件大小(<50MB)和类型限制
   查看config.py中的ALLOWED_EXTENSIONS
```

### 日志查看
```bash
# 查看应用日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

## 📄 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 📞 支持与联系

- **项目文档**：查看 [产品设计文档](产品设计文档.md) 了解详细功能设计
- **API文档**：参考 [API-file.txt](API-file.txt) 获取完整API规范
- **问题反馈**：通过GitHub Issues提交问题和建议

---

<div align="center">

**⭐ 如果这个项目对您有帮助，请给我们一个星标！⭐**

Made with ❤️ by the Dify Community

</div>

## 📱 移动端重构完成

### 🎨 设计理念
采用**简约、大气、线条、优雅**的现代设计语言，为移动端用户提供专业而美观的学术研究体验。

### ✨ 移动端特色
- **智能适配**：自动检测设备类型，提供最优化的界面体验
- **线条美学**：简洁的线条元素，突出内容层次感
- **毛玻璃效果**：现代化的视觉设计，提升界面质感
- **渐变主题**：优雅的色彩搭配，符合学术气质
- **手势友好**：44px最小触控区域，符合移动端标准

### 🔧 移动端功能
✅ **完整功能保持**：移动端功能与PC端完全一致  
✅ **智能设备检测**：自动识别手机/平板/桌面设备  
✅ **响应式布局**：完美适配各种屏幕尺寸  
✅ **触控优化**：所有交互元素针对触控设备优化  
✅ **深色模式**：完整支持深浅色主题切换  
✅ **性能优化**：流畅的动画和过渡效果  

## 🚀 快速开始

### 环境要求
- Python 3.8+
- pip 包管理器

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-repo/ai-academic-assistant.git
cd ai-academic-assistant
```

2. **安装依赖**
```bash
pip install -r requirements.txt
```

3. **配置API密钥**
```bash
cp .env.example .env
# 编辑 .env 文件，填入你的API密钥
```

4. **启动应用**
```bash
python app.py
```

5. **访问应用**
- 桌面端：http://localhost:5000
- 移动端：在手机浏览器中访问相同地址

## 🎯 核心功能

### 💬 AI对话
- 多轮智能对话
- 支持文档、图片等多模态输入
- 实时流式响应
- 上下文记忆功能

### 📄 文献处理
- 智能文档翻译
- 自动摘要生成
- 批量文件处理
- 多格式支持

### 🗄️ 知识库管理
- 向量化存储
- 智能检索
- 关系图谱
- 批量导入

### 📚 使用文档
- 完整使用指南
- 智能目录导航
- 移动端优化显示
- 打印友好格式

## 📱 移动端特性详解

### 界面设计
- **简约风格**：去除冗余元素，突出核心功能
- **线条元素**：使用线条和几何形状增强视觉层次
- **优雅配色**：渐变色彩搭配，提升视觉品质
- **大气布局**：合理的留白和spacing，避免拥挤感

### 交互体验
- **手势操作**：支持侧滑、点击等手势
- **触控反馈**：即时的视觉和触觉反馈
- **动画效果**：流畅的过渡动画
- **防误触**：合理的按钮间距和点击区域

### 技术实现
- **CSS Grid/Flexbox**：现代化的布局技术
- **Media Queries**：多断点响应式设计
- **Backdrop Filter**：毛玻璃效果实现
- **CSS变量**：统一的主题管理

## 🛠️ 开发指南

### 项目结构
```
├── app.py                 # 主应用文件
├── static/
│   ├── custom.css        # 桌面端样式
│   ├── mobile.css        # 移动端专用样式
│   └── js/               # JavaScript文件
├── templates/
│   ├── base.html         # 基础模板
│   ├── index.html        # 首页
│   ├── chat.html         # 聊天页面
│   ├── document.html     # 文档处理
│   ├── knowledge.html    # 知识库
│   └── user_guide.html   # 使用文档
├── docs/                 # 文档目录
├── uploads/              # 上传文件存储
└── requirements.txt      # 依赖包列表
```

### 移动端开发规范

#### CSS设计模式
```css
/* 使用CSS变量统一管理主题 */
:root {
    --mobile-primary: #2563eb;
    --mobile-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --mobile-radius: 12px;
    --mobile-spacing: 16px;
}

/* 移动端类选择器命名 */
.mobile-device .component-name,
.mobile-optimized .component-name,
.mobile-view .component-name {
    /* 移动端专用样式 */
}
```

#### 响应式断点
- **手机端**: ≤ 768px
- **小屏手机**: ≤ 480px  
- **平板端**: 768px - 1024px
- **桌面端**: > 1024px

#### 设计原则
1. **触控优先**：最小44px点击区域
2. **内容优先**：突出核心信息，简化次要元素
3. **性能优先**：优化动画和加载速度
4. **一致性**：保持PC端功能完整性

## 🔧 配置说明

### 环境变量
```bash
# API配置
OPENAI_API_KEY=你的OpenAI API密钥
OPENAI_API_BASE=https://api.openai.com/v1

# 应用配置
FLASK_ENV=development
DEBUG=True
PORT=5000

# 上传配置
MAX_CONTENT_LENGTH=16MB
UPLOAD_FOLDER=uploads
```

### 功能开关
```python
# app.py 中的配置选项
ENABLE_CHAT = True           # 启用AI对话
ENABLE_DOCUMENT = True       # 启用文档处理
ENABLE_KNOWLEDGE = True      # 启用知识库
ENABLE_MOBILE_MODE = True    # 启用移动端模式
```

## 🎨 主题定制

### 颜色方案
```css
/* 主色调 */
--mobile-primary: #2563eb;        /* 主蓝色 */
--mobile-accent: #10b981;         /* 辅助绿色 */
--mobile-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 界面颜色 */
--mobile-surface: #ffffff;        /* 表面色 */
--mobile-surface-elevated: #fafafa; /* 浮起表面色 */
--mobile-border: #e5e7eb;         /* 边框色 */

/* 文字颜色 */
--mobile-text-primary: #111827;   /* 主文字色 */
--mobile-text-secondary: #6b7280; /* 次文字色 */
```

### 深色模式
```css
[data-theme="dark"] {
    --mobile-surface: #111827;
    --mobile-surface-elevated: #1f2937;
    --mobile-border: #374151;
    --mobile-text-primary: #f9fafb;
    --mobile-text-secondary: #d1d5db;
}
```

## 📖 使用指南

### 基本操作
1. **导航菜单**：点击左上角菜单图标打开侧边栏
2. **主题切换**：点击右上角月亮/太阳图标
3. **移动版切换**：点击手机图标强制启用移动版
4. **功能访问**：通过侧边栏或首页卡片访问各功能

### 高级功能
- **文件上传**：支持拖拽上传
- **多模态输入**：支持文本、图片、文档等
- **快捷操作**：长按卡片查看更多选项
- **手势导航**：左滑返回，右滑前进

## 🚦 API接口

### 聊天接口
```javascript
// 文本聊天
POST /api/chat
{
    "query": "你的问题",
    "conversation_id": "会话ID（可选）"
}

// 文件聊天
POST /api/chat
{
    "query": "关于文件的问题",
    "conversation_id": "会话ID（可选）",
    "inputs": {
        "input_file": {
            "type": "document|audio|video|custom",
            "transfer_method": "local_file",
            "upload_file_id": "文件ID"
        }
    }
}
```

### 文档处理接口
```javascript
// 上传文件
POST /api/upload
FormData: file

// 翻译文档
POST /api/translate
{
    "file_path": "文件路径",
    "target_language": "目标语言"
}
```

## 🔧 故障排除

### 常见问题

**Q: 移动端样式不生效？**
A: 检查是否正确引入了mobile.css文件，确保设备检测JavaScript正常运行。

**Q: 侧边栏无法打开？**
A: 检查JavaScript是否正确加载，确认toggleSidebar函数正常工作。

**Q: 深色模式切换异常？**
A: 清除浏览器缓存，检查localStorage中的主题设置。

**Q: 文件上传失败？**
A: 检查文件大小是否超过限制（默认16MB），确认uploads目录权限。

### 调试技巧
```javascript
// 开启调试模式
localStorage.setItem('debug', 'true');

// 查看当前设备检测结果
console.log(detectDevice());

// 查看当前主题
console.log(document.documentElement.getAttribute('data-theme'));
```

## 🤝 贡献指南

### 开发环境搭建
1. Fork 项目到个人仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -am 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

### 代码规范
- 使用语义化的CSS类名
- 遵循移动端优先的设计原则
- 添加必要的注释和文档
- 测试多种设备和浏览器兼容性

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持与反馈

- **问题反馈**：[GitHub Issues](https://github.com/your-repo/issues)
- **功能建议**：[GitHub Discussions](https://github.com/your-repo/discussions)
- **技术文档**：[项目Wiki](https://github.com/your-repo/wiki)

---

**AI学术研究助手** - 让学术研究更智能、更高效！🚀 