#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
翻译工具模块
提供百度翻译API调用功能和文献处理相关的翻译、语法检查、总结、改写优化功能
"""

import requests
import random
import json
import time
import base64
import os
import hmac
import hashlib
from hashlib import md5
from typing import Dict, List, Optional, Tuple
from config import TranslationAPIConfig, DifyAPIConfig


class TranslationError(Exception):
    """翻译异常类"""
    pass


class BaiduTranslator:
    """百度翻译API调用类"""
    
    def __init__(self):
        """初始化百度翻译器"""
        self.config = TranslationAPIConfig.BAIDU_CONFIG
        self.app_id = self.config['app_id']
        self.app_key = self.config['app_key']
        self.base_url = self.config['base_url']
        self.translate_path = self.config['translate_path']
        self.timeout = self.config['timeout']
        self.max_query_length = self.config['max_query_length']
        
        # 文档翻译配置
        self.doc_translate_base_url = "https://fanyi-api.baidu.com/transapi/doctrans"
        self.field_translate_path = "/api/trans/vip/fieldtranslate"
    
    def _make_md5(self, s: str, encoding: str = 'utf-8') -> str:
        """生成MD5签名"""
        return md5(s.encode(encoding)).hexdigest()
    
    def _generate_sign(self, query: str, salt: int) -> str:
        """生成百度翻译API签名"""
        sign_str = self.app_id + query + str(salt) + self.app_key
        return self._make_md5(sign_str)
        
    def _generate_field_sign(self, query: str, salt: int, domain: str) -> str:
        """生成领域翻译API签名"""
        sign_str = self.app_id + query + str(salt) + domain + self.app_key
        return self._make_md5(sign_str)
        
    def _generate_doc_sign(self, body: str, timestamp: int) -> str:
        """生成文档翻译API签名（使用HMAC-SHA256）"""
        string_to_sign = self.app_id + str(timestamp) + body
        signature = hmac.new(
            self.app_key.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
        return base64.b64encode(signature).decode('utf-8')
    
    def translate(self, query: str, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        翻译文本
        
        Args:
            query: 待翻译的文本
            from_lang: 源语言代码（默认自动检测）
            to_lang: 目标语言代码（默认中文）
        
        Returns:
            翻译结果字典
        
        Raises:
            TranslationError: 翻译过程中出现错误
        """
        try:
            # 检查文本长度
            if len(query) > self.max_query_length:
                raise TranslationError(f"文本长度超过限制({self.max_query_length}字符)")
            
            # 转换语言代码
            from_lang = TranslationAPIConfig.get_language_code(from_lang)
            to_lang = TranslationAPIConfig.get_language_code(to_lang)
            
            # 生成盐值和签名
            salt = random.randint(32768, 65536)
            sign = self._generate_sign(query, salt)
            
            # 调试信息
            print(f"调试：准备翻译 '{query[:50]}{'...' if len(query) > 50 else ''}' 从 {from_lang} 到 {to_lang}")
            print(f"调试：AppID={self.app_id}, Salt={salt}, Sign={sign[:10]}...")
            
            # 构建请求数据（使用data而不是params）
            data = {
                'appid': self.app_id,
                'q': query,
                'from': from_lang,
                'to': to_lang,
                'salt': salt,
                'sign': sign
            }
            
            # 发送请求
            url = f"{self.base_url}{self.translate_path}"
            headers = TranslationAPIConfig.get_translation_headers()
            
            response = requests.post(
                url=url,
                data=data,  # 使用data参数发送form-encoded数据
                headers=headers,
                timeout=self.timeout
            )
            
            # 处理响应
            if response.status_code != 200:
                raise TranslationError(f"API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            # 检查API返回的错误
            if 'error_code' in result:
                error_code = result['error_code']
                error_msg = result.get('error_msg', '未知错误')
                
                # 特别处理IP白名单错误
                if str(error_code) == '58000':
                    raise TranslationError(f"百度翻译API IP白名单限制 ({error_code}): {error_msg}. 请在百度翻译开放平台管理控制台配置服务器IP地址。")
                else:
                    raise TranslationError(f"翻译API错误 {error_code}: {error_msg}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise TranslationError(f"网络请求错误: {str(e)}")
        except json.JSONDecodeError as e:
            raise TranslationError(f"响应解析错误: {str(e)}")
        except Exception as e:
            raise TranslationError(f"翻译过程发生错误: {str(e)}")
    
    def field_translate(self, query: str, domain: str, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        领域翻译 - 针对特定领域的专业翻译
        
        Args:
            query: 待翻译的文本
            domain: 翻译领域（it/finance/senimed/machinery/novel/academic/aerospace/wiki/news/law/contract）
            from_lang: 源语言代码
            to_lang: 目标语言代码
        
        Returns:
            翻译结果字典
        
        Raises:
            TranslationError: 翻译过程中出现错误
        """
        try:
            # 检查文本长度
            if len(query) > self.max_query_length:
                raise TranslationError(f"文本长度超过限制({self.max_query_length}字符)")
            
            # 转换语言代码
            from_lang = TranslationAPIConfig.get_language_code(from_lang)
            to_lang = TranslationAPIConfig.get_language_code(to_lang)
            
            # 领域代码映射
            domain_map = {
                'academic': 'academic',     # 学术论文
                'business': 'finance',      # 金融财经
                'technical': 'it',          # 信息技术
                'medical': 'senimed',       # 生物医药
                'legal': 'law',             # 法律法规
                'finance': 'finance',       # 金融财经
                'it': 'it',                 # 信息技术
                'machinery': 'machinery',   # 机械制造
                'novel': 'novel',           # 网络文学
                'aerospace': 'aerospace',   # 航空航天
                'wiki': 'wiki',             # 人文社科
                'news': 'news',             # 新闻资讯
                'contract': 'contract',     # 合同
                'general': 'it'             # 默认使用IT领域
            }
            
            domain_code = domain_map.get(domain, 'it')
            
            # 生成盐值和签名
            salt = random.randint(32768, 65536)
            sign = self._generate_field_sign(query, salt, domain_code)
            
            # 构建请求数据
            data = {
                'appid': self.app_id,
                'q': query,
                'from': from_lang,
                'to': to_lang,
                'salt': salt,
                'domain': domain_code,
                'sign': sign
            }
            
            # 发送请求
            url = f"{self.base_url}{self.field_translate_path}"
            headers = TranslationAPIConfig.get_translation_headers()
            
            response = requests.post(
                url=url,
                data=data,
                headers=headers,
                timeout=self.timeout
            )
            
            # 处理响应
            if response.status_code != 200:
                raise TranslationError(f"领域翻译API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            # 检查API返回的错误
            if 'error_code' in result:
                error_code = result['error_code']
                error_msg = result.get('error_msg', '未知错误')
                raise TranslationError(f"领域翻译API错误 {error_code}: {error_msg}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise TranslationError(f"领域翻译网络请求错误: {str(e)}")
        except json.JSONDecodeError as e:
            raise TranslationError(f"领域翻译响应解析错误: {str(e)}")
        except Exception as e:
            raise TranslationError(f"领域翻译过程发生错误: {str(e)}")
    
    def translate_text(self, text: str, from_lang: str = 'auto', to_lang: str = 'zh') -> str:
        """
        翻译文本并返回翻译结果
        
        Args:
            text: 待翻译的文本
            from_lang: 源语言代码
            to_lang: 目标语言代码
        
        Returns:
            翻译后的文本
        """
        try:
            result = self.translate(text, from_lang, to_lang)
            
            if 'trans_result' in result and result['trans_result']:
                translations = []
                for item in result['trans_result']:
                    translations.append(item['dst'])
                return '\n'.join(translations)
            else:
                raise TranslationError("翻译结果为空")
        except TranslationError as e:
            # 不再使用回退机制，直接报错并提示用户
            if 'INVALID_CLIENT_IP' in str(e) or '58000' in str(e) or 'IP白名单限制' in str(e):
                raise TranslationError(f"百度翻译服务暂时不可用: {str(e)}。如需使用AI翻译，请点击'AI翻译'功能。")
            else:
                raise TranslationError(f"百度翻译失败: {str(e)}。如需使用AI翻译，请点击'AI翻译'功能。")
    
    def batch_translate(self, texts: List[str], from_lang: str = 'auto', to_lang: str = 'zh', 
                       delay: float = 1.0) -> List[str]:
        """
        批量翻译文本
        
        Args:
            texts: 待翻译的文本列表
            from_lang: 源语言代码
            to_lang: 目标语言代码
            delay: 请求间隔时间（秒），避免频率限制
        
        Returns:
            翻译结果列表
        """
        results = []
        
        for i, text in enumerate(texts):
            try:
                # 添加延迟避免频率限制
                if i > 0:
                    time.sleep(delay)
                
                translated = self.translate_text(text, from_lang, to_lang)
                results.append(translated)
                
            except TranslationError as e:
                print(f"翻译第{i+1}个文本时出错: {e}")
                results.append(f"[翻译失败: {e}]")
        
        return results
    
    def domain_translate(self, query: str, domain: str, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        领域翻译 - 针对特定领域的专业翻译（使用领域翻译API）
        
        Args:
            query: 待翻译的文本
            domain: 翻译领域（it/finance/medicine/mechanics等）
            from_lang: 源语言代码
            to_lang: 目标语言代码
        
        Returns:
            翻译结果字典
        
        Raises:
            TranslationError: 翻译过程中出现错误
        """
        try:
            # 首先尝试使用领域翻译API
            result = self.field_translate(query, domain, from_lang, to_lang)
            return result
        except TranslationError as e:
            print(f"领域翻译API失败 ({e})，回退到通用翻译API")
            # 回退到通用翻译，在查询中添加领域提示
            domain_hint = f"[{domain}领域翻译]"
            modified_query = f"{domain_hint} {query}"
            return self.translate(modified_query, from_lang, to_lang)
    
    def document_translate_async(self, content: str, format_type: str, filename: str, 
                                   from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        异步文档翻译 - 提交翻译任务
        
        Args:
            content: 文档内容（base64编码）
            format_type: 文档格式（doc/docx/pdf/txt/html等）
            filename: 文件名
            from_lang: 源语言代码
            to_lang: 目标语言代码
        
        Returns:
            翻译任务结果字典
        
        Raises:
            TranslationError: 翻译过程中出现错误
        """
        try:
            # 转换语言代码
            from_lang = TranslationAPIConfig.get_language_code(from_lang)
            to_lang = TranslationAPIConfig.get_language_code(to_lang)
            
            # 构建请求数据
            request_data = {
                "from": from_lang,
                "to": to_lang,
                "input": {
                    "content": content,
                    "format": format_type.lower(),
                    "filename": filename,
                    "transImage": 0,  # 不翻译图片中的文字
                    "needIntervene": 0  # 不使用自定义术语库
                },
                "output": {
                    "format": format_type.lower()  # 输出格式与输入格式相同
                }
            }
            
            # 生成时间戳和签名
            timestamp = int(time.time())
            body = json.dumps(request_data, separators=(',', ':'))
            sign = self._generate_doc_sign(body, timestamp)
            
            # 构建请求头
            headers = {
                'Content-Type': 'application/json',
                'X-Appid': self.app_id,
                'X-Sign': sign,
                'X-Timestamp': str(timestamp)
            }
            
            # 发送请求
            url = f"{self.doc_translate_base_url}/createjob/trans"
            
            response = requests.post(
                url=url,
                json=request_data,
                headers=headers,
                timeout=self.timeout
            )
            
            # 处理响应
            if response.status_code != 200:
                raise TranslationError(f"文档翻译API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            # 检查API返回的错误
            if result.get('code') != 0:
                error_msg = result.get('msg', '未知错误')
                raise TranslationError(f"文档翻译API错误: {error_msg}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise TranslationError(f"文档翻译网络请求错误: {str(e)}")
        except json.JSONDecodeError as e:
            raise TranslationError(f"文档翻译响应解析错误: {str(e)}")
        except Exception as e:
            raise TranslationError(f"文档翻译过程发生错误: {str(e)}")
    
    def query_translate_progress(self, request_id: int) -> Dict:
        """
        查询文档翻译进度
        
        Args:
            request_id: 翻译任务ID
        
        Returns:
            翻译进度结果字典
        """
        try:
            # 构建请求数据
            request_data = {"requestId": request_id}
            
            # 生成时间戳和签名
            timestamp = int(time.time())
            body = json.dumps(request_data, separators=(',', ':'))
            sign = self._generate_doc_sign(body, timestamp)
            
            # 构建请求头
            headers = {
                'Content-Type': 'application/json',
                'X-Appid': self.app_id,
                'X-Sign': sign,
                'X-Timestamp': str(timestamp)
            }
            
            # 发送请求
            url = f"{self.doc_translate_base_url}/query/trans"
            
            response = requests.post(
                url=url,
                json=request_data,
                headers=headers,
                timeout=self.timeout
            )
            
            # 处理响应
            if response.status_code != 200:
                raise TranslationError(f"查询翻译进度API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            # 检查API返回的错误
            if result.get('code') != 0:
                error_msg = result.get('msg', '未知错误')
                raise TranslationError(f"查询翻译进度API错误: {error_msg}")
            
            return result
            
        except requests.exceptions.RequestException as e:
            raise TranslationError(f"查询翻译进度网络请求错误: {str(e)}")
        except json.JSONDecodeError as e:
            raise TranslationError(f"查询翻译进度响应解析错误: {str(e)}")
        except Exception as e:
            raise TranslationError(f"查询翻译进度过程发生错误: {str(e)}")

    def image_translate(self, image_data: bytes, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        图片翻译 - 识别图片中的文字并翻译
        
        Args:
            image_data: 图片数据（字节）
            from_lang: 源语言代码
            to_lang: 目标语言代码
            
        Returns:
            翻译结果字典
            
        Raises:
            TranslationError: 翻译过程中出现错误
        """
        try:
            import hashlib
            import json
            
            # 检查图片大小（4MB限制）
            if len(image_data) > 4 * 1024 * 1024:
                raise TranslationError("图片大小不能超过4MB")
            
            # 转换语言代码
            from_lang = TranslationAPIConfig.get_language_code(from_lang)
            to_lang = TranslationAPIConfig.get_language_code(to_lang)
            
            # 生成图片MD5
            image_md5 = hashlib.md5(image_data).hexdigest()
            
            # 生成盐值
            salt = str(random.randint(32768, 65536))
            
            # 生成签名：sign = md5(appid+md5(image)+salt+cuid+mac+密钥)
            cuid = "APICUID"
            mac = "mac"
            sign_str = f"{self.app_id}{image_md5}{salt}{cuid}{mac}{self.app_key}"
            sign = hashlib.md5(sign_str.encode('utf-8')).hexdigest()
            
            # 调试信息
            print(f"调试：图片翻译 从 {from_lang} 到 {to_lang}")
            print(f"调试：AppID={self.app_id}, Salt={salt}, ImageMD5={image_md5[:10]}...")
            print(f"调试：Sign={sign[:10]}...")
            
            # 准备请求数据
            url = "https://fanyi-api.baidu.com/api/trans/sdk/picture"
            
            # 构建参数
            params = {
                'from': from_lang,
                'to': to_lang,
                'appid': self.app_id,
                'salt': salt,
                'cuid': cuid,
                'mac': mac,
                'version': '3',
                'sign': sign,
                'paste': '0'  # 关闭文字贴合
            }
            
            # 构建文件数据
            files = {
                'image': ('image.jpg', image_data, 'image/jpeg')
            }
            
            # 发送请求
            response = requests.post(
                url=url,
                params=params,
                files=files,
                timeout=30
            )
            
            print(f"调试：图片翻译响应状态：{response.status_code}")
            
            if response.status_code != 200:
                raise TranslationError(f"API请求失败，状态码: {response.status_code}")
            
            # 解析响应
            result = response.json()
            print(f"调试：图片翻译响应：{json.dumps(result, ensure_ascii=False)[:200]}...")
            
            # 检查错误
            if 'error_code' in result and result['error_code'] != '0':
                error_msg = result.get('error_msg', '未知错误')
                raise TranslationError(f"图片翻译失败: {error_msg} (错误码: {result['error_code']})")
            
            # 返回成功结果
            return {
                'success': True,
                'data': result.get('data', {}),
                'method': 'baidu_image'
            }
            
        except requests.exceptions.RequestException as e:
            print(f"调试：图片翻译网络错误：{str(e)}")
            raise TranslationError(f"网络请求失败: {str(e)}")
        except Exception as e:
            print(f"调试：图片翻译错误：{str(e)}")
            raise TranslationError(f"图片翻译失败: {str(e)}")
    
    def api_translate_via_dify(self, text: str, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        通过Dify API进行翻译 - 使用对话模式
        
        Args:
            text: 待翻译的文本
            from_lang: 源语言
            to_lang: 目标语言
            
        Returns:
            翻译结果字典
        """
        try:
            # 构建翻译提示
            lang_names = {
                'auto': '自动检测',
                'zh': '中文',
                'en': '英文',
                'ja': '日文',
                'ko': '韩文',
                'fr': '法文',
                'de': '德文',
                'es': '西班牙文',
                'it': '意大利文',
                'ru': '俄文'
            }
            
            from_lang_name = lang_names.get(from_lang, from_lang)
            to_lang_name = lang_names.get(to_lang, to_lang)
            
            prompt = f"请将以下{from_lang_name}文本翻译成{to_lang_name}，要求准确、自然、流畅：\n\n{text}"
            
            # 调用Dify API
            headers = DifyAPIConfig.get_chat_headers()
            data = {
                "inputs": {},
                "query": prompt,
                "response_mode": "blocking",
                "conversation_id": "",
                "user": "translation_user"
            }
            
            response = requests.post(
                DifyAPIConfig.get_full_url('chat_messages'),
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code != 200:
                raise TranslationError(f"Dify API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            if 'answer' in result:
                return {
                    'success': True,
                    'translated_text': result['answer'],
                    'from_lang': from_lang,
                    'to_lang': to_lang,
                    'method': 'dify_api'
                }
            else:
                raise TranslationError("Dify API返回格式异常")
                
        except requests.exceptions.RequestException as e:
            raise TranslationError(f"网络请求错误: {str(e)}")
        except json.JSONDecodeError as e:
            raise TranslationError(f"响应解析错误: {str(e)}")
        except Exception as e:
            raise TranslationError(f"API翻译过程发生错误: {str(e)}")


class DocumentProcessor:
    """文献处理器 - 提供翻译、语法检查、总结、改写优化功能"""
    
    def __init__(self):
        """初始化文献处理器"""
        self.translator = BaiduTranslator()
        self.feature_order = TranslationAPIConfig.TRANSLATION_FEATURES['feature_order']
    
    def translate_document(self, text: str, from_lang: str = 'auto', to_lang: str = 'zh', 
                          scenario: str = 'general') -> Dict:
        """
        翻译文档
        
        Args:
            text: 待翻译的文档文本
            from_lang: 源语言
            to_lang: 目标语言
            scenario: 翻译场景（academic/business/technical/general）
        
        Returns:
            包含翻译结果的字典
        """
        try:
            # 获取场景配置
            scenario_config = TranslationAPIConfig.TRANSLATION_SCENARIOS.get(
                scenario, TranslationAPIConfig.TRANSLATION_SCENARIOS['general']
            )
            
            # 根据配置选择翻译提供商
            if TranslationAPIConfig.CURRENT_PROVIDER == "dify":
                # 直接使用Dify API翻译
                dify_result = self.translator.api_translate_via_dify(text, from_lang, to_lang)
                if dify_result.get('success') and 'translated_text' in dify_result:
                    translated_text = dify_result['translated_text']
                else:
                    raise TranslationError("Dify API翻译失败")
            else:
                # 使用百度翻译（带回退机制）
                translated_text = self.translator.translate_text(text, from_lang, to_lang)
            
            return {
                'success': True,
                'original_text': text,
                'translated_text': translated_text,
                'from_lang': from_lang,
                'to_lang': to_lang,
                'scenario': scenario_config['name'],
                'provider': TranslationAPIConfig.CURRENT_PROVIDER,
                'timestamp': time.time()
            }
            
        except TranslationError as e:
            return {
                'success': False,
                'error': str(e),
                'original_text': text
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"翻译过程发生未知错误: {str(e)}",
                'original_text': text
            }
    
    def check_grammar(self, text: str) -> Dict:
        """
        语法检查（基于翻译API实现简单的语法检查）
        
        Args:
            text: 待检查的文本
        
        Returns:
            语法检查结果
        """
        try:
            # 通过往返翻译检查语法
            # 原文 -> 英文 -> 原语言，比较差异
            if not text.strip():
                return {'success': False, 'error': '文本为空'}
            
            # 检测原文语言
            detect_result = self.translator.translate(text[:100])  # 只用前100字符检测
            if 'trans_result' not in detect_result:
                return {'success': False, 'error': '无法检测语言'}
            
            # 简单的语法检查建议
            suggestions = []
            
            # 检查常见问题
            if '。。' in text or '，，' in text:
                suggestions.append('发现连续标点符号，建议检查')
            
            if text.count('(') != text.count(')'):
                suggestions.append('括号不匹配')
            
            if text.count('"') % 2 != 0:
                suggestions.append('引号不匹配')
            
            return {
                'success': True,
                'text': text,
                'suggestions': suggestions,
                'grammar_score': max(0, 100 - len(suggestions) * 20),  # 简单评分
                'timestamp': time.time()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'语法检查失败: {str(e)}'
            }
    
    def summarize_text(self, text: str, max_length: int = 200) -> Dict:
        """
        文本总结 - 使用Dify服务DeepSeek
        
        Args:
            text: 待总结的文本
            max_length: 总结最大长度
        
        Returns:
            总结结果
        """
        try:
            # 构建总结提示词
            prompt = f"请对以下文本进行智能总结，要求简明扼要，不超过{max_length}字：\n\n{text}"
            
            # 调用Dify API
            headers = DifyAPIConfig.get_chat_headers()
            data = {
                "inputs": {},
                "query": prompt,
                "response_mode": "blocking",
                "conversation_id": "",
                "user": "summary_user"
            }
            
            response = requests.post(
                DifyAPIConfig.get_full_url('chat_messages'),
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code != 200:
                raise TranslationError(f"Dify API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            if 'answer' in result:
                summary = result['answer'].strip()
                return {
                    'success': True,
                    'original_length': len(text),
                    'summary': summary,
                    'summary_length': len(summary),
                    'compression_ratio': len(summary) / len(text) if text else 0,
                    'method': 'dify_deepseek',
                    'timestamp': time.time()
                }
            else:
                raise TranslationError("Dify API返回格式异常")
            
        except Exception as e:
            return {
                'success': False,
                'error': f'总结失败: {str(e)}'
            }
    
    def rewrite_text(self, text: str, style: str = 'formal') -> Dict:
        """
        改写优化文本 - 使用Dify服务DeepSeek
        
        Args:
            text: 待改写的文本
            style: 改写风格（formal/casual/academic/business）
        
        Returns:
            改写结果
        """
        try:
            # 构建改写提示词
            style_descriptions = {
                'formal': '正式、礼貌、专业',
                'casual': '轻松、自然、口语化',
                'academic': '学术性、严谨、客观',
                'business': '商务、简洁、高效'
            }
            
            style_desc = style_descriptions.get(style, '正式、专业')
            prompt = f"请将以下文本改写为{style_desc}的风格，保持原意不变，使表达更加优雅得体：\n\n{text}"
            
            # 调用Dify API
            headers = DifyAPIConfig.get_chat_headers()
            data = {
                "inputs": {},
                "query": prompt,
                "response_mode": "blocking",
                "conversation_id": "",
                "user": "rewrite_user"
            }
            
            response = requests.post(
                DifyAPIConfig.get_full_url('chat_messages'),
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code != 200:
                raise TranslationError(f"Dify API请求失败，状态码: {response.status_code}")
            
            result = response.json()
            
            if 'answer' in result:
                rewritten_text = result['answer'].strip()
                return {
                    'success': True,
                    'original_text': text,
                    'rewritten_text': rewritten_text,
                    'style': style,
                    'style_description': style_desc,
                    'method': 'dify_deepseek',
                    'timestamp': time.time()
                }
            else:
                raise TranslationError("Dify API返回格式异常")
            
        except Exception as e:
            return {
                'success': False,
                'error': f'改写失败: {str(e)}'
            }
    
    def process_document_complete(self, text: str, **kwargs) -> Dict:
        """
        完整的文档处理流程：翻译 -> 语法检查 -> 总结 -> 改写优化
        
        Args:
            text: 待处理的文档文本
            **kwargs: 其他参数
        
        Returns:
            完整处理结果
        """
        results = {
            'original_text': text,
            'processing_steps': [],
            'timestamp': time.time()
        }
        
        # 按配置的顺序执行功能
        for feature in self.feature_order:
            try:
                if feature == 'translation' and TranslationAPIConfig.TRANSLATION_FEATURES['enable_translation']:
                    from_lang = kwargs.get('from_lang', 'auto')
                    to_lang = kwargs.get('to_lang', 'zh')
                    scenario = kwargs.get('scenario', 'general')
                    
                    result = self.translate_document(text, from_lang, to_lang, scenario)
                    results['processing_steps'].append({
                        'step': 'translation',
                        'result': result
                    })
                    
                    # 如果翻译成功，使用翻译后的文本进行后续处理
                    if result['success']:
                        text = result['translated_text']
                
                elif feature == 'grammar_check' and TranslationAPIConfig.TRANSLATION_FEATURES['enable_grammar_check']:
                    result = self.check_grammar(text)
                    results['processing_steps'].append({
                        'step': 'grammar_check',
                        'result': result
                    })
                
                elif feature == 'summary' and TranslationAPIConfig.TRANSLATION_FEATURES['enable_summary']:
                    max_length = kwargs.get('summary_length', 200)
                    result = self.summarize_text(text, max_length)
                    results['processing_steps'].append({
                        'step': 'summary',
                        'result': result
                    })
                
                elif feature == 'rewrite' and TranslationAPIConfig.TRANSLATION_FEATURES['enable_rewrite']:
                    style = kwargs.get('rewrite_style', 'formal')
                    result = self.rewrite_text(text, style)
                    results['processing_steps'].append({
                        'step': 'rewrite',
                        'result': result
                    })
                    
            except Exception as e:
                results['processing_steps'].append({
                    'step': feature,
                    'result': {
                        'success': False,
                        'error': f'{feature}处理失败: {str(e)}'
                    }
                })
        
        return results
    
    def domain_translate(self, text: str, domain: str, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        领域翻译功能
        
        Args:
            text: 待翻译的文本
            domain: 翻译领域
            from_lang: 源语言
            to_lang: 目标语言
            
        Returns:
            领域翻译结果字典
        """
        try:
            result = self.translator.domain_translate(text, domain, from_lang, to_lang)
            
            if 'trans_result' in result and result['trans_result']:
                translated_text = '\n'.join([item['dst'] for item in result['trans_result']])
                
                return {
                    'success': True,
                    'translated_text': translated_text,
                    'original_text': text,
                    'from_lang': result.get('from', from_lang),
                    'to_lang': result.get('to', to_lang),
                    'domain': domain,
                    'method': 'baidu_domain'
                }
            else:
                raise TranslationError("领域翻译结果为空")
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def image_translate(self, image_data: bytes, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        图片翻译功能
        
        Args:
            image_data: 图片数据
            from_lang: 源语言
            to_lang: 目标语言
            
        Returns:
            图片翻译结果字典
        """
        try:
            result = self.translator.image_translate(image_data, from_lang, to_lang)
            
            if result['success'] and 'data' in result:
                data = result['data']
                
                # 处理百度图片翻译返回的内容
                translated_texts = []
                original_texts = []
                
                # 检查是否有分段内容
                if 'content' in data and isinstance(data['content'], list):
                    for item in data['content']:
                        if 'dst' in item and 'src' in item:
                            translated_texts.append(item['dst'])
                            original_texts.append(item['src'])
                
                # 如果有整体翻译结果
                sum_src = data.get('sumSrc', '')
                sum_dst = data.get('sumDst', '')
                
                return {
                    'success': True,
                    'translated_texts': translated_texts if translated_texts else [sum_dst] if sum_dst else [],
                    'original_texts': original_texts if original_texts else [sum_src] if sum_src else [],
                    'from_lang': data.get('from', from_lang),
                    'to_lang': data.get('to', to_lang),
                    'method': 'baidu_image',
                    'content_details': data.get('content', []),  # 详细的分段信息
                    'sum_src': sum_src,
                    'sum_dst': sum_dst
                }
            else:
                error_msg = result.get('error', '图片翻译结果为空')
                return {'success': False, 'error': error_msg}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def api_translate(self, text: str, from_lang: str = 'auto', to_lang: str = 'zh') -> Dict:
        """
        API翻译功能（通过Dify对话）
        
        Args:
            text: 待翻译的文本
            from_lang: 源语言
            to_lang: 目标语言
            
        Returns:
            API翻译结果字典
        """
        try:
            result = self.translator.api_translate_via_dify(text, from_lang, to_lang)
            return result
                
        except Exception as e:
            return {'success': False, 'error': str(e)}


# 全局实例
translator = BaiduTranslator()
document_processor = DocumentProcessor()


def quick_translate(text: str, from_lang: str = 'auto', to_lang: str = 'zh') -> str:
    """
    快速翻译接口
    
    Args:
        text: 待翻译文本
        from_lang: 源语言
        to_lang: 目标语言
    
    Returns:
        翻译结果
    """
    return translator.translate_text(text, from_lang, to_lang)


def get_supported_languages() -> Dict[str, str]:
    """
    获取支持的语言列表
    
    Returns:
        语言代码和名称的映射字典
    """
    language_names = {
        'auto': '自动检测',
        'zh': '中文（简体）',
        'cht': '中文（繁体）',
        'en': '英语',
        'jp': '日语',
        'kor': '韩语',
        'fra': '法语',
        'de': '德语',
        'spa': '西班牙语',
        'it': '意大利语',
        'ru': '俄语',
        'pt': '葡萄牙语',
        'ara': '阿拉伯语',
        'th': '泰语',
        'vie': '越南语'
    }
    
    supported_codes = TranslationAPIConfig.get_supported_languages()
    return {code: language_names.get(TranslationAPIConfig.get_language_code(code), code) 
            for code in supported_codes}


if __name__ == '__main__':
    # 测试代码
    test_text = "Hello World! This is a test document for translation."
    
    print("测试翻译功能:")
    try:
        result = quick_translate(test_text, 'en', 'zh')
        print(f"原文: {test_text}")
        print(f"译文: {result}")
    except TranslationError as e:
        print(f"翻译失败: {e}")
    
    print("\n支持的语言:")
    for code, name in get_supported_languages().items():
        print(f"  {code}: {name}") 