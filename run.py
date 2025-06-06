#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dify ChatFlow Web应用启动脚本
"""

import os
import sys
from app import app
from config import AppConfig, DifyAPIConfig

if __name__ == '__main__':
    # 设置环境变量
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = 'True'
    
    print("🚀 启动 Dify ChatFlow Web应用...")
    print(f"📍 本地访问: http://localhost:{AppConfig.PORT}")
    print(f"🌐 公网访问: http://118.196.22.104:{AppConfig.PORT}")
    print(f"📊 API服务: {DifyAPIConfig.BASE_URL}")
    print("🔧 调试模式: 开启")
    print("💡 提示: 大量文件变化日志是正常的开发模式行为")
    print("=" * 50)
    
    try:
        # 启动Flask应用
        app.run(
            host=AppConfig.HOST,
            port=AppConfig.PORT,
            debug=AppConfig.DEBUG,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 应用已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1) 