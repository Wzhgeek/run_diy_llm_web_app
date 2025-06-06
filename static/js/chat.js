// chat.js - 聊天页面功能脚本

// 全局变量
let currentConversationId = null;
let conversations = [];
let messages = [];
let currentTask = null;
let uploadedFile = null;
let conversationToDelete = null;
let conversationToRename = null;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    loadConversations();
});

// 初始化聊天
function initializeChat() {
    // 自动调节输入框高度
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', autoResize);
}

// 初始化侧边栏拖拽调节
function initializeSidebarResize() {
    // 使用Bootstrap响应式布局，不需要手动调节功能
}

// 隐藏侧边栏
function hideSidebar() {
    const container = document.querySelector('.container-fluid');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const chatPanel = document.getElementById('chatPanel');
    const showBtn = document.getElementById('showSidebarBtn');
    const hideBtn = document.getElementById('hideSidebarBtn');
    
    // 检查元素是否存在
    if (!container || !sidebarPanel || !chatPanel || !showBtn || !hideBtn) {
        console.warn('侧边栏隐藏：某些DOM元素不存在');
        return;
    }
    
    // 添加隐藏类
    container.classList.add('sidebar-hidden');
    
    // 显示显示按钮，隐藏隐藏按钮
    showBtn.style.display = 'block';
    hideBtn.style.display = 'none';
    
    // 更新Bootstrap列类
    setTimeout(() => {
        sidebarPanel.style.display = 'none';
        chatPanel.classList.remove('col-md-9');
        chatPanel.classList.add('col-12');
    }, 300);
}

// 显示侧边栏
function showSidebar() {
    const container = document.querySelector('.container-fluid');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const chatPanel = document.getElementById('chatPanel');
    const showBtn = document.getElementById('showSidebarBtn');
    const hideBtn = document.getElementById('hideSidebarBtn');
    
    // 检查元素是否存在
    if (!container || !sidebarPanel || !chatPanel || !showBtn || !hideBtn) {
        console.warn('侧边栏显示：某些DOM元素不存在');
        return;
    }
    
    // 恢复显示
    sidebarPanel.style.display = 'block';
    chatPanel.classList.remove('col-12');
    chatPanel.classList.add('col-md-9');
    
    // 移除隐藏类
    setTimeout(() => {
        container.classList.remove('sidebar-hidden');
    }, 10);
    
    // 显示隐藏按钮，隐藏显示按钮
    setTimeout(() => {
        showBtn.style.display = 'none';
        hideBtn.style.display = 'block';
    }, 300);
}

// 侧边栏切换功能（保留兼容性）
function toggleSidebar() {
    const container = document.querySelector('.container-fluid');
    if (container.classList.contains('sidebar-hidden')) {
        showSidebar();
    } else {
        hideSidebar();
    }
}

// 加载会话列表
async function loadConversations() {
    try {
        const response = await fetch('/api/conversations?user=web-user');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        conversations = data.data || [];
        renderConversations();
    } catch (error) {
        console.error('加载会话列表失败:', error);
        showToast('加载会话列表失败: ' + error.message, 'error');
        document.getElementById('conversationsList').innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-exclamation-triangle text-warning mb-2"></i>
                <div class="small text-muted">加载失败，请刷新重试</div>
                <button class="btn btn-sm btn-outline-primary mt-2" onclick="loadConversations()">
                    <i class="fas fa-redo me-1"></i>重试
                </button>
            </div>
        `;
    }
}

// 渲染会话列表
function renderConversations(filteredConversations = null) {
    const conversationsList = document.getElementById('conversationsList');
    const conversationsToRender = filteredConversations || conversations;
    
    if (conversationsToRender.length === 0) {
        conversationsList.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-comments text-muted mb-2"></i>
                <div class="small text-muted">暂无会话记录</div>
                <button class="btn btn-sm btn-primary mt-2" onclick="startNewConversation()">
                    <i class="fas fa-plus me-1"></i>开始对话
                </button>
            </div>
        `;
        return;
    }
    
    const html = conversationsToRender.map(conv => {
        const isActive = conv.id === currentConversationId;
        const title = conv.name || '新对话';
        const preview = getConversationPreview(conv.id);
        const time = formatRelativeTime(conv.created_at);
        
        return `
            <div class="list-group-item list-group-item-action conversation-item ${isActive ? 'active' : ''}" 
                 onclick="loadConversation('${conv.id}')" 
                 data-conversation-id="${conv.id}">
                <div class="conversation-actions">
                    <button class="conversation-action-btn" onclick="event.stopPropagation(); renameConversation('${conv.id}')" title="重命名">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="conversation-action-btn" onclick="event.stopPropagation(); exportConversation('${conv.id}')" title="导出">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="conversation-action-btn" onclick="event.stopPropagation(); deleteConversation('${conv.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="conversation-title">${title}</div>
                <div class="conversation-preview">${preview}</div>
                <div class="conversation-time">${time}</div>
            </div>
        `;
    }).join('');
    
    conversationsList.innerHTML = html;
}

// 搜索会话
function searchConversations() {
    const query = document.getElementById('conversationSearch').value.toLowerCase();
    if (!query) {
        renderConversations();
        return;
    }
    
    const filtered = conversations.filter(conv => {
        const title = (conv.name || '新对话').toLowerCase();
        return title.includes(query);
    });
    
    renderConversations(filtered);
}

// 获取会话预览
function getConversationPreview(conversationId) {
    return '点击查看对话内容...';
}

// 格式化相对时间
function formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp * 1000);
    const diff = now - time;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    return time.toLocaleDateString('zh-CN');
}

// 开始新对话
function startNewConversation() {
    currentConversationId = null;
    messages = [];
    updateChatTitle('新对话', '开始您的学术研究对话');
    showWelcomeScreen();
    updateConversationActive();
}

// 加载指定会话
async function loadConversation(conversationId) {
    if (conversationId === currentConversationId) return;
    
    try {
        showLoading();
        const response = await fetch(`/api/messages?conversation_id=${conversationId}&user=web-user`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentConversationId = conversationId;
        messages = data.data || [];
        
        const conversation = conversations.find(c => c.id === conversationId);
        const title = conversation ? (conversation.name || '对话') : '对话';
        updateChatTitle(title, `会话ID: ${conversationId}`);
        
        renderMessages();
        updateConversationActive();
        hideWelcomeScreen();
        
    } catch (error) {
        console.error('加载会话失败:', error);
        showToast(`加载会话失败: ${error.message}`, 'error');
        // 如果是网络错误，提供重试选项
        if (error.message.includes('HTTP') || error.message.includes('fetch')) {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-sm btn-primary mt-2';
            retryBtn.innerHTML = '<i class="fas fa-redo me-1"></i>重试';
            retryBtn.onclick = () => loadConversation(conversationId);
            
            const messagesContainer = document.getElementById('chatMessages');
            messagesContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-exclamation-triangle text-warning mb-2 fs-2"></i>
                    <div class="mb-2">加载会话失败</div>
                    <div class="small text-muted mb-3">${error.message}</div>
                </div>
            `;
            messagesContainer.appendChild(retryBtn);
        }
    } finally {
        hideLoading();
    }
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message && !uploadedFile) return;
    
    try {
        // 保存当前文件信息
        const currentFileInfo = uploadedFile;
        
        // 添加用户消息到界面
        if (message || currentFileInfo) {
            const userContent = message || '';
            
            // 传递文件信息给addMessage函数
            addMessage('user', userContent, null, currentFileInfo);
            input.value = '';
            autoResize();
        }
        
        hideWelcomeScreen();
        
        // 准备请求数据
        const requestData = {
            query: message,
            user: 'web-user'
        };
        
        // 如果有当前会话ID，则包含它
        if (currentConversationId) {
            requestData.conversation_id = currentConversationId;
        }
        
        // 根据文件类型添加inputs（按照新的格式）
        if (currentFileInfo) {
            const fileType = getFileType(currentFileInfo.mime_type || currentFileInfo.type);
            requestData.inputs = {};
            
            if (fileType === 'image') {
                requestData.inputs.input_image = {
                    type: 'image',
                    transfer_method: 'local_file',
                    upload_file_id: currentFileInfo.id
                };
            } else if (fileType === 'audio') {
                requestData.inputs.input_file = {
                    type: 'audio',
                    transfer_method: 'local_file',
                    upload_file_id: currentFileInfo.id
                };
            } else if (fileType === 'video') {
                requestData.inputs.input_file = {
                    type: 'video',
                    transfer_method: 'local_file',
                    upload_file_id: currentFileInfo.id
                };
            } else if (fileType === 'document') {
                requestData.inputs.input_file = {
                    type: 'document',
                    transfer_method: 'local_file',
                    upload_file_id: currentFileInfo.id
                };
            } else {
                requestData.inputs.input_file = {
                    type: 'custom',
                    transfer_method: 'local_file',
                    upload_file_id: currentFileInfo.id
                };
            }
            
            // 清除文件信息（在发送后清除）
            removeFile();
        }
        
        // 发送请求到统一的聊天API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) throw new Error('发送失败');
        
        // 处理流式响应
        await handleStreamResponse(response);
        
    } catch (error) {
        console.error('发送消息失败:', error);
        showToast('发送消息失败: ' + error.message, 'error');
    }
}

// 处理流式响应
async function handleStreamResponse(response, existingMessageElement = null) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessageElement = existingMessageElement;
    let fullResponse = '';
    let taskId = null;
    
    // 显示停止按钮
    showStopButton();
    
    // 如果是重新生成，清空现有内容
    if (existingMessageElement) {
        const messageText = existingMessageElement.querySelector('.message-text');
        if (messageText) {
            messageText.innerHTML = '';
        }
        fullResponse = '';
    }
        
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.event === 'message') {
                            if (!assistantMessageElement) {
                                assistantMessageElement = addMessage('assistant', '');
                                currentConversationId = data.conversation_id;
                                taskId = data.task_id;
                                // 设置当前任务ID用于停止功能
                                currentTask = taskId;
                            } else {
                                // 重新生成的情况下，更新会话ID和任务ID
                                if (data.conversation_id) {
                                currentConversationId = data.conversation_id;
                                }
                                if (data.task_id) {
                                    taskId = data.task_id;
                                    currentTask = taskId;
                                }
                            }
                            
                            fullResponse += data.answer;
                            updateMessageContent(assistantMessageElement, fullResponse);
                            
                        } else if (data.event === 'message_end') {
                            if (assistantMessageElement) {
                                // 从数据中获取messageId
                                const messageId = data.id || data.message_id;
                                finalizeMessage(assistantMessageElement, messageId);
                                
                                // 更新消息元素的data-message-id属性
                                if (messageId) {
                                    assistantMessageElement.setAttribute('data-message-id', messageId);
                                    // 更新建议问题容器的ID
                                    const suggestedContainer = assistantMessageElement.querySelector('.suggested-questions');
                                    if (suggestedContainer) {
                                        suggestedContainer.id = `suggested-${messageId}`;
                                    }
                                }
                            }
                            
                            // 清除当前任务
                            currentTask = null;
                            
                            // 更新会话列表
                            if (!conversations.find(c => c.id === currentConversationId)) {
                                loadConversations();
                            }
                        }
                    } catch (e) {
                        console.error('解析响应数据失败:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('处理流式响应失败:', error);
        if (assistantMessageElement) {
            const errorMessage = '抱歉，响应处理出现错误。';
            updateMessageContent(assistantMessageElement, errorMessage);
            finalizeMessage(assistantMessageElement);
        }
        showToast('响应处理失败', 'error');
    } finally {
        // 隐藏停止按钮
        hideStopButton();
        currentTask = null;
        
        // 确保消息被完成
        if (assistantMessageElement) {
            finalizeMessage(assistantMessageElement);
        }
    }
}

// 添加消息到界面
function addMessage(role, content, messageId = null, fileInfo = null, createdAt = null) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${role}`;
    messageElement.setAttribute('data-message-id', messageId || Date.now());
    
    // 如果提供了createdAt，使用历史时间，否则使用当前时间
    const timestamp = createdAt ? 
        new Date(createdAt * 1000).toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        }) :
        new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // 构建文件信息显示
    let fileInfoHtml = '';
    if (role === 'user' && fileInfo) {
        const displayName = fileInfo.originalName || fileInfo.name;
        const fileTypeIcon = getFileTypeIcon(fileInfo.mime_type || fileInfo.originalType || fileInfo.type, displayName);
        const displaySize = fileInfo.originalSize || fileInfo.size;
        fileInfoHtml = `
            <div class="message-file-info">
                <div class="file-info-item">
                    <i class="${fileTypeIcon}"></i>
                    <span class="file-info-text">${displayName} 已上传</span>
                    <span class="file-info-size">(${formatFileSize(displaySize)})</span>
                </div>
            </div>
        `;
    }
    
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-text">${content ? formatMessageContent(content) : ''}</div>
            ${role === 'assistant' && !content ? '<span class="typing-indicator"></span>' : ''}
        </div>
        ${fileInfoHtml}
        <div class="message-time">${timestamp}</div>
        ${role === 'assistant' ? `
            <div class="message-bottom-section">
                <div class="message-actions">
                <button class="action-btn" onclick="regenerateMessage('${messageId || Date.now()}')" title="重新生成">
                    <i class="fas fa-redo"></i>
                </button>
                <button class="action-btn like-btn" onclick="likeMessage('${messageId || Date.now()}', 'like')" title="点赞">
                    <i class="fas fa-thumbs-up"></i>
                </button>
                <button class="action-btn dislike-btn" onclick="likeMessage('${messageId || Date.now()}', 'dislike')" title="点踩">
                    <i class="fas fa-thumbs-down"></i>
                </button>
                <button class="action-btn" onclick="copyMessage('${messageId || Date.now()}')" title="复制">
                    <i class="fas fa-copy"></i>
                </button>
                </div>
                <div class="suggested-questions" id="suggested-${messageId || Date.now()}" style="display: none;">
                    <!-- 建议问题将在这里动态加载 -->
                </div>
            </div>
        ` : ''}
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageElement;
}

// 根据文件类型获取图标
function getFileTypeIcon(mimeType, fileName = '') {
    if (!mimeType) return 'fas fa-file text-muted';
    
    if (mimeType.startsWith('image/')) {
        return 'fas fa-image text-primary';
    } else if (mimeType.includes('pdf')) {
        return 'fas fa-file-pdf text-danger';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
        return 'fas fa-file-word text-primary';
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
        return 'fas fa-file-excel text-success';
    } else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
        return 'fas fa-file-powerpoint text-warning';
    } else if (mimeType.startsWith('audio/')) {
        return 'fas fa-file-audio text-info';
    } else if (mimeType.startsWith('video/')) {
        return 'fas fa-file-video text-purple';
    } else if (fileName.toLowerCase().endsWith('.md') || mimeType === 'text/markdown') {
        return 'fab fa-markdown text-info';
    } else if (fileName.toLowerCase().endsWith('.html') || mimeType === 'text/html') {
        return 'fab fa-html5 text-warning';
    } else if (fileName.toLowerCase().endsWith('.csv') || mimeType === 'text/csv') {
        return 'fas fa-file-csv text-success';
    } else if (mimeType.startsWith('text/') || fileName.toLowerCase().endsWith('.txt')) {
        return 'fas fa-file-alt text-secondary';
    } else {
        return 'fas fa-file text-muted';
    }
}

// 更新消息内容
function updateMessageContent(messageElement, content) {
    const textElement = messageElement.querySelector('.message-text');
    const typingIndicator = messageElement.querySelector('.typing-indicator');
    
    if (textElement) {
        textElement.innerHTML = formatMessageContent(content);
    }
    
    if (typingIndicator && content) {
        typingIndicator.style.display = 'inline';
    }
    
    // 滚动到底部
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 完成消息
function finalizeMessage(messageElement, messageId = null) {
    const typingIndicator = messageElement.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
    
    // 如果是AI消息且有messageId，加载建议问题
    if (messageElement.classList.contains('message-assistant') && messageId) {
        loadSuggestedQuestions(messageId);
        // 如果API没有返回建议问题，显示默认建议问题
        setTimeout(() => {
            const suggestedContainer = document.getElementById(`suggested-${messageId}`);
            if (suggestedContainer && suggestedContainer.style.display === 'none') {
                const defaultQuestions = [
                    "继续深入",
                    "举个例子"
                ];
                displaySuggestedQuestions(messageId, defaultQuestions);
            }
        }, 2000);
    }
}

// 格式化消息内容
function formatMessageContent(content) {
    // 简单的markdown渲染
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}

// 渲染消息列表
function renderMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        // 每条消息包含用户问题和助手回答，需要分别渲染
        if (msg.query) {
            // 渲染用户消息
            const userElement = addMessage('user', msg.query, msg.id + '_user', null, msg.created_at);
            if (userElement) {
                finalizeMessage(userElement, msg.id + '_user');
            }
        }
        
        if (msg.answer) {
            // 渲染助手消息
            const assistantElement = addMessage('assistant', msg.answer, msg.id, null, msg.created_at);
            if (assistantElement) {
                finalizeMessage(assistantElement, msg.id);
            }
        }
    });
}

// 删除会话
function deleteConversation(conversationId) {
    conversationToDelete = conversationId;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// 确认删除
async function confirmDelete() {
    if (!conversationToDelete) return;
    
    try {
        const response = await fetch(`/api/conversations/${conversationToDelete}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: 'web-user' })
        });
        
        if (response.ok) {
            conversations = conversations.filter(c => c.id !== conversationToDelete);
            renderConversations();
            
            if (currentConversationId === conversationToDelete) {
                startNewConversation();
            }
            
            showToast('对话已删除', 'success');
        } else {
            throw new Error('删除失败');
        }
    } catch (error) {
        console.error('删除会话失败:', error);
        showToast('删除失败', 'error');
    } finally {
        conversationToDelete = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();
    }
}

// 重命名会话
function renameConversation(conversationId) {
    conversationToRename = conversationId;
    const conversation = conversations.find(c => c.id === conversationId);
    const currentName = conversation ? (conversation.name || '新对话') : '新对话';
    
    document.getElementById('newConversationName').value = currentName;
    const modal = new bootstrap.Modal(document.getElementById('renameModal'));
    modal.show();
}

// 确认重命名
async function confirmRename() {
    if (!conversationToRename) return;
    
    const newName = document.getElementById('newConversationName').value.trim();
    if (!newName) {
        showToast('请输入对话名称', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`/api/conversations/${conversationToRename}/name`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                name: newName,
                user: 'web-user' 
            })
        });
        
        if (response.ok) {
            const conversation = conversations.find(c => c.id === conversationToRename);
            if (conversation) {
                conversation.name = newName;
            }
            renderConversations();
            
            if (currentConversationId === conversationToRename) {
                updateChatTitle(newName, `会话ID: ${conversationToRename}`);
            }
            
            showToast('重命名成功', 'success');
        } else {
            throw new Error('重命名失败');
        }
    } catch (error) {
        console.error('重命名失败:', error);
        showToast('重命名失败', 'error');
    } finally {
        conversationToRename = null;
        const modal = bootstrap.Modal.getInstance(document.getElementById('renameModal'));
        modal.hide();
    }
}

// 导出单个会话
async function exportConversation(conversationId) {
    try {
        const response = await fetch(`/api/messages?conversation_id=${conversationId}&user=web-user`);
        const data = await response.json();
        const messages = data.data || [];
        
        const conversation = conversations.find(c => c.id === conversationId);
        const title = conversation ? (conversation.name || '对话') : '对话';
        
        const exportData = {
            title: title,
            conversationId: conversationId,
            exportTime: new Date().toISOString(),
            messages: messages.map(msg => ({
                type: msg.query ? 'user' : 'assistant',
                content: msg.query || msg.answer,
                timestamp: msg.created_at
            }))
        };
        
        downloadJSON(exportData, `${title}-${conversationId}.json`);
        showToast('导出成功', 'success');
        
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败', 'error');
    }
}

// 导出当前会话
function exportCurrentChat() {
    if (!currentConversationId) {
        showToast('请先选择一个会话', 'warning');
        return;
    }
    exportConversation(currentConversationId);
}

// 导出全部会话
async function exportAllConversations() {
    try {
        const allData = [];
        
        for (const conv of conversations) {
            const response = await fetch(`/api/messages?conversation_id=${conv.id}&user=web-user`);
            const data = await response.json();
            const messages = data.data || [];
            
            allData.push({
                title: conv.name || '对话',
                conversationId: conv.id,
                createdAt: conv.created_at,
                messages: messages.map(msg => ({
                    type: msg.query ? 'user' : 'assistant',
                    content: msg.query || msg.answer,
                    timestamp: msg.created_at
                }))
            });
        }
        
        const exportData = {
            exportTime: new Date().toISOString(),
            totalConversations: allData.length,
            conversations: allData
        };
        
        downloadJSON(exportData, `AI学术助手-全部对话-${new Date().toISOString().slice(0, 10)}.json`);
        showToast(`成功导出${allData.length}个对话`, 'success');
        
    } catch (error) {
        console.error('导出全部对话失败:', error);
        showToast('导出失败', 'error');
    }
}

// 下载JSON文件
function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 清空当前对话
function clearCurrentChat() {
    if (!currentConversationId) {
        showToast('没有可清空的对话', 'warning');
        return;
    }
    
    if (confirm('确定要清空当前对话吗？')) {
        messages = [];
        document.getElementById('chatMessages').innerHTML = '';
        showWelcomeScreen();
        showToast('对话已清空', 'success');
    }
}

// 清空全部会话
function clearAllConversations() {
    if (conversations.length === 0) {
        showToast('没有可清空的对话', 'warning');
        return;
    }
    
    if (confirm('确定要清空全部对话吗？这个操作无法撤销。')) {
        conversations = [];
        renderConversations();
        startNewConversation();
        showToast('全部对话已清空', 'success');
    }
}

// 更新聊天标题
function updateChatTitle(title, subtitle) {
    document.getElementById('chatTitle').textContent = title;
    document.getElementById('chatSubtitle').textContent = subtitle;
}

// 更新会话激活状态
function updateConversationActive() {
    document.querySelectorAll('.conversation-item').forEach(item => {
        const id = item.dataset.conversationId;
        if (id === currentConversationId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 重命名当前对话
function renameCurrentChat() {
    if (!currentConversationId) {
        showToast('请先选择一个会话', 'warning');
        return;
    }
    renameConversation(currentConversationId);
}

// 显示/隐藏欢迎屏幕
function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'flex';
    }
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }
}

// 显示加载状态
function showLoading() {
    // 可以在这里添加加载动画
}

function hideLoading() {
    // 隐藏加载动画
}

// Toast通知系统
function showToast(message, type = 'info') {
    // 创建toast容器（如果不存在）
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            max-width: 300px;
        `;
        document.body.appendChild(toastContainer);
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    toast.style.cssText = `
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border: none;
    `;
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;

    // 添加到容器
    toastContainer.appendChild(toast);

    // 自动关闭
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 150);
    }, 3000);

    // 手动关闭
    const closeBtn = toast.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 150);
    });
}

// 显示停止按钮
function showStopButton() {
    const stopContainer = document.getElementById('stopButtonContainer');
    if (stopContainer) {
        stopContainer.style.display = 'block';
    }
}

// 隐藏停止按钮
function hideStopButton() {
    const stopContainer = document.getElementById('stopButtonContainer');
    if (stopContainer) {
        stopContainer.style.display = 'none';
    }
}

// 停止生成
function stopGeneration() {
    if (currentTask) {
        fetch(`/api/chat-messages/${currentTask}/stop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user: 'web-user' })
        }).then(response => {
            if (response.ok) {
                showToast('已停止生成', 'info');
            } else {
                throw new Error('停止请求失败');
            }
        }).catch(error => {
            console.error('停止生成失败:', error);
            showToast('停止失败', 'error');
        }).finally(() => {
        currentTask = null;
            hideStopButton();
        });
    } else {
        hideStopButton();
    }
}

// 发送示例消息
function sendExample(message) {
    const input = document.getElementById('messageInput');
    if (input) {
        input.value = message;
    sendMessage();
    }
}

// 触发论文分析文件上传
function triggerAnalysisUpload() {
    hideWelcomeScreen();
    const analysisInput = document.getElementById('analysisInput');
    if (analysisInput) {
        analysisInput.click();
    }
}

// 触发学术翻译文件上传
function triggerTranslationUpload() {
    hideWelcomeScreen();
    const translationInput = document.getElementById('translationInput');
    if (translationInput) {
        translationInput.click();
    }
}

// 处理论文分析文件上传
function handleAnalysisUpload() {
    const analysisInput = document.getElementById('analysisInput');
    const file = analysisInput.files[0];
    if (!file) return;
    
    // 显示文件预览
    showFilePreview(file);
    
    // 上传文件并设置预设提示词
    uploadFileWithPrompt(file, '请帮我分析这篇论文的核心观点、研究方法、主要结论和创新点。');
}

// 处理学术翻译文件上传
function handleTranslationUpload() {
    const translationInput = document.getElementById('translationInput');
    const file = translationInput.files[0];
    if (!file) return;
    
    // 显示文件预览
    showFilePreview(file);
    
    // 上传文件并设置预设提示词
    uploadFileWithPrompt(file, '请帮我将这个文档翻译成中文，保持学术性和专业性。');
}

// 上传文件并设置提示词
async function uploadFileWithPrompt(file, prompt) {
    try {
        // 显示进度条
        showUploadProgress();
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', 'web-user');
        
        // 使用XMLHttpRequest来支持进度跟踪
        const xhr = new XMLHttpRequest();
        
        // 设置进度监听
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                updateUploadProgress(percentComplete);
            }
        });
        
        // 创建Promise来处理XMLHttpRequest
        const uploadPromise = new Promise((resolve, reject) => {
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('响应解析失败'));
                    }
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.error || '上传失败'));
                    } catch (e) {
                        reject(new Error(`上传失败: HTTP ${xhr.status}`));
                    }
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('网络错误'));
            };
            
            xhr.ontimeout = function() {
                reject(new Error('上传超时'));
            };
        });
        
        // 发送请求
        xhr.open('POST', '/api/files/upload');
        xhr.timeout = 60000; // 60秒超时
        xhr.send(formData);
        
        // 等待上传完成
        const result = await uploadPromise;
        
        uploadedFile = result;
        // 保存原始文件名和大小信息
        uploadedFile.originalName = file.name;
        uploadedFile.originalSize = file.size;
        uploadedFile.originalType = file.type;
        
        // 显示上传完成状态
        updateUploadProgress(100);
        
        // 设置提示词到输入框
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = prompt;
        }
        
        // 短暂延迟后隐藏进度条并自动发送消息
        setTimeout(() => {
            hideUploadProgress();
            sendMessage();
        }, 1000);
        
    } catch (error) {
        console.error('文件上传失败:', error);
        hideUploadProgress();
        removeFile();
    }
}

// 文件上传相关
function triggerFileUpload(type) {
    if (type === 'image') {
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.click();
        }
    } else {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.click();
        }
    }
}

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) return;
    
    // 显示文件预览
    showFilePreview(file);
    
    // 上传文件
    uploadFile(file);
}

function handleImageUpload() {
    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    if (!file) return;
    
    // 显示文件预览
    showFilePreview(file);
    
    // 上传文件
    uploadFile(file);
}

function showFilePreview(file) {
    const preview = document.getElementById('filePreview');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const fileIcon = document.querySelector('.file-icon');
    
    // 检查必要的DOM元素是否存在
    if (!preview || !fileName || !fileSize || !fileIcon) {
        console.warn('文件预览：某些DOM元素不存在');
        return;
    }
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // 设置文件图标
    if (file.type.startsWith('image/')) {
        fileIcon.className = 'file-icon fas fa-image text-primary';
    } else if (file.type.includes('pdf')) {
        fileIcon.className = 'file-icon fas fa-file-pdf text-danger';
    } else if (file.type.includes('word') || file.type.includes('document')) {
        fileIcon.className = 'file-icon fas fa-file-word text-primary';
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
        fileIcon.className = 'file-icon fas fa-file-excel text-success';
    } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
        fileIcon.className = 'file-icon fas fa-file-powerpoint text-warning';
    } else if (file.type.startsWith('audio/')) {
        fileIcon.className = 'file-icon fas fa-file-audio text-info';
    } else if (file.type.startsWith('video/')) {
        fileIcon.className = 'file-icon fas fa-file-video text-purple';
    } else if (file.name.toLowerCase().endsWith('.md') || file.type === 'text/markdown') {
        fileIcon.className = 'file-icon fab fa-markdown text-info';
    } else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
        fileIcon.className = 'file-icon fas fa-file-alt text-secondary';
    } else if (file.name.toLowerCase().endsWith('.html') || file.type === 'text/html') {
        fileIcon.className = 'file-icon fab fa-html5 text-warning';
    } else if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
        fileIcon.className = 'file-icon fas fa-file-csv text-success';
    } else {
        fileIcon.className = 'file-icon fas fa-file text-muted';
    }
    
    preview.style.display = 'block';
}

function removeFile() {
    const filePreview = document.getElementById('filePreview');
    const fileInput = document.getElementById('fileInput');
    const imageInput = document.getElementById('imageInput');
    const analysisInput = document.getElementById('analysisInput');
    const translationInput = document.getElementById('translationInput');
    
    if (filePreview) {
        filePreview.style.display = 'none';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    if (imageInput) {
        imageInput.value = '';
    }
    if (analysisInput) {
        analysisInput.value = '';
    }
    if (translationInput) {
        translationInput.value = '';
    }
    
    uploadedFile = null;
    hideUploadProgress();
}

// 显示上传进度条
function showUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress');
    const removeBtn = document.getElementById('removeFileBtn');
    const fileItem = document.getElementById('fileItem');
    
    if (uploadProgress) {
        uploadProgress.style.display = 'flex';
    }
    if (removeBtn) {
        removeBtn.style.display = 'none';
    }
    if (fileItem) {
        fileItem.classList.add('uploading');
    }
    
    // 初始化进度为0
    updateUploadProgress(0);
}

// 更新上传进度
function updateUploadProgress(percent) {
    const progressCircle = document.getElementById('progressCircle');
    const progressValue = document.getElementById('progressValue');
    
    if (progressCircle && progressValue) {
        // 更新圆圈进度条
        const degrees = (percent / 100) * 360;
        progressCircle.style.background = `conic-gradient(
            var(--primary-color) 0deg ${degrees}deg,
            #e5e5e5 ${degrees}deg 360deg
        )`;
        
        // 更新百分比文字
        progressValue.textContent = `${percent}%`;
        
        // 添加旋转动画当进度小于100%时
        if (percent < 100) {
            progressCircle.classList.add('uploading');
        } else {
            progressCircle.classList.remove('uploading');
        }
    }
}

// 隐藏上传进度条
function hideUploadProgress() {
    const uploadProgress = document.getElementById('uploadProgress');
    const removeBtn = document.getElementById('removeFileBtn');
    const fileItem = document.getElementById('fileItem');
    const progressCircle = document.getElementById('progressCircle');
    
    if (uploadProgress) {
        uploadProgress.style.display = 'none';
    }
    if (removeBtn) {
        removeBtn.style.display = 'block';
    }
    if (fileItem) {
        fileItem.classList.remove('uploading');
    }
    if (progressCircle) {
        progressCircle.classList.remove('uploading');
    }
}

async function uploadFile(file) {
    try {
        // 显示进度条并隐藏删除按钮
        showUploadProgress();
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', 'web-user');
        
        // 使用XMLHttpRequest来支持进度跟踪
        const xhr = new XMLHttpRequest();
        
        // 设置进度监听
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = Math.round((e.loaded / e.total) * 100);
                updateUploadProgress(percentComplete);
            }
        });
        
        // 创建Promise来处理XMLHttpRequest
        const uploadPromise = new Promise((resolve, reject) => {
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('响应解析失败'));
                    }
        } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.error || '上传失败'));
                    } catch (e) {
                        reject(new Error(`上传失败: HTTP ${xhr.status}`));
                    }
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('网络错误'));
            };
            
            xhr.ontimeout = function() {
                reject(new Error('上传超时'));
            };
        });
        
        // 发送请求
        xhr.open('POST', '/api/files/upload');
        xhr.timeout = 60000; // 60秒超时
        xhr.send(formData);
        
        // 等待上传完成
        const result = await uploadPromise;
        
        uploadedFile = result;
        // 保存原始文件名和大小信息
        uploadedFile.originalName = file.name;
        uploadedFile.originalSize = file.size;
        uploadedFile.originalType = file.type;
        
        // 显示上传完成状态
        updateUploadProgress(100);
        setTimeout(() => {
            hideUploadProgress();
        }, 1000);
        
    } catch (error) {
        console.error('文件上传失败:', error);
        hideUploadProgress();
        removeFile();
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);
    
    // 优化显示格式：小于1的显示1位小数，其他显示整数或1位小数
    let formattedSize;
    if (size >= 100) {
        formattedSize = Math.round(size).toString();
    } else if (size >= 10) {
        formattedSize = size.toFixed(1);
    } else {
        formattedSize = size.toFixed(1);
    }
    
    return formattedSize + ' ' + sizes[i];
}

// 根据MIME类型确定文件类型
function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) {
        return 'image';
    } else if (mimeType.startsWith('audio/')) {
        return 'audio';
    } else if (mimeType.startsWith('video/')) {
        return 'video';
    } else if (mimeType.includes('pdf') || 
               mimeType.includes('word') || 
               mimeType.includes('text') ||
               mimeType.includes('document') ||
               mimeType.includes('msword') ||
               mimeType.includes('wordprocessingml')) {
        return 'document';
    } else {
        return 'custom';
    }
}

// 自动调节输入框高度
function autoResize() {
    const textarea = document.getElementById('messageInput');
    if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
}

// 处理键盘事件
function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// 消息交互功能

// 重新生成消息
async function regenerateMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
        showToast('找不到对应的消息', 'error');
        return;
    }
    
    const messageText = messageElement.querySelector('.message-text');
    const originalContent = messageText.innerHTML;
    
    try {
        // 显示重新生成状态
        messageText.innerHTML = '<span class="typing-indicator"></span>';
        
        // 查找对应的用户消息
        let currentAssistantIndex = -1;
        let userMessage = null;
        let userFileInfo = null;
        
        const allMessages = document.querySelectorAll('.message');
        for (let i = 0; i < allMessages.length; i++) {
            if (allMessages[i] === messageElement) {
                currentAssistantIndex = i;
                break;
            }
        }
        
        // 从当前AI消息往前找对应的用户消息
        for (let i = currentAssistantIndex - 1; i >= 0; i--) {
            if (allMessages[i].classList.contains('message-user')) {
                userMessage = allMessages[i];
                break;
            }
        }
        
        if (!userMessage) {
            showToast('无法找到对应的用户消息', 'error');
            messageText.innerHTML = originalContent;
            return;
        }
        
        const userContent = userMessage.querySelector('.message-text').textContent || '';
        if (!userContent.trim()) {
            showToast('用户消息内容为空', 'error');
            messageText.innerHTML = originalContent;
            return;
        }
        
        // 检查是否有文件信息
        const fileInfoElement = userMessage.querySelector('.message-file-info');
        if (fileInfoElement && uploadedFile) {
            // 如果有文件，构建包含文件的请求
            const fileType = getFileType(uploadedFile.originalType || uploadedFile.type || uploadedFile.mime_type);
            const inputs = {};
            
            if (fileType === 'image') {
                inputs.input_image = {
                    type: 'image',
                    transfer_method: 'local_file',
                    upload_file_id: uploadedFile.id
                };
            } else {
                inputs.input_file = {
                    type: fileType,
                    transfer_method: 'local_file',
                    upload_file_id: uploadedFile.id
                };
            }
            
            // 发送带文件的请求
        const requestData = {
            query: userContent,
            conversation_id: currentConversationId,
                inputs: inputs,
            user: 'web-user'
        };
        
            const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) throw new Error('请求失败');
            await handleStreamResponse(response, messageElement);
        } else {
            // 普通文本消息重新生成
            const requestData = {
                query: userContent,
                conversation_id: currentConversationId,
                user: 'web-user'
            };
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) throw new Error('请求失败');
        await handleStreamResponse(response, messageElement);
        }
        
    } catch (error) {
        console.error('重新生成失败:', error);
        showToast('重新生成失败: ' + error.message, 'error');
        messageText.innerHTML = originalContent;
    }
}

// 点赞/点踩功能
function likeMessage(messageId, action) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) return;
    
    const likeBtn = messageElement.querySelector('.like-btn');
    const dislikeBtn = messageElement.querySelector('.dislike-btn');
    
    // 切换状态
    if (action === 'like') {
        const isActive = likeBtn.classList.contains('active');
        likeBtn.classList.toggle('active', !isActive);
        dislikeBtn.classList.remove('active');
        showToast(isActive ? '取消点赞' : '已点赞', 'success');
    } else {
        const isActive = dislikeBtn.classList.contains('active');
        dislikeBtn.classList.toggle('active', !isActive);
        likeBtn.classList.remove('active');
        showToast(isActive ? '取消点踩' : '已点踩', 'success');
    }
}

// 复制消息
function copyMessage(messageId) {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    if (!messageElement) {
        showToast('找不到要复制的消息', 'error');
        return;
    }
    
    const messageText = messageElement.querySelector('.message-text');
    if (!messageText) {
        showToast('找不到消息内容', 'error');
        return;
    }
    
    // 获取纯文本内容，去除HTML标签
    let content = messageText.textContent || messageText.innerText || '';
    
    // 清理内容，去除多余的空白字符
    content = content.trim().replace(/\s+/g, ' ');
    
    if (!content) {
        showToast('消息内容为空', 'warning');
        return;
    }
    
    // 尝试使用现代clipboard API
    if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(content).then(() => {
        showToast('内容已复制到剪贴板', 'success');
            
            // 视觉反馈：短暂高亮复制按钮
            const copyBtn = messageElement.querySelector('[title="复制"]');
            if (copyBtn) {
                copyBtn.classList.add('active');
                setTimeout(() => copyBtn.classList.remove('active'), 200);
            }
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyTextToClipboard(content);
        });
    } else {
        // 降级方案：使用传统方法
        fallbackCopyTextToClipboard(content);
    }
}

// 降级复制方案
function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    
        document.body.appendChild(textArea);
    textArea.focus();
        textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
        showToast('内容已复制到剪贴板', 'success');
        } else {
            showToast('复制失败，请手动选择复制', 'error');
        }
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动选择复制', 'error');
    }
    
    document.body.removeChild(textArea);
        }

// 移除了鼠标悬停事件，操作按钮现在常驻显示

// 窗口大小变化时的处理
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('chatSidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const chatMain = document.getElementById('chatMain');
    
    // 确保元素存在再操作
    if (!sidebar || !toggleBtn || !chatMain) {
        return;
    }
    
    if (window.innerWidth > 768) {
        // 桌面端：移除移动端的show类
        sidebar.classList.remove('show');
        
        // 根据侧边栏状态调整主聊天区域
        if (sidebar.classList.contains('collapsed')) {
            chatMain.style.width = '100%';
            toggleBtn.classList.add('show');
        } else {
            const sidebarWidth = sidebar.style.width || '340px';
            chatMain.style.width = `calc(100% - ${sidebarWidth})`;
            toggleBtn.classList.remove('show');
        }
    } else {
        // 移动端：隐藏打开按钮，使用移动端逻辑
        toggleBtn.classList.remove('show');
        chatMain.style.width = '100%'; // 移动端始终100%宽度
        
        if (!sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('show');
        }
    }
});

// 页面点击事件处理（移动端侧边栏外部点击关闭）
document.addEventListener('click', function(event) {
    if (window.innerWidth <= 768) {
        const sidebar = document.getElementById('chatSidebar');
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        
        // 确保元素存在再操作
        if (!sidebar || !toggleBtn) {
            return;
        }
        
        if (sidebar.classList.contains('show') && 
            !sidebar.contains(event.target) && 
            !toggleBtn.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    }
}); 

// 插入提示词到输入框
function insertPrompt(prompt) {
    const input = document.getElementById('messageInput');
    if (input) {
        input.value = prompt;
        input.focus();
        // 触发输入事件以确保字数统计更新
        input.dispatchEvent(new Event('input'));
        // 调整输入框高度
        autoResize();
    }
}

// 加载建议问题
async function loadSuggestedQuestions(messageId) {
    try {
        console.log('正在加载建议问题，messageId:', messageId);
        const response = await fetch(`/api/messages/${messageId}/suggested?user=web-user`);
        
        if (!response.ok) {
            console.warn(`建议问题API响应错误: ${response.status} ${response.statusText}`);
            // 如果是400错误，说明功能暂时不可用，使用备用问题
            if (response.status === 400) {
                console.log('建议问题功能暂时不可用，使用备用问题');
                setTimeout(() => {
                    const fallbackQuestions = ["继续深入", "举个例子", "还有其他方面吗？"];
                    displaySuggestedQuestions(messageId, fallbackQuestions);
                }, 2000);
                return;
            }
        }
        
        const data = await response.json();
        console.log('建议问题API响应:', data);
        
        if (data.data && data.data.length > 0) {
            console.log('显示建议问题:', data.data);
            displaySuggestedQuestions(messageId, data.data);
        } else if (data.message && data.message.includes('不可用')) {
            console.log('建议问题功能暂时不可用，使用备用问题');
            setTimeout(() => {
                const fallbackQuestions = ["继续深入", "举个例子", "还有其他方面吗？"];
                displaySuggestedQuestions(messageId, fallbackQuestions);
            }, 2000);
        } else {
            console.log('没有建议问题数据，使用备用问题');
            setTimeout(() => {
                const fallbackQuestions = ["继续深入", "举个例子"];
                displaySuggestedQuestions(messageId, fallbackQuestions);
            }, 2000);
        }
    } catch (error) {
        console.error('加载建议问题失败:', error);
        // 出错时也显示备用问题
        console.log('显示备用建议问题');
        const fallbackQuestions = ["继续深入", "举个例子", "还有其他方面吗？"];
        displaySuggestedQuestions(messageId, fallbackQuestions);
    }
}

// 显示建议问题
function displaySuggestedQuestions(messageId, questions) {
    const suggestedContainer = document.getElementById(`suggested-${messageId}`);
    console.log('查找建议问题容器:', `suggested-${messageId}`, suggestedContainer);
    
    if (!suggestedContainer) {
        console.error('未找到建议问题容器');
        return;
    }
    
    if (questions.length === 0) {
        console.log('没有问题要显示');
        return;
    }
    
    // 限制显示的问题数量（最多2个）
    const limitedQuestions = questions.slice(0, 2);
    
    const questionsHtml = limitedQuestions.map(question => `
        <button class="suggested-question-btn" onclick="insertPrompt('${escapeHtml(question)}')">
            ${escapeHtml(question)}
        </button>
    `).join('');
    
    suggestedContainer.innerHTML = `
        <div class="suggested-questions-header">
            <i class="fas fa-lightbulb"></i>
            <span>建议问题</span>
        </div>
        <div class="suggested-questions-list">
            ${questionsHtml}
        </div>
    `;
    
    suggestedContainer.style.display = 'block';
    console.log('建议问题已显示');
}

// 测试函数 - 显示示例建议问题
function testSuggestedQuestions(messageId) {
    const testQuestions = [
        "继续深入",
        "举个例子"
    ];
    displaySuggestedQuestions(messageId, testQuestions);
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
} 