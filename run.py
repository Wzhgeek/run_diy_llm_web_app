#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dify ChatFlow Web应用启动脚本
"""

import os
import sys
from app import app

if __name__ == '__main__':
    # 设置环境变量
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = 'True'
    
    print("🚀 启动 Dify ChatFlow Web应用...")
    print("📍 访问地址: http://localhost:8888")
    print("📊 API服务: http://118.196.22.104/v1")
    print("🔧 调试模式: 开启")
    print("=" * 50)
    
    try:
        # 启动Flask应用
        app.run(
            host='0.0.0.0',
            port=8888,
            debug=True,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 应用已停止")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1) 