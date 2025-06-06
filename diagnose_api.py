#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
全面API诊断 - 既然密钥正确，检查其他问题
"""

import requests
import json
import time
from config import DifyAPIConfig

def test_server_connectivity():
    """测试服务器连接性"""
    print("🌐 测试服务器连接性...")
    
    # 测试基本连接
    try:
        response = requests.get("http://118.196.22.104", timeout=5)
        print(f"✅ 服务器基本连接正常 (状态码: {response.status_code})")
    except Exception as e:
        print(f"❌ 服务器连接失败: {e}")
        return False
    
    # 测试API端点是否存在
    try:
        response = requests.get("http://118.196.22.104/v1", timeout=5)
        print(f"API端点响应: {response.status_code}")
        if response.status_code == 404:
            print("⚠️ /v1 端点不存在，可能需要不同的路径")
        elif response.status_code == 401:
            print("✅ /v1 端点存在但需要认证")
        else:
            print(f"✅ /v1 端点存在 (状态码: {response.status_code})")
    except Exception as e:
        print(f"❌ API端点测试失败: {e}")
    
    return True

def test_different_api_versions():
    """测试不同的API版本和路径"""
    print("\n🔄 测试不同API版本和路径...")
    
    base_host = "118.196.22.104"
    api_paths = [
        "/v1/datasets",
        "/api/v1/datasets", 
        "/datasets",
        "/dify/v1/datasets",
        "/v2/datasets"
    ]
    
    headers = {"Authorization": f"Bearer {DifyAPIConfig.DATASET_API_KEY}"}
    
    for path in api_paths:
        url = f"http://{base_host}{path}"
        print(f"\n📍 测试: {url}")
        try:
            response = requests.get(url, headers=headers, timeout=5)
            print(f"   状态码: {response.status_code}")
            if response.status_code != 401:
                print(f"   ✅ 可能的正确路径: {path}")
                print(f"   响应: {response.text[:100]}...")
            elif response.status_code == 401:
                print(f"   ❌ 认证失败")
            else:
                print(f"   ⚠️ 其他状态: {response.text[:100]}...")
        except Exception as e:
            print(f"   ❌ 错误: {e}")

def test_headers_variations():
    """测试不同的请求头变体"""
    print("\n🔐 测试请求头变体...")
    
    api_key = DifyAPIConfig.DATASET_API_KEY
    url = "http://118.196.22.104/v1/datasets"
    
    header_variations = [
        # 标准Bearer
        {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        # 无Content-Type
        {"Authorization": f"Bearer {api_key}"},
        # 添加User-Agent
        {"Authorization": f"Bearer {api_key}", "User-Agent": "DifyWebApp/1.0"},
        # 添加Accept
        {"Authorization": f"Bearer {api_key}", "Accept": "application/json"},
        # 完整头部
        {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "DifyWebApp/1.0"
        },
        # 尝试x-api-key
        {"x-api-key": api_key},
        {"X-API-KEY": api_key},
        {"api-key": api_key}
    ]
    
    for i, headers in enumerate(header_variations, 1):
        print(f"\n变体 {i}: {headers}")
        try:
            response = requests.get(url, headers=headers, timeout=5)
            print(f"   状态码: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ 成功! 使用这个头部格式")
                return headers
            elif response.status_code != 401:
                print(f"   ⚠️ 非401响应: {response.text[:100]}...")
        except Exception as e:
            print(f"   ❌ 错误: {e}")
    
    return None

def test_with_params():
    """测试添加必要参数"""
    print("\n📋 测试添加必要参数...")
    
    url = "http://118.196.22.104/v1/datasets"
    headers = {"Authorization": f"Bearer {DifyAPIConfig.DATASET_API_KEY}"}
    
    param_variations = [
        {},  # 无参数
        {"limit": 10},
        {"page": 1, "limit": 10},
        {"user": "admin"},
        {"user": "web_user", "limit": 10},
        {"page": 1, "limit": 20, "user": "web_user"}
    ]
    
    for i, params in enumerate(param_variations, 1):
        print(f"\n参数组合 {i}: {params}")
        try:
            response = requests.get(url, headers=headers, params=params, timeout=5)
            print(f"   状态码: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ 成功! 需要这些参数: {params}")
                return params
            elif response.status_code != 401:
                print(f"   ⚠️ 非401响应: {response.text[:100]}...")
        except Exception as e:
            print(f"   ❌ 错误: {e}")
    
    return None

def test_create_with_minimal_data():
    """用最小数据测试创建"""
    print("\n📝 测试最小数据创建...")
    
    url = "http://118.196.22.104/v1/datasets"
    headers = {"Authorization": f"Bearer {DifyAPIConfig.DATASET_API_KEY}", "Content-Type": "application/json"}
    
    # 尝试最小数据
    minimal_data = {"name": f"test_{int(time.time())}"}
    
    print(f"最小数据: {minimal_data}")
    try:
        response = requests.post(url, headers=headers, json=minimal_data, timeout=10)
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.text}")
        
        if response.status_code in [200, 201]:
            print("✅ 最小数据创建成功!")
            return True
        else:
            print("❌ 最小数据创建失败")
    except Exception as e:
        print(f"❌ 错误: {e}")
    
    return False

def check_api_documentation():
    """检查可能的API文档端点"""
    print("\n📖 检查API文档端点...")
    
    doc_paths = [
        "/docs",
        "/swagger", 
        "/api-docs",
        "/v1/docs",
        "/openapi.json",
        "/redoc"
    ]
    
    for path in doc_paths:
        url = f"http://118.196.22.104{path}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ 找到文档: {url}")
                print(f"   内容类型: {response.headers.get('content-type', 'unknown')}")
        except:
            pass

if __name__ == '__main__':
    print("🚨 API访问问题全面诊断")
    print("=" * 60)
    print(f"当前使用的密钥:")
    print(f"  聊天: {DifyAPIConfig.CHAT_API_KEY}")
    print(f"  知识库: {DifyAPIConfig.DATASET_API_KEY}")
    print("=" * 60)
    
    # 逐步诊断
    if not test_server_connectivity():
        print("❌ 服务器连接失败，无法继续")
        exit(1)
    
    test_different_api_versions()
    
    working_headers = test_headers_variations()
    if working_headers:
        print(f"\n✅ 找到工作的请求头: {working_headers}")
    
    working_params = test_with_params()
    if working_params:
        print(f"\n✅ 找到需要的参数: {working_params}")
    
    test_create_with_minimal_data()
    check_api_documentation()
    
    print("\n📋 诊断总结:")
    print("1. 如果找到工作的API路径，请更新config.py中的BASE_URL")
    print("2. 如果找到工作的请求头，请更新请求头生成方法")
    print("3. 如果需要特定参数，请在API调用中添加")
    print("4. 检查是否有API文档可以参考")
    
    print("\n🏁 诊断完成") 