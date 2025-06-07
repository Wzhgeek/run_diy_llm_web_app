#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dify智能助手Web应用配置文件
包含所有API配置和应用设置
"""

import os

# =============================================================================
# 应用基础配置
# =============================================================================

class AppConfig:
    """应用基础配置"""
    # Flask应用配置
    SECRET_KEY = 'dify_web_app_secret_key_2024'
    DEBUG = True
    HOST = '0.0.0.0'
    PORT = 8888
    
    # 文件上传配置
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB限制
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'md', 'html', 'png', 'jpg', 'jpeg', 'gif', 'webp'}

# =============================================================================
# Dify API配置
# =============================================================================

class DifyAPIConfig:
    """Dify API配置类"""
    
    # API基础设置
    # BASE_URL = "http://118.178.136.53:8080/v1"
    BASE_URL = "http://118.196.22.104/v1"
    TIMEOUT = 30  # 请求超时时间（秒）
    
    # API密钥配置
    # CHAT_API_KEY = "app-futiHwScj2oDAMsGDoA2mrZA"  # 聊天API密钥
    # DATASET_API_KEY = "dataset-sa32xiOz0KIG59fYXNMDxAHw"  # 知识库API密钥
    CHAT_API_KEY = "app-TsSl0xTEJKcKP10ONOobYNQX"  # 聊天API密钥
    DATASET_API_KEY = "dataset-ZRqkO8WqC0phHATJ2u3T6VZy"  # 知识库API密钥
    
    
    # API端点配置
    ENDPOINTS = {
        # 聊天相关
        'chat_messages': '/chat-messages',
        'conversations': '/conversations',
        'delete_conversation': '/conversations/{conversation_id}',
        'rename_conversation': '/conversations/{conversation_id}/name',
        'messages': '/messages',
        'files_upload': '/files/upload',
        'completion_messages': '/completion-messages',
        'stop_chat': '/chat-messages/{task_id}/stop',
        'completion_messages_stop': '/completion-messages/{task_id}/stop',
        'message_feedback': '/messages/{message_id}/feedbacks',
        'message_suggested': '/messages/{message_id}/suggested',
        
        # 工作流相关
        'workflows_run': '/workflows/run',
        'workflows_run_detail': '/workflows/run/{workflow_id}',
        'workflows_stop': '/workflows/{task_id}/stop',
        'workflows_logs': '/workflows/logs',
        
        # 知识库相关
        'datasets': '/datasets',
        'dataset_detail': '/datasets/{dataset_id}',
        'dataset_documents': '/datasets/{dataset_id}/documents',
        'dataset_document_detail': '/datasets/{dataset_id}/documents/{document_id}',
        'dataset_create_by_text': '/datasets/{dataset_id}/document/create_by_text',
        'dataset_create_by_file': '/datasets/{dataset_id}/document/create_by_file',
        'dataset_update_by_text': '/datasets/{dataset_id}/documents/{document_id}/update_by_text',
        'dataset_update_by_file': '/datasets/{dataset_id}/documents/{document_id}/update_by_file',
        'dataset_indexing_status': '/datasets/{dataset_id}/documents/{batch_id}/indexing-status',
        'dataset_retrieve': '/datasets/{dataset_id}/retrieve',
        'dataset_segments': '/datasets/{dataset_id}/documents/{document_id}/segments',
        'dataset_segment_detail': '/datasets/{dataset_id}/documents/{document_id}/segments/{segment_id}',
    }
    
    # 请求头配置
    @classmethod
    def get_chat_headers(cls):
        """获取聊天API请求头"""
        return {
            'Authorization': f'Bearer {cls.CHAT_API_KEY}',
            'Content-Type': 'application/json'
        }
    
    @classmethod
    def get_dataset_headers(cls):
        """获取知识库API请求头"""
        return {
            'Authorization': f'Bearer {cls.DATASET_API_KEY}',
            'Content-Type': 'application/json'
        }
    
    @classmethod
    def get_file_upload_headers(cls, api_type='chat'):
        """获取文件上传请求头"""
        api_key = cls.CHAT_API_KEY if api_type == 'chat' else cls.DATASET_API_KEY
        return {
            'Authorization': f'Bearer {api_key}'
        }
    
    @classmethod
    def get_full_url(cls, endpoint_key, **kwargs):
        """获取完整的API URL"""
        endpoint = cls.ENDPOINTS.get(endpoint_key, '')
        if kwargs:
            endpoint = endpoint.format(**kwargs)
        return f"{cls.BASE_URL}{endpoint}"

# =============================================================================
# 翻译API配置
# =============================================================================

class TranslationAPIConfig:
    """翻译API配置类 - 支持多种翻译服务提供商"""
    
    # 当前使用的翻译服务提供商（baidu/dify/google/tencent等）
    CURRENT_PROVIDER = "dify"  # 由于百度翻译IP白名单限制，默认使用Dify API
    
    # =============================================================================
    # 百度翻译API配置
    # 官方文档：https://api.fanyi.baidu.com/doc/21
    # =============================================================================
    BAIDU_CONFIG = {
        'app_id': '20250607002376039',  # 百度翻译APP ID
        'app_key': 'AsP5BitqawDJ1LgBWfXU',  # 百度翻译密钥
        'base_url': 'https://fanyi-api.baidu.com',  # 百度翻译API基础地址
        'translate_path': '/api/trans/vip/translate',  # 翻译接口路径
        'timeout': 10,  # 请求超时时间（秒）
        'max_query_length': 6000,  # 单次翻译最大字符数
    }
    
    # =============================================================================
    # 语言代码映射表（百度翻译支持的语言）
    # 完整列表参考：https://api.fanyi.baidu.com/doc/21
    # =============================================================================
    LANGUAGE_CODES = {
        # 中文相关
        'auto': 'auto',  # 自动检测
        'zh': 'zh',      # 中文
        'zh-cn': 'zh',   # 简体中文
        'zh-tw': 'cht',  # 繁体中文
        
        # 英语相关
        'en': 'en',      # 英语
        
        # 其他常用语言
        'ja': 'jp',      # 日语
        'ko': 'kor',     # 韩语
        'fr': 'fra',     # 法语
        'de': 'de',      # 德语
        'es': 'spa',     # 西班牙语
        'it': 'it',      # 意大利语
        'ru': 'ru',      # 俄语
        'pt': 'pt',      # 葡萄牙语
        'ar': 'ara',     # 阿拉伯语
        'th': 'th',      # 泰语
        'vi': 'vie',     # 越南语
    }
    
    # =============================================================================
    # 翻译功能配置
    # =============================================================================
    TRANSLATION_FEATURES = {
        'enable_translation': True,      # 启用翻译功能
        'enable_grammar_check': True,    # 启用语法检查
        'enable_summary': True,          # 启用总结功能
        'enable_rewrite': True,          # 启用改写优化功能
        
        # 默认翻译设置
        'default_from_lang': 'auto',     # 默认源语言（自动检测）
        'default_to_lang': 'zh',         # 默认目标语言（中文）
        
        # 功能顺序配置
        'feature_order': [
            'translation',      # 翻译
            'grammar_check',    # 语法检查
            'summary',          # 总结
            'rewrite'           # 改写优化
        ]
    }
    
    # =============================================================================
    # 预设翻译场景
    # =============================================================================
    TRANSLATION_SCENARIOS = {
        'academic': {
            'name': '学术文献',
            'description': '适用于学术论文、研究报告等专业文献的翻译',
            'style': 'formal',
            'terminology': 'academic'
        },
        'business': {
            'name': '商务文档',
            'description': '适用于商务合同、报告、邮件等商务文档的翻译',
            'style': 'formal',
            'terminology': 'business'
        },
        'technical': {
            'name': '技术文档',
            'description': '适用于技术手册、API文档等技术资料的翻译',
            'style': 'technical',
            'terminology': 'technical'
        },
        'general': {
            'name': '通用文本',
            'description': '适用于一般性文本的翻译',
            'style': 'normal',
            'terminology': 'general'
        }
    }
    
    # =============================================================================
    # 类方法
    # =============================================================================
    @classmethod
    def get_translation_headers(cls):
        """获取翻译API请求头"""
        return {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    
    @classmethod
    def set_provider(cls, provider: str):
        """设置翻译服务提供商"""
        if provider in ['baidu', 'dify']:
            cls.CURRENT_PROVIDER = provider
            print(f"翻译服务提供商已切换为: {provider.upper()}")
        else:
            print(f"不支持的翻译服务提供商: {provider}")
    
    @classmethod
    def get_provider_status(cls):
        """获取当前翻译服务提供商状态"""
        return {
            'current_provider': cls.CURRENT_PROVIDER,
            'available_providers': ['baidu', 'dify'],
            'note': 'baidu需要IP白名单配置，dify使用AI智能翻译'
        }
    
    @classmethod
    def get_translation_url(cls):
        """获取完整的翻译API URL"""
        config = cls.BAIDU_CONFIG
        return f"{config['base_url']}{config['translate_path']}"
    
    @classmethod
    def get_language_code(cls, lang):
        """获取语言代码"""
        return cls.LANGUAGE_CODES.get(lang.lower(), lang)
    
    @classmethod
    def is_translation_enabled(cls):
        """检查翻译功能是否启用"""
        return cls.TRANSLATION_FEATURES['enable_translation']
    
    @classmethod
    def get_max_query_length(cls):
        """获取单次翻译最大字符数"""
        return cls.BAIDU_CONFIG['max_query_length']
    
    @classmethod
    def get_supported_languages(cls):
        """获取支持的语言列表"""
        return list(cls.LANGUAGE_CODES.keys())

# =============================================================================
# 默认设置
# =============================================================================

class DefaultSettings:
    """默认设置"""
    
    # 聊天设置
    DEFAULT_USER_ID = "web-user"
    DEFAULT_RESPONSE_MODE = "streaming"
    DEFAULT_CONVERSATION_LIMIT = 20
    DEFAULT_MESSAGE_LIMIT = 20
    
    # 功能开关
    ENABLE_SUGGESTED_QUESTIONS = True  # 启用建议问题功能
    
    # 知识库设置
    DEFAULT_DATASET_PERMISSION = "only_me"
    DEFAULT_INDEXING_TECHNIQUE = "high_quality"
    DEFAULT_PROCESS_RULE_MODE = "automatic"
    DEFAULT_TOP_K = 3
    DEFAULT_SCORE_THRESHOLD = 0.5
    DEFAULT_SEARCH_METHOD = "semantic_search"
    
    # 分页设置
    DEFAULT_PAGE_SIZE = 20
    DEFAULT_PAGE = 1
    
    # 翻译设置
    DEFAULT_TRANSLATION_SCENARIO = "general"  # 默认翻译场景
    DEFAULT_TRANSLATION_BATCH_SIZE = 10      # 批量翻译时的批次大小

# =============================================================================
# 环境变量支持
# =============================================================================

class EnvConfig:
    """环境变量配置（可选）"""
    
    @staticmethod
    def load_from_env():
        """从环境变量加载配置（如果设置了的话）"""
        # 如果设置了环境变量，则覆盖默认配置
        if os.getenv('DIFY_API_BASE'):
            DifyAPIConfig.BASE_URL = os.getenv('DIFY_API_BASE')
        
        if os.getenv('DIFY_CHAT_API_KEY'):
            DifyAPIConfig.CHAT_API_KEY = os.getenv('DIFY_CHAT_API_KEY')
        
        if os.getenv('DIFY_DATASET_API_KEY'):
            DifyAPIConfig.DATASET_API_KEY = os.getenv('DIFY_DATASET_API_KEY')
        
        if os.getenv('APP_PORT'):
            AppConfig.PORT = int(os.getenv('APP_PORT'))
        
        if os.getenv('APP_DEBUG'):
            AppConfig.DEBUG = os.getenv('APP_DEBUG').lower() == 'true'
        
        # 翻译API环境变量支持
        if os.getenv('BAIDU_TRANSLATE_APP_ID'):
            TranslationAPIConfig.BAIDU_CONFIG['app_id'] = os.getenv('BAIDU_TRANSLATE_APP_ID')
        
        if os.getenv('BAIDU_TRANSLATE_APP_KEY'):
            TranslationAPIConfig.BAIDU_CONFIG['app_key'] = os.getenv('BAIDU_TRANSLATE_APP_KEY')
        
        if os.getenv('TRANSLATION_PROVIDER'):
            TranslationAPIConfig.CURRENT_PROVIDER = os.getenv('TRANSLATION_PROVIDER')

# =============================================================================
# 配置验证
# =============================================================================

class ConfigValidator:
    """配置验证器"""
    
    @staticmethod
    def validate():
        """验证配置是否完整"""
        errors = []
        
        # 验证API密钥
        if not DifyAPIConfig.CHAT_API_KEY:
            errors.append("聊天API密钥未配置")
        
        if not DifyAPIConfig.DATASET_API_KEY:
            errors.append("知识库API密钥未配置")
        
        # 验证URL
        if not DifyAPIConfig.BASE_URL:
            errors.append("API基础URL未配置")
        
        # 验证端口
        if not (1 <= AppConfig.PORT <= 65535):
            errors.append("端口号无效")
        
        # 验证翻译API配置（仅在启用翻译功能时）
        if TranslationAPIConfig.is_translation_enabled():
            if TranslationAPIConfig.CURRENT_PROVIDER == 'baidu':
                baidu_config = TranslationAPIConfig.BAIDU_CONFIG
                if not baidu_config['app_id']:
                    errors.append("百度翻译APP ID未配置")
                if not baidu_config['app_key']:
                    errors.append("百度翻译密钥未配置")
        
        if errors:
            raise ValueError(f"配置验证失败: {'; '.join(errors)}")
        
        return True

# =============================================================================
# 初始化配置
# =============================================================================

def init_config():
    """初始化配置"""
    # 加载环境变量（如果有的话）
    EnvConfig.load_from_env()
    
    # 验证配置
    ConfigValidator.validate()
    
    # 确保上传目录存在
    if not os.path.exists(AppConfig.UPLOAD_FOLDER):
        os.makedirs(AppConfig.UPLOAD_FOLDER)
    
    # 打印配置信息
    print("📋 配置信息:")
    print(f"   API地址: {DifyAPIConfig.BASE_URL}")
    print(f"   应用端口: {AppConfig.PORT}")
    print(f"   上传目录: {AppConfig.UPLOAD_FOLDER}")
    print(f"   最大文件大小: {AppConfig.MAX_CONTENT_LENGTH // (1024*1024)}MB")
    print(f"   支持文件类型: {', '.join(AppConfig.ALLOWED_EXTENSIONS)}")
    
    # 翻译功能配置信息
    if TranslationAPIConfig.is_translation_enabled():
        print(f"   翻译服务: {TranslationAPIConfig.CURRENT_PROVIDER.upper()}")
        print(f"   支持语言: {len(TranslationAPIConfig.get_supported_languages())}种")
        print(f"   翻译场景: {len(TranslationAPIConfig.TRANSLATION_SCENARIOS)}种")
    else:
        print("   翻译功能: 已禁用")
    
    print("✅ 配置初始化完成")

# 自动初始化（当导入此模块时）
if __name__ != '__main__':
    try:
        init_config()
    except Exception as e:
        print(f"❌ 配置初始化失败: {e}")
        raise 