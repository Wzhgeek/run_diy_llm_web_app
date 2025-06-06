# Dify ChatFlow Web应用

一个功能完善的Web应用，用于对接Dify ChatFlow API，提供智能对话、文档处理和知识库管理功能。

## 📋 功能特性

### 🤖 智能对话
- 实时聊天对话
- 支持图片上传识别
- 流式响应显示
- 多轮对话历史

### 📄 文档处理
- 文章翻译（支持多种语言）
- 文档摘要生成
- 内容改写优化
- 批量文档处理

### 📚 知识库管理
- 创建和管理知识库
- 上传文档到知识库
- 知识库内容检索
- 文档状态监控

## 🛠️ 技术栈

- **后端**: Python Flask
- **前端**: Bootstrap 5 + JavaScript
- **API**: Dify ChatFlow API
- **样式**: 自定义CSS + 响应式设计

## 📦 安装部署

### 1. 环境要求
- Python 3.7+
- pip (Python包管理器)

### 2. 安装依赖
```bash
pip install -r requirements.txt
```

### 3. 配置API
API配置已内置在应用中：


### 4. 启动应用
```bash
python run.py
```

或直接运行Flask应用：
```bash
python app.py
```

### 5. 访问应用
打开浏览器访问: http://localhost:8888

## 📁 项目结构

```
FUWU/
├── app.py              # Flask主应用
├── run.py              # 启动脚本
├── requirements.txt    # Python依赖
├── README.md          # 项目说明
├── 产品设计文档.md     # 产品设计文档
├── templates/         # HTML模板
│   ├── base.html      # 基础模板
│   ├── index.html     # 主页
│   ├── chat.html      # 聊天页面
│   ├── document.html  # 文档处理页面
│   └── knowledge.html # 知识库管理页面
├── static/           # 静态资源
│   └── custom.css    # 自定义样式
├── commend.txt       # 需求文档
└── API-file.txt      # API文档
```

## 🎯 使用指南

### 智能对话
1. 点击导航栏"智能对话"
2. 在输入框中输入问题
3. 支持上传图片进行识别
4. 查看实时流式响应

### 文档处理
1. 点击导航栏"文档处理"
2. 输入要处理的文本内容
3. 选择处理类型（翻译/摘要/改写）
4. 设置相关参数并提交

### 知识库管理
1. 点击导航栏"知识库管理"
2. 创建新的知识库
3. 上传文档到知识库
4. 进行知识库检索测试

## 🔧 开发说明

### API集成
应用使用DifyAPIClient类封装了所有API调用：
- 聊天消息发送
- 文件上传处理
- 知识库操作
- 流式响应处理

### 前端交互
- 使用Bootstrap 5进行响应式布局
- JavaScript处理异步请求和实时更新
- 自定义CSS提供现代化UI体验

### 错误处理
- 完善的错误捕获和用户提示
- API连接状态监控
- 优雅的错误页面显示

## 🚀 部署建议

### 生产环境
1. 使用Gunicorn作为WSGI服务器：
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8888 app:app
```

2. 配置Nginx反向代理（可选）

3. 设置环境变量：
```bash
export FLASK_ENV=production
export FLASK_DEBUG=False
```

### 安全建议
- 定期更新依赖包
- 配置HTTPS（生产环境）
- 实施访问控制和限速
- 监控API使用情况

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：
- 查看产品设计文档了解详细功能
- 检查API文档确认接口规范
- 查看应用日志排查问题

## 许可证

本项目仅供学习和研究使用。 