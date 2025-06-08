#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Dify智能助手Web应用
主应用文件
"""

import os
import json
import uuid
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, stream_template
from werkzeug.utils import secure_filename
import requests
from datetime import datetime
import threading
import time

# 导入配置
from config import AppConfig, DifyAPIConfig, DefaultSettings
# 导入翻译功能
from translation_utils import document_processor, BaiduTranslator, quick_translate, get_supported_languages, TranslationError
import base64

app = Flask(__name__)
app.secret_key = AppConfig.SECRET_KEY

# Flask应用配置
app.config['UPLOAD_FOLDER'] = AppConfig.UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = AppConfig.MAX_CONTENT_LENGTH

class DifyAPIClient:
    """Dify API客户端类"""
    
    def __init__(self):
        self.base_url = DifyAPIConfig.BASE_URL
        self.timeout = DifyAPIConfig.TIMEOUT
        self.chat_headers = DifyAPIConfig.get_chat_headers()
        self.dataset_headers = DifyAPIConfig.get_dataset_headers()
    
    def chat_message(self, query, conversation_id="", user_id=None, files=None, inputs=None, stream=True):
        """发送聊天消息"""
        url = DifyAPIConfig.get_full_url('chat_messages')
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        response_mode = DefaultSettings.DEFAULT_RESPONSE_MODE if stream else "blocking"
        
        data = {
            "inputs": inputs or {},
            "query": query,
            "response_mode": response_mode,
            "conversation_id": conversation_id,
            "user": user_id
        }
        
        # 如果有文件，添加到files数组中
        if files and isinstance(files, list):
            data["files"] = files
        elif files and isinstance(files, dict):
            data["files"] = [files]
            
        try:
            response = requests.post(url, headers=self.chat_headers, json=data, stream=stream, timeout=self.timeout)
            response.raise_for_status()
            return response
        except Exception as e:
            return None
    
    def upload_file(self, file_path, user_id=None):
        """上传文件"""
        url = DifyAPIConfig.get_full_url('files_upload')
        headers = DifyAPIConfig.get_file_upload_headers('chat')
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        
        try:
            # 获取文件的MIME类型
            import mimetypes
            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                # 根据文件扩展名设置默认MIME类型
                file_ext = file_path.lower().split('.')[-1]
                mime_map = {
                    'png': 'image/png',
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'gif': 'image/gif',
                    'webp': 'image/webp',
                    'svg': 'image/svg+xml',
                    'pdf': 'application/pdf',
                    'txt': 'text/plain',
                    'md': 'text/markdown',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'csv': 'text/csv',
                    'html': 'text/html',
                    'xml': 'application/xml'
                }
                mime_type = mime_map.get(file_ext, 'application/octet-stream')
            
            with open(file_path, 'rb') as f:
                files = {'file': (os.path.basename(file_path), f, mime_type)}
                data = {'user': user_id}
                response = requests.post(url, headers=headers, files=files, data=data, timeout=self.timeout)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return None
    
    def completion_message(self, inputs, user_id=None, stream=True):
        """发送文本生成请求"""
        url = DifyAPIConfig.get_full_url('completion_messages')
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        response_mode = DefaultSettings.DEFAULT_RESPONSE_MODE if stream else "blocking"
        
        data = {
            "inputs": inputs,
            "response_mode": response_mode,
            "user": user_id
        }
        
        try:
            response = requests.post(url, headers=self.chat_headers, json=data, stream=stream, timeout=self.timeout)
            response.raise_for_status()
            return response
        except Exception as e:
            return None
    
    def get_conversations(self, user_id=None, limit=None):
        """获取会话列表"""
        url = DifyAPIConfig.get_full_url('conversations')
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        limit = limit or DefaultSettings.DEFAULT_CONVERSATION_LIMIT
        params = {"user": user_id, "limit": limit}
        
        try:
            response = requests.get(url, headers=self.chat_headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"data": [], "has_more": False}
    
    def get_messages(self, conversation_id, user_id=None, limit=None):
        """获取消息历史"""
        url = DifyAPIConfig.get_full_url('messages')
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        limit = limit or DefaultSettings.DEFAULT_MESSAGE_LIMIT
        params = {"user": user_id, "conversation_id": conversation_id, "limit": limit}
        
        try:
            response = requests.get(url, headers=self.chat_headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"data": [], "has_more": False}
    
    # 知识库相关API
    def get_datasets(self, page=None, limit=None):
        """获取知识库列表"""
        url = DifyAPIConfig.get_full_url('datasets')
        page = page or DefaultSettings.DEFAULT_PAGE
        limit = limit or DefaultSettings.DEFAULT_PAGE_SIZE
        params = {"page": page, "limit": limit}
        
        try:
            response = requests.get(url, headers=self.dataset_headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"data": [], "has_more": False}
    
    def create_dataset(self, name, description="", permission=None):
        """创建知识库"""
        url = DifyAPIConfig.get_full_url('datasets')
        permission = permission or DefaultSettings.DEFAULT_DATASET_PERMISSION
        data = {
            "name": name,
            "description": description,
            "permission": permission
        }
        
        try:
            print(f"创建知识库请求: {url}")
            print(f"请求数据: {data}")
            print(f"请求头: {self.dataset_headers}")
            
            response = requests.post(url, headers=self.dataset_headers, json=data, timeout=10)
            print(f"响应状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
            if response.status_code == 200 or response.status_code == 201:
                return response.json()
            else:
                print(f"API错误: {response.status_code} - {response.text}")
                return {"error": f"API错误: {response.status_code} - {response.text}"}
                
        except requests.exceptions.RequestException as e:
            print(f"请求异常: {e}")
            return {"error": f"请求失败: {str(e)}"}
        except Exception as e:
            print(f"其他异常: {e}")
            return {"error": f"未知错误: {str(e)}"}
    
    def create_document_by_text(self, dataset_id, name, text, indexing_technique=None):
        """通过文本创建文档"""
        url = DifyAPIConfig.get_full_url('dataset_create_by_text', dataset_id=dataset_id)
        indexing_technique = indexing_technique or DefaultSettings.DEFAULT_INDEXING_TECHNIQUE
        
        data = {
            "name": name,
            "text": text,
            "indexing_technique": indexing_technique,
            "process_rule": {"mode": DefaultSettings.DEFAULT_PROCESS_RULE_MODE}
        }
        
        try:
            print(f"创建文档请求: {url}")
            print(f"请求数据: {data}")
            print(f"请求头: {self.dataset_headers}")
            
            response = requests.post(url, headers=self.dataset_headers, json=data, timeout=self.timeout)
            print(f"响应状态码: {response.status_code}")
            print(f"响应内容: {response.text}")
            
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"创建文档异常: {e}")
            return None
    
    def create_document_by_file(self, dataset_id, file_path, name=None, indexing_technique=None):
        """通过文件创建文档"""
        url = DifyAPIConfig.get_full_url('dataset_create_by_file', dataset_id=dataset_id)
        headers = DifyAPIConfig.get_file_upload_headers('dataset')
        indexing_technique = indexing_technique or DefaultSettings.DEFAULT_INDEXING_TECHNIQUE
        
        try:
            with open(file_path, 'rb') as f:
                files = {'file': f}
                data = {
                    'data': json.dumps({
                        "name": name or os.path.basename(file_path),
                        "indexing_technique": indexing_technique,
                        "process_rule": {"mode": DefaultSettings.DEFAULT_PROCESS_RULE_MODE}
                    })
                }
                response = requests.post(url, headers=headers, files=files, data=data, timeout=self.timeout)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            return None
    
    def delete_dataset(self, dataset_id):
        """删除知识库"""
        url = DifyAPIConfig.get_full_url('dataset_detail', dataset_id=dataset_id)
        
        try:
            response = requests.delete(url, headers=self.dataset_headers, timeout=self.timeout)
            response.raise_for_status()
            return response.status_code == 204
        except Exception as e:
            return False
    
    def delete_document(self, dataset_id, document_id):
        """删除文档"""
        url = DifyAPIConfig.get_full_url('dataset_document_detail', dataset_id=dataset_id, document_id=document_id)
        
        try:
            response = requests.delete(url, headers=self.dataset_headers, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return None
    
    def get_documents(self, dataset_id, page=None, limit=None):
        """获取知识库文档列表"""
        url = DifyAPIConfig.get_full_url('dataset_documents', dataset_id=dataset_id)
        page = page or DefaultSettings.DEFAULT_PAGE
        limit = limit or DefaultSettings.DEFAULT_PAGE_SIZE
        params = {"page": page, "limit": limit}
        
        try:
            response = requests.get(url, headers=self.dataset_headers, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"data": [], "has_more": False}
    
    def get_document_indexing_status(self, dataset_id, batch_id):
        """获取文档嵌入状态"""
        url = DifyAPIConfig.get_full_url('dataset_indexing_status', dataset_id=dataset_id, batch_id=batch_id)
        
        try:
            response = requests.get(url, headers=self.dataset_headers, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"data": []}
    
    def retrieve_dataset(self, dataset_id, query, top_k=None, score_threshold=None):
        """检索知识库"""
        url = DifyAPIConfig.get_full_url('dataset_retrieve', dataset_id=dataset_id)
        top_k = top_k or DefaultSettings.DEFAULT_TOP_K
        score_threshold = score_threshold or DefaultSettings.DEFAULT_SCORE_THRESHOLD
        
        data = {
            "query": query,
            "retrieval_model": {
                "search_method": "keyword_search",
                "reranking_enable": False,
                "reranking_mode": None,
                "reranking_model": {
                    "reranking_provider_name": "",
                    "reranking_model_name": ""
                },
                "weights": None,
                "top_k": top_k,
                "score_threshold_enabled": score_threshold > 0,
                "score_threshold": score_threshold if score_threshold > 0 else None
            }
        }
        
        try:
            response = requests.post(url, headers=self.dataset_headers, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"records": []}

    def stop_chat_message(self, task_id, user_id=None):
        """停止聊天消息生成"""
        url = DifyAPIConfig.get_full_url('stop_chat', task_id=task_id)
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        data = {"user": user_id}
        
        try:
            response = requests.post(url, headers=self.chat_headers, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def delete_conversation(self, conversation_id, user_id=None):
        """删除会话"""
        url = DifyAPIConfig.get_full_url('delete_conversation', conversation_id=conversation_id)
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        data = {"user": user_id}
        
        try:
            response = requests.delete(url, headers=self.chat_headers, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}
    
    def rename_conversation(self, conversation_id, name, user_id=None):
        """重命名会话"""
        url = DifyAPIConfig.get_full_url('rename_conversation', conversation_id=conversation_id)
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        data = {"name": name, "user": user_id}
        
        try:
            response = requests.post(url, headers=self.chat_headers, json=data, timeout=self.timeout)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return {"error": str(e)}

    def get_suggested_questions(self, message_id, user_id=None):
        """获取下一轮建议问题"""
        url = DifyAPIConfig.get_full_url('message_suggested', message_id=message_id)
        user_id = user_id or DefaultSettings.DEFAULT_USER_ID
        params = {"user": user_id}
        
        try:
            print(f"🔍 请求建议问题API: {url}")
            print(f"📝 参数: {params}")
            print(f"🔑 请求头: {self.chat_headers}")
            
            response = requests.get(url, headers=self.chat_headers, params=params, timeout=self.timeout)
            print(f"📡 响应状态码: {response.status_code}")
            
            # 先打印响应内容用于调试
            response_text = response.text
            print(f"📄 响应内容: {response_text[:500]}")  # 只打印前500字符
            
            if response.status_code == 400:
                print("❌ 400错误可能原因:")
                print("  1. 消息ID不存在或无效")
                print("  2. API Key权限不足")
                print("  3. 建议问题功能未启用")
                print("  4. 参数格式错误")
                # 尝试解析错误响应
                try:
                    error_json = response.json()
                    print(f"  📋 错误详情: {error_json}")
                except:
                    print(f"  📋 错误响应: {response_text}")
                return {"data": [], "error": "建议问题功能暂时不可用"}
            
            response.raise_for_status()
            result = response.json()
            print(f"💡 建议问题响应: {result}")
            return result
            
        except requests.exceptions.HTTPError as e:
            print(f"❌ HTTP错误: {e}")
            return {"data": [], "error": f"HTTP错误: {e}"}
        except requests.exceptions.RequestException as e:
            print(f"❌ 请求错误: {e}")
            return {"data": [], "error": f"请求错误: {e}"}
        except Exception as e:
            print(f"❌ 获取建议问题失败: {e}")
            return {"data": [], "error": str(e)}

# 初始化API客户端
dify_client = DifyAPIClient()

def allowed_file(filename):
    """检查文件扩展名是否允许"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in AppConfig.ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/chat')
def chat():
    """聊天页面"""
    conversation_id = request.args.get('conversation_id', '')
    return render_template('chat.html', conversation_id=conversation_id)

@app.route('/api/chat', methods=['POST'])
def api_chat():
    """统一的聊天API"""
    try:
        data = request.json
        query = data.get('query', '')
        conversation_id = data.get('conversation_id', '')
        files = data.get('files', [])
        inputs = data.get('inputs', {})
        user_id = data.get('user', DefaultSettings.DEFAULT_USER_ID)
        
        # 处理文件列表（优先处理显式的files参数）
        processed_files = []
        if files:
            for file_info in files:
                processed_files.append({
                    "type": file_info.get("type", "document"),
                    "transfer_method": file_info.get("transfer_method", "local_file"),
                    "upload_file_id": file_info.get("upload_file_id")
                })
        
        # 处理inputs中的文件信息（按照新的格式）
        if inputs:
            # 处理图片文件
            if 'input_image' in inputs and inputs['input_image'].get('upload_file_id'):
                processed_files.append({
                    "type": inputs['input_image'].get('type', 'image'),
                    "transfer_method": inputs['input_image'].get('transfer_method', 'local_file'),
                    "upload_file_id": inputs['input_image']['upload_file_id']
                })
            
            # 处理其他类型文件
            if 'input_file' in inputs and inputs['input_file'].get('upload_file_id'):
                processed_files.append({
                    "type": inputs['input_file'].get('type', 'document'),
                    "transfer_method": inputs['input_file'].get('transfer_method', 'local_file'),
                    "upload_file_id": inputs['input_file']['upload_file_id']
                })
        
        response = dify_client.chat_message(
            query=query,
            conversation_id=conversation_id,
            user_id=user_id,
            files=processed_files if processed_files else None,
            inputs=inputs,
            stream=True
        )
        
        if response is None:
            return jsonify({"error": "API请求失败"}), 500
        
        def generate():
            try:
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            yield line_str + '\n\n'
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return app.response_class(generate(), mimetype='text/plain')
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conversations')
def api_get_conversations():
    """获取会话列表"""
    try:
        user_id = request.args.get('user', DefaultSettings.DEFAULT_USER_ID)
        limit = request.args.get('limit', DefaultSettings.DEFAULT_CONVERSATION_LIMIT)
        
        result = dify_client.get_conversations(user_id=user_id, limit=limit)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages')
def api_get_messages():
    """获取消息历史"""
    try:
        conversation_id = request.args.get('conversation_id', '')
        user_id = request.args.get('user', DefaultSettings.DEFAULT_USER_ID)
        limit = request.args.get('limit', DefaultSettings.DEFAULT_MESSAGE_LIMIT)
        
        if not conversation_id:
            return jsonify({"error": "缺少conversation_id参数"}), 400
        
        result = dify_client.get_messages(
            conversation_id=conversation_id,
            user_id=user_id,
            limit=limit
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def api_delete_conversation(conversation_id):
    """删除会话"""
    try:
        data = request.json or {}
        user_id = data.get('user', DefaultSettings.DEFAULT_USER_ID)
        
        result = dify_client.delete_conversation(conversation_id, user_id)
        if 'error' in result:
            return jsonify(result), 500
        return jsonify({"result": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conversations/<conversation_id>/name', methods=['POST'])
def api_rename_conversation(conversation_id):
    """重命名会话"""
    try:
        data = request.json
        name = data.get('name', '')
        user_id = data.get('user', DefaultSettings.DEFAULT_USER_ID)
        
        if not name:
            return jsonify({"error": "缺少name参数"}), 400
        
        result = dify_client.rename_conversation(conversation_id, name, user_id)
        if 'error' in result:
            return jsonify(result), 500
        return jsonify({"result": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/files/upload', methods=['POST'])
def api_upload_file():
    """文件上传API"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "没有文件"}), 400
        
        file = request.files['file']
        user_id = request.form.get('user', DefaultSettings.DEFAULT_USER_ID)
        
        if file.filename == '':
            return jsonify({"error": "没有选择文件"}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}_{filename}"
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            
            # 保存文件
            file.save(file_path)
            
            # 上传到Dify
            result = dify_client.upload_file(file_path, user_id)
            
            if result:
                return jsonify(result)
            else:
                return jsonify({"error": "上传到Dify失败"}), 500
        else:
            return jsonify({"error": "不支持的文件类型"}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chat-messages/<task_id>/stop', methods=['POST'])
def api_stop_chat(task_id):
    """停止聊天生成"""
    try:
        data = request.json or {}
        user_id = data.get('user', DefaultSettings.DEFAULT_USER_ID)
        
        result = dify_client.stop_chat_message(task_id, user_id)
        if 'error' in result:
            return jsonify(result), 500
        return jsonify({"result": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/messages/<message_id>/suggested', methods=['GET'])
def api_get_suggested_questions(message_id):
    """获取下一轮建议问题"""
    try:
        # 检查功能是否启用
        if not DefaultSettings.ENABLE_SUGGESTED_QUESTIONS:
            print("⚠️ 建议问题功能已禁用")
            return jsonify({"data": [], "message": "建议问题功能已禁用"}), 200
        
        user_id = request.args.get('user', DefaultSettings.DEFAULT_USER_ID)
        print(f"🎯 获取建议问题: message_id={message_id}, user_id={user_id}")
        
        result = dify_client.get_suggested_questions(message_id, user_id)
        
        # 如果结果中包含错误，但不是空数据，返回成功状态但提示功能不可用
        if "error" in result:
            print(f"⚠️ 建议问题功能暂不可用: {result.get('error')}")
            return jsonify({"data": [], "message": "建议问题功能暂时不可用"}), 200
            
        return jsonify(result), 200
    except Exception as e:
        print(f"❌ API路由错误: {e}")
        return jsonify({"error": str(e), "data": []}), 500

@app.route('/document')
def document():
    """文档处理页面"""
    return render_template('document.html')

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """上传文件，支持图片和文档格式"""
    if 'file' not in request.files:
        return jsonify({'error': '未选择文件'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未选择文件'}), 400
    
    # 检查文件扩展名
    filename = secure_filename(file.filename)
    if not allowed_file(filename):
        return jsonify({'error': '不支持的文件类型'}), 400
    
    file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    
    # 所有支持的文件类型都上传到Dify API
    image_extensions = {'png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'}
    document_extensions = {'txt', 'md', 'mdx', 'markdown', 'pdf', 'html', 'xlsx', 'xls', 'doc', 'docx', 'csv', 'xml', 'eml', 'msg', 'pptx', 'ppt', 'epub'}
    audio_extensions = {'mp3', 'm4a', 'wav', 'webm', 'amr'}
    video_extensions = {'mp4', 'mov', 'mpeg', 'mpga'}
    
    # 确定文件类型
    if file_extension in image_extensions:
        file_type = 'image'
    elif file_extension in document_extensions:
        file_type = 'document'
    elif file_extension in audio_extensions:
        file_type = 'audio'
    elif file_extension in video_extensions:
        file_type = 'video'
    else:
        file_type = 'custom'
    
    try:
        # 确保上传目录存在
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # 保存文件到上传目录
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # 检查文件大小 (50MB限制)
        file_size = os.path.getsize(filepath)
        if file_size > 50 * 1024 * 1024:
            os.remove(filepath)
            return jsonify({'error': '文件大小不能超过50MB'}), 400
        
        # 所有文件都上传到Dify API
        result = dify_client.upload_file(filepath)
        
        # 删除本地临时文件
        try:
            os.remove(filepath)
        except:
            pass
        
        if result:
            return jsonify({
                'success': True,
                'file_type': file_type,
                'file': {
                    'id': result.get('id'),
                    'name': result.get('name'),
                    'size': result.get('size'),
                    'extension': result.get('extension'),
                    'mime_type': result.get('mime_type'),
                    'type': file_type,
                    'transfer_method': 'local_file'
                }
            })
        else:
            return jsonify({'error': '文件上传到Dify失败'}), 500
            
    except Exception as e:
        # 删除临时文件
        try:
            if 'filepath' in locals():
                os.remove(filepath)
        except:
            pass
        return jsonify({'error': f'文件处理失败: {str(e)}'}), 500

@app.route('/api/document/process', methods=['POST'])
def process_document():
    """处理文档API - 集成多种翻译功能"""
    # 根据请求类型获取参数
    if request.content_type and 'multipart/form-data' in request.content_type:
        # FormData请求（图片翻译）
        task_type = request.form.get('type', 'translate')
        content = request.form.get('content', '')
        from_lang = request.form.get('from_lang', 'auto')
        to_lang = request.form.get('to_lang', 'zh')
        domain = request.form.get('domain', 'it')
        image_file = request.files.get('image')
    else:
        # JSON请求（其他类型）
        data = request.get_json()
        task_type = data.get('type', 'translate')
        content = data.get('content', '')
        from_lang = data.get('from_lang', 'auto')
        to_lang = data.get('to_lang', 'zh')
        domain = data.get('domain', 'it')
        image_file = None
    
    # 验证输入
    if task_type == 'image_translate':
        if not image_file:
            return jsonify({'error': '图片翻译需要上传图片文件'}), 400
        # 提前读取图片数据到内存，避免在生成器中访问已关闭的文件
        image_data = image_file.read()
        print(f"调试：预读取图片数据大小: {len(image_data)} 字节")
    else:
        if not content.strip():
            return jsonify({'error': '内容不能为空'}), 400
        image_data = None
    
    def generate():
        try:
            if task_type == 'translate':
                # 使用百度翻译API进行翻译
                try:
                    result = quick_translate(content, from_lang, to_lang)
                    response_data = {
                        'type': 'translation_result',
                        'content': result,
                        'full_content': result,
                        'from_lang': from_lang,
                        'to_lang': to_lang,
                        'original_content': content
                    }
                    yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                except TranslationError as e:
                    yield f"data: {json.dumps({'error': f'翻译失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'domain_translate':
                # 领域翻译
                try:
                    result = document_processor.domain_translate(content, domain, from_lang, to_lang)
                    if result['success']:
                        response_data = {
                            'type': 'domain_translation_result',
                            'content': result['translated_text'],
                            'full_content': result['translated_text'],
                            'from_lang': result['from_lang'],
                            'to_lang': result['to_lang'],
                            'domain': result['domain'],
                            'original_content': content
                        }
                        yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                        yield f"data: {json.dumps({'type': 'end'})}\n\n"
                    else:
                        error_msg = result.get('error', '未知错误')
                        yield f"data: {json.dumps({'error': f'领域翻译失败: {error_msg}'}, ensure_ascii=False)}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'领域翻译失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'image_translate':
                # 图片翻译
                try:
                    print(f"调试：开始处理图片翻译，数据大小: {len(image_data)} 字节")
                    
                    result = document_processor.image_translate(image_data, from_lang, to_lang)
                    if result['success']:
                        response_data = {
                            'type': 'image_translation_result',
                            'content': result,
                            'full_content': result,
                            'from_lang': result['from_lang'],
                            'to_lang': result['to_lang']
                        }
                        yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                        yield f"data: {json.dumps({'type': 'end'})}\n\n"
                    else:
                        error_msg = result.get('error', '未知错误')
                        yield f"data: {json.dumps({'error': f'图片翻译失败: {error_msg}'}, ensure_ascii=False)}\n\n"
                except Exception as e:
                    print(f"调试：图片翻译异常: {str(e)}")
                    yield f"data: {json.dumps({'error': f'图片翻译失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'document_translate':
                # 文档翻译（使用百度文档翻译API）
                try:
                    # 对于文本形式的文档翻译，我们使用百度的通用翻译API
                    # 因为百度文档翻译API主要用于文件上传的场景
                    result = quick_translate(content, from_lang, to_lang)
                    response_data = {
                        'type': 'document_translation_result',
                        'content': result,
                        'full_content': result,
                        'from_lang': from_lang,
                        'to_lang': to_lang,
                        'original_content': content,
                        'method': 'baidu_api'
                    }
                    yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                except TranslationError as e:
                    yield f"data: {json.dumps({'error': f'文档翻译失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'api_translate':
                # AI翻译（通过Dify）
                try:
                    result = document_processor.api_translate(content, from_lang, to_lang)
                    if result['success']:
                        response_data = {
                            'type': 'api_translation_result',
                            'content': result['translated_text'],
                            'full_content': result['translated_text'],
                            'from_lang': result['from_lang'],
                            'to_lang': result['to_lang'],
                            'method': result['method'],
                            'original_content': content
                        }
                        yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                        yield f"data: {json.dumps({'type': 'end'})}\n\n"
                    else:
                        error_msg = result.get('error', '未知错误')
                        yield f"data: {json.dumps({'error': f'AI翻译失败: {error_msg}'}, ensure_ascii=False)}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'AI翻译失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'complete':
                # 完整文档处理流程
                try:
                    result = document_processor.process_document_complete(
                        text=content,
                        from_lang=from_lang,
                        to_lang=to_lang,
                        summary_length=200,
                        rewrite_style='formal'
                    )
                    
                    # 分步骤返回结果
                    for step_info in result['processing_steps']:
                        step_name = step_info['step']
                        step_result = step_info['result']
                        
                        response_data = {
                            'type': 'processing_step',
                            'step': step_name,
                            'success': step_result['success'],
                            'content': step_result if step_result['success'] else {'error': step_result.get('error', '处理失败')},
                            'step_name_cn': {
                                'translation': '翻译',
                                'grammar_check': '语法检查', 
                                'summary': '总结',
                                'rewrite': '改写优化'
                            }.get(step_name, step_name)
                        }
                        yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                    
                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                    
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'文档处理失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'grammar_check':
                # 语法检查
                try:
                    result = document_processor.check_grammar(content)
                    response_data = {
                        'type': 'grammar_result',
                        'content': result,
                        'full_content': result
                    }
                    yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'语法检查失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'summary':
                # 文本总结
                try:
                    result = document_processor.summarize_text(content, max_length=200)
                    response_data = {
                        'type': 'summary_result',
                        'content': result,
                        'full_content': result
                    }
                    yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'总结失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            elif task_type == 'rewrite':
                # 改写优化
                try:
                    style = data.get('style', 'formal')
                    result = document_processor.rewrite_text(content, style)
                    response_data = {
                        'type': 'rewrite_result',
                        'content': result,
                        'full_content': result
                    }
                    yield f"data: {json.dumps(response_data, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                except Exception as e:
                    yield f"data: {json.dumps({'error': f'改写失败: {str(e)}'}, ensure_ascii=False)}\n\n"
                    return
                    
            else:
                # 不支持的类型，回退到原有的Dify API处理
                inputs = {
                    "query": f"请处理以下内容：\n\n{content}"
                }
                
                response = dify_client.completion_message(inputs, stream=True)
                if not response:
                    yield f"data: {json.dumps({'error': 'API请求失败'})}\n\n"
                    return
                
                current_answer = ""
                
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            try:
                                json_data = json.loads(line_str[6:])
                                
                                if 'answer' in json_data:
                                    current_answer += json_data.get('answer', '')
                                    response_data = {
                                        'type': 'message',
                                        'content': json_data.get('answer', ''),
                                        'full_content': current_answer
                                    }
                                    yield f"data: {json.dumps(response_data)}\n\n"
                                    
                                elif json_data.get('event') == 'message_end':
                                    yield f"data: {json.dumps({'type': 'end'})}\n\n"
                                    
                            except json.JSONDecodeError:
                                continue
                                
        except Exception as e:
            yield f"data: {json.dumps({'error': f'处理失败: {str(e)}'}, ensure_ascii=False)}\n\n"
    
    return app.response_class(generate(), mimetype='text/plain')

@app.route('/api/translation/languages', methods=['GET'])
def get_translation_languages():
    """获取支持的翻译语言列表API"""
    try:
        languages = get_supported_languages()
        return jsonify({
            'success': True,
            'languages': languages,
            'count': len(languages)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'获取语言列表失败: {str(e)}'
        }), 500



@app.route('/api/translation/provider', methods=['GET'])
def get_translation_provider():
    """获取当前翻译服务提供商状态API"""
    try:
        from config import TranslationAPIConfig, DifyAPIConfig
        status = TranslationAPIConfig.get_provider_status()
        
        # 检测Dify后端实际使用的模型
        actual_model = "unknown"
        api_type = "dify"
        
        if status['current_provider'] == 'dify':
            # 通过API URL或配置推断实际使用的模型
            api_url = DifyAPIConfig.BASE_URL
            api_key = DifyAPIConfig.CHAT_API_KEY
            
            # 根据不同的线索判断模型类型
            if "deepseek" in api_key.lower() or "deepseek" in api_url.lower():
                actual_model = "deepseek"
                api_type = "deepseek"
            elif "118.196.22.104" in api_url:
                # 这个IP通常部署deepseek模型
                actual_model = "deepseek"
                api_type = "deepseek"
            else:
                # 尝试通过API响应判断
                try:
                    # 发送一个简单的测试请求
                    headers = DifyAPIConfig.get_chat_headers()
                    data = {
                        "inputs": {},
                        "query": "hello",
                        "response_mode": "blocking",
                        "conversation_id": "",
                        "user": "test_user"
                    }
                    
                    response = requests.post(
                        DifyAPIConfig.get_full_url('chat_messages'),
                        headers=headers,
                        json=data,
                        timeout=5
                    )
                    
                    if response.status_code == 200:
                        # 检查响应头或响应体中的模型信息
                        response_data = response.json()
                        if "deepseek" in str(response_data).lower():
                            actual_model = "deepseek"
                            api_type = "deepseek"
                        else:
                            actual_model = "dify"
                            api_type = "dify"
                    
                except Exception:
                    # 如果检测失败，使用默认值
                    actual_model = "dify"
                    api_type = "dify"
        
        # 更新状态信息
        status['actual_model'] = actual_model
        status['api_type'] = api_type
        status['api_url'] = DifyAPIConfig.BASE_URL
        
        return jsonify({
            'success': True,
            'provider': status
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'获取翻译提供商状态失败: {str(e)}'
        }), 500

@app.route('/api/translation/test_ip', methods=['GET'])
def test_translation_ip():
    """测试当前服务器IP和百度翻译连接"""
    try:
        import requests
        
        # 获取服务器公网IP
        try:
            # 尝试多个IP获取服务
            for url in ['https://api.ipify.org', 'https://ifconfig.me', 'https://httpbin.org/ip']:
                try:
                    ip_response = requests.get(url, timeout=5)
                    if url == 'https://httpbin.org/ip':
                        server_ip = ip_response.json()['origin']
                    else:
                        server_ip = ip_response.text.strip()
                    break
                except:
                    continue
            else:
                server_ip = "无法获取"
        except:
            server_ip = "无法获取"
        
        # 测试百度翻译API连接
        test_url = "https://fanyi-api.baidu.com/api/trans/vip/translate"
        try:
            test_response = requests.head(test_url, timeout=10)
            api_accessible = test_response.status_code in [200, 405]  # 405也表示可访问，只是方法不对
        except:
            api_accessible = False
        
        return jsonify({
            'server_ip': server_ip,
            'api_accessible': api_accessible,
            'baidu_translate_url': test_url,
            'note': '如果图片翻译出现58000错误，需要将服务器IP添加到百度翻译控制台的IP白名单中'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/translation/domains', methods=['GET'])
def get_translation_domains():
    """获取翻译领域列表API"""
    try:
        from config import TranslationAPIConfig
        domains = TranslationAPIConfig.TRANSLATION_DOMAINS
        
        return jsonify({
            'success': True,
            'domains': domains
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'获取翻译领域失败: {str(e)}'
        }), 500

@app.route('/api/translation/document/upload', methods=['POST'])
def upload_document_for_translation():
    """上传文档进行翻译"""
    try:
        # 检查是否有文件上传
        if 'file' not in request.files:
            return jsonify({'error': '没有上传文件'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '文件名为空'}), 400
        
        # 获取翻译参数
        from_lang = request.form.get('from_lang', 'auto')
        to_lang = request.form.get('to_lang', 'zh')
        
        # 读取文件内容并进行base64编码
        file_content = file.read()
        file_base64 = base64.b64encode(file_content).decode('utf-8')
        
        # 获取文件格式
        filename = file.filename
        file_ext = filename.split('.')[-1].lower()
        
        # 检查文件格式是否支持
        supported_formats = ['doc', 'docx', 'pdf', 'txt', 'html', 'htm', 'xls', 'xlsx', 'ppt', 'pptx', 'xml']
        if file_ext not in supported_formats:
            return jsonify({'error': f'不支持的文件格式: {file_ext}'}), 400
        
        # 提交文档翻译任务
        translator = BaiduTranslator()
        result = translator.document_translate_async(
            content=file_base64,
            format_type=file_ext,
            filename=filename,
            from_lang=from_lang,
            to_lang=to_lang
        )
        
        return jsonify({
            'success': True,
            'request_id': result['data']['requestId'],
            'message': '文档翻译任务已提交，请稍后查询翻译进度'
        })
        
    except Exception as e:
        return jsonify({'error': f'文档上传翻译失败: {str(e)}'}), 500

@app.route('/api/translation/document/progress/<int:request_id>', methods=['GET'])
def query_document_translation_progress(request_id):
    """查询文档翻译进度"""
    try:
        translator = BaiduTranslator()
        result = translator.query_translate_progress(request_id)
        
        return jsonify({
            'success': True,
            'data': result['data']
        })
        
    except Exception as e:
        return jsonify({'error': f'查询翻译进度失败: {str(e)}'}), 500

@app.route('/knowledge')
def knowledge():
    """知识库管理页面"""
    return render_template('knowledge.html')

@app.route('/user-guide')
def user_guide():
    """使用文档页面 - 使用前端marked.js渲染"""
    try:
        # 读取markdown文档内容
        doc_path = os.path.join('docs', 'user_guide.md')
        with open(doc_path, 'r', encoding='utf-8') as f:
            markdown_content = f.read()
        
        # 将markdown内容传递给前端，由marked.js进行渲染
        return render_template('user_guide.html', markdown_content=markdown_content)
        
    except Exception as e:
        print(f"文档加载错误: {e}")
        # 如果文档读取失败，返回基本的markdown格式说明
        fallback_markdown = """# 📚 AI学术研究助手使用文档

## 🚀 快速开始

欢迎使用AI学术研究助手！这是一个基于Dify ChatFlow API的智能学术研究平台。

### 主要功能

- **AI智能对话：** 支持多轮对话、图片识别、专业学术问答
- **文献处理：** 提供翻译、总结、改写、语法检查等功能  
- **知识库管理：** 构建和管理学术资料知识库

### 使用方式

1. 点击左侧导航栏选择相应功能模块
2. 在AI对话中输入问题获得专业回答
3. 上传文档进行智能处理
4. 管理知识库构建个人学术资源

## 📞 联系支持

如果您在使用过程中遇到问题，请通过以下方式联系我们：

- 📧 邮箱：support@example.com
- 📱 电话：400-123-4567
- 💬 在线客服：点击右下角客服图标

> **提示：** 文档内容正在加载中，请稍后刷新页面查看完整内容。
"""
        return render_template('user_guide.html', markdown_content=fallback_markdown)

@app.route('/api/datasets')
def get_datasets():
    """获取知识库列表API"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    result = dify_client.get_datasets(page, limit)
    return jsonify(result)

@app.route('/api/datasets', methods=['POST'])
def create_dataset():
    """创建知识库API"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': '请求数据为空'}), 400
            
        name = data.get('name', '').strip()
        description = data.get('description', '').strip()
        
        if not name:
            return jsonify({'error': '知识库名称不能为空'}), 400
        
        print(f"创建知识库: name={name}, description={description}")
        
        result = dify_client.create_dataset(name, description)
        
        if result and 'error' not in result:
            return jsonify(result)
        elif result and 'error' in result:
            return jsonify({'error': result['error']}), 500
        else:
            return jsonify({'error': '创建知识库失败，API返回空结果'}), 500
            
    except Exception as e:
        print(f"创建知识库异常: {e}")
        return jsonify({'error': f'服务器错误: {str(e)}'}), 500

@app.route('/api/datasets/<dataset_id>/documents', methods=['POST'])
def create_document(dataset_id):
    """创建文档API"""
    # 检查是否为文件上传
    if 'file' in request.files:
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': '未选择文件'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # 通过文件创建文档
            result = dify_client.create_document_by_file(dataset_id, filepath, filename)
            
            # 删除临时文件
            try:
                os.remove(filepath)
            except:
                pass
            
            if result:
                return jsonify(result)
            else:
                return jsonify({'error': '创建文档失败'}), 500
        else:
            return jsonify({'error': '不支持的文件类型'}), 400
    else:
        # 通过文本创建文档
        data = request.get_json()
        name = data.get('name', '')
        text = data.get('text', '')
        
        if not name.strip() or not text.strip():
            return jsonify({'error': '文档名称和内容不能为空'}), 400
        
        result = dify_client.create_document_by_text(dataset_id, name, text)
        if result:
            return jsonify(result)
        else:
            return jsonify({'error': '创建文档失败'}), 500

@app.route('/api/datasets/<dataset_id>', methods=['DELETE'])
def delete_dataset(dataset_id):
    """删除知识库API"""
    result = dify_client.delete_dataset(dataset_id)
    if result:
        return jsonify({'result': 'success'})
    else:
        return jsonify({'error': '删除知识库失败'}), 500

@app.route('/api/datasets/<dataset_id>/documents', methods=['GET'])
def get_documents(dataset_id):
    """获取知识库文档列表API"""
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    result = dify_client.get_documents(dataset_id, page, limit)
    return jsonify(result)

@app.route('/api/datasets/<dataset_id>/documents/<document_id>', methods=['DELETE'])
def delete_document(dataset_id, document_id):
    """删除文档API"""
    result = dify_client.delete_document(dataset_id, document_id)
    if result:
        return jsonify(result)
    else:
        return jsonify({'error': '删除文档失败'}), 500

@app.route('/api/datasets/<dataset_id>/documents/<batch_id>/status', methods=['GET'])
def get_document_status(dataset_id, batch_id):
    """获取文档处理状态API"""
    result = dify_client.get_document_indexing_status(dataset_id, batch_id)
    return jsonify(result)

@app.route('/api/datasets/<dataset_id>/retrieve', methods=['POST'])
def retrieve_dataset(dataset_id):
    """检索知识库API"""
    data = request.get_json()
    query = data.get('query', '')
    top_k = data.get('top_k', 3)
    score_threshold = data.get('score_threshold', 0.5)
    
    if not query.strip():
        return jsonify({'error': '查询内容不能为空'}), 400
    
    result = dify_client.retrieve_dataset(dataset_id, query, top_k, score_threshold)
    return jsonify(result)

@app.route('/api/health')
def health_check():
    """健康检查API"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

@app.route('/api/chat/send', methods=['POST'])
def send_message():
    """发送聊天消息 - 原有路由保持兼容"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        conversation_id = data.get('conversation_id', '')
        files = data.get('files', None)
        inputs = data.get('inputs', {})
        
        if not query.strip():
            return jsonify({'error': '消息不能为空'}), 400
        
        def generate():
            response = dify_client.chat_message(query, conversation_id, files=files, inputs=inputs, stream=True)
            if not response:
                yield f"data: {json.dumps({'error': 'API请求失败'})}\n\n"
                return
                
            current_answer = ""
            current_conversation_id = conversation_id
            current_task_id = None
            
            for line in response.iter_lines():
                if line:
                    line_str = line.decode('utf-8')
                    if line_str.startswith('data: '):
                        try:
                            json_data = json.loads(line_str[6:])
                            
                            # 获取task_id
                            if json_data.get('task_id'):
                                current_task_id = json_data.get('task_id')
                            
                            if json_data.get('event') == 'message':
                                current_answer += json_data.get('answer', '')
                                current_conversation_id = json_data.get('conversation_id', current_conversation_id)
                                
                                # 直接转发Dify的响应格式
                                response_data = {
                                    'event': 'message',
                                    'answer': json_data.get('answer', ''),
                                    'conversation_id': current_conversation_id,
                                    'task_id': current_task_id
                                }
                                yield f"data: {json.dumps(response_data)}\n\n"
                                
                            elif json_data.get('event') == 'message_end':
                                # 直接转发Dify的响应格式
                                response_data = {
                                    'event': 'message_end',
                                    'conversation_id': current_conversation_id,
                                    'message_id': json_data.get('id', ''),
                                    'metadata': json_data.get('metadata', {}),
                                    'task_id': current_task_id
                                }
                                yield f"data: {json.dumps(response_data)}\n\n"
                                
                        except json.JSONDecodeError:
                            continue
        
        return app.response_class(generate(), mimetype='text/plain')
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # 确保模板目录存在
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    print("🚀 Dify智能助手Web应用启动中...")
    print(f"📡 API地址: {DifyAPIConfig.BASE_URL}")
    print(f"📍 本地访问: http://localhost:{AppConfig.PORT}")
    print(f"🌐 公网访问: http://118.196.22.104:{AppConfig.PORT}")
    print("✨ 功能模块: 智能对话 | 文档处理 | 知识库管理")
    
    app.run(host=AppConfig.HOST, port=AppConfig.PORT, debug=AppConfig.DEBUG) 