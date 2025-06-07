#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
最终翻译功能测试脚本
测试所有翻译模式是否正常工作
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from translation_utils import DocumentProcessor
from config import TranslationAPIConfig

def test_translation_functions():
    """测试所有翻译功能"""
    print("🧪 开始测试翻译功能...")
    print(f"📋 当前翻译服务提供商: {TranslationAPIConfig.CURRENT_PROVIDER}")
    print("-" * 60)
    
    processor = DocumentProcessor()
    test_text = "Hello world, this is a test message for translation."
    
    # 测试1: 通用翻译
    print("1️⃣ 测试通用翻译...")
    try:
        result = processor.translate_document(test_text, 'en', 'zh', 'general')
        if result['success']:
            print(f"✅ 通用翻译成功: {result['translated_text']}")
            print(f"   提供商: {result.get('provider', 'unknown')}")
        else:
            print(f"❌ 通用翻译失败: {result['error']}")
    except Exception as e:
        print(f"❌ 通用翻译异常: {e}")
    
    print()
    
    # 测试2: 领域翻译
    print("2️⃣ 测试领域翻译...")
    try:
        result = processor.domain_translate(test_text, 'it', 'en', 'zh')
        if result['success']:
            print(f"✅ 领域翻译成功: {result['translated_text']}")
        else:
            print(f"❌ 领域翻译失败: {result['error']}")
    except Exception as e:
        print(f"❌ 领域翻译异常: {e}")
    
    print()
    
    # 测试3: API翻译（Dify）
    print("3️⃣ 测试API翻译（Dify）...")
    try:
        result = processor.api_translate(test_text, 'en', 'zh')
        if result['success']:
            print(f"✅ API翻译成功: {result['translated_text']}")
        else:
            print(f"❌ API翻译失败: {result['error']}")
    except Exception as e:
        print(f"❌ API翻译异常: {e}")
    
    print()
    
    # 测试4: 语法检查
    print("4️⃣ 测试语法检查...")
    try:
        result = processor.check_grammar("This is test sentence with some grammar error.")
        if result['success']:
            print(f"✅ 语法检查成功: 评分 {result['grammar_score']}")
            print(f"   建议数量: {len(result['suggestions'])}")
        else:
            print(f"❌ 语法检查失败: {result['error']}")
    except Exception as e:
        print(f"❌ 语法检查异常: {e}")
    
    print()
    
    # 测试5: 文本总结
    print("5️⃣ 测试文本总结...")
    try:
        long_text = "This is a longer text for testing summary functionality. " * 10
        result = processor.summarize_text(long_text)
        if result['success']:
            print(f"✅ 文本总结成功: {result['summary'][:100]}...")
            print(f"   压缩比: {result['compression_ratio']:.2%}")
        else:
            print(f"❌ 文本总结失败: {result['error']}")
    except Exception as e:
        print(f"❌ 文本总结异常: {e}")
    
    print()
    
    # 测试6: 文本改写
    print("6️⃣ 测试文本改写...")
    try:
        result = processor.rewrite_text(test_text, 'formal')
        if result['success']:
            print(f"✅ 文本改写成功: {result['rewritten_text']}")
            print(f"   改进数量: {len(result['improvements'])}")
        else:
            print(f"❌ 文本改写失败: {result['error']}")
    except Exception as e:
        print(f"❌ 文本改写异常: {e}")
    
    print()
    print("-" * 60)
    print("🎉 翻译功能测试完成！")

def test_provider_status():
    """测试提供商状态"""
    print("📊 翻译服务提供商状态:")
    status = TranslationAPIConfig.get_provider_status()
    print(f"   当前提供商: {status['current_provider'].upper()}")
    print(f"   可用提供商: {', '.join(status['available_providers'])}")
    print(f"   说明: {status['note']}")
    print()

if __name__ == "__main__":
    print("🚀 DIY LLM Web App - 翻译功能最终测试")
    print("=" * 60)
    
    # 测试提供商状态
    test_provider_status()
    
    # 测试翻译功能
    test_translation_functions()
    
    print("\n💡 提示:")
    print("   - 如果百度翻译API可用，可以在config.py中设置 CURRENT_PROVIDER = 'baidu'")
    print("   - 当前使用DIFY AI提供智能翻译服务")
    print("   - 访问 http://localhost:8888/document 测试Web界面") 