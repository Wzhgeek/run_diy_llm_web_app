// chat.js - 聊天页面功能脚本

// 全局变量
let currentConversationId = null;
let conversations = [];
let messages = [];
let currentTask = null;
let uploadedFile = null;
let conversationToDelete = null;
let conversationToRename = null;
let webSearchEnabled = false;  // 网络搜索功能状态
let codeModeEnabled = false;   // 代码模式功能状态
let agentModeEnabled = false;  // Agent模式功能状态
let dataReportEnabled = false; // 数据报表功能状态
let currentReportData = null;  // 当前报表数据
let currentReportFilename = null; // 当前报表文件名

// 报表面板拖拽调整功能
let reportResizing = false;
let reportStartX = 0;
let reportStartWidth = 0;
let reportMaxWidth = 70; // 最大70%
let reportMinWidth = 25; // 最小25%

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeChat();
    loadConversations();
    // 延迟执行以确保DOM元素已加载
    setTimeout(() => {
        resetFeatureToggleButtons();
        // 初始化Bootstrap tooltips
        initializeTooltips();
        // 恢复侧边栏状态
        restoreSidebarState();
    }, 100);
});

// 初始化聊天
function initializeChat() {
    // 自动调节输入框高度
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('input', autoResize);
    
    // 初始化markdown渲染
    initializeMarkdown();
    
    // 初始化侧边栏拖拽调整
    initializeSidebarResize();
    
    // 初始化代码行号修复功能
    initCodeLineNumbersFix();
}

// 初始化Markdown渲染
function initializeMarkdown() {
    console.log('🔧 初始化Markdown渲染...');
    
    // 检查依赖库加载情况
    const checks = [
        { name: 'Marked.js', loaded: typeof marked !== 'undefined' },
        { name: 'DOMPurify', loaded: typeof DOMPurify !== 'undefined' },
        { name: 'Highlight.js', loaded: typeof hljs !== 'undefined' }
    ];
    
    checks.forEach(check => {
        if (check.loaded) {
            console.log(`✅ ${check.name} 已加载`);
        } else {
            console.warn(`⚠️ ${check.name} 未加载`);
        }
    });
    
    // 注意：Marked.js的配置现在在base.html中的initializeMarkedJS()函数中完成
    // 这里主要用于检查状态
    console.log('📝 Markdown配置已在全局脚本中完成');
}

// 初始化侧边栏拖拽调节
function initializeSidebarResize() {
    console.log('🔧 初始化侧边栏拖拽调节功能...');
    
    const sidebarResizer = document.getElementById('sidebarResizer');
    const sidebarPanel = document.getElementById('sidebarPanel');
    const chatPanel = document.getElementById('chatPanel');
    
    if (!sidebarResizer || !sidebarPanel || !chatPanel) {
        console.warn('侧边栏拖拽：关键DOM元素不存在');
        return;
    }
    
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    const minWidth = 250; // 最小宽度
    const maxWidth = 600; // 最大宽度
    
    // 获取当前侧边栏宽度（从localStorage或默认值）
    function getCurrentSidebarWidth() {
        const saved = localStorage.getItem('sidebarWidth');
        return saved ? parseInt(saved) : 320; // 默认320px
    }
    
    // 设置侧边栏宽度
    function setSidebarWidth(width) {
        const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, width));
        const percentage = (constrainedWidth / window.innerWidth) * 100;
        
        // 更新DOM样式
        sidebarPanel.style.width = `${constrainedWidth}px`;
        sidebarPanel.style.flexBasis = `${constrainedWidth}px`;
        sidebarPanel.style.minWidth = `${constrainedWidth}px`;
        sidebarPanel.style.maxWidth = `${constrainedWidth}px`;
        
        // 更新聊天面板
        chatPanel.style.width = `calc(100% - ${constrainedWidth}px)`;
        chatPanel.style.flexBasis = `calc(100% - ${constrainedWidth}px)`;
        
        // 保存到localStorage
        localStorage.setItem('sidebarWidth', constrainedWidth.toString());
        
        return constrainedWidth;
    }
    
    // 创建拖拽遮罩
    function createResizeOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-resize-overlay';
        overlay.id = 'sidebarResizeOverlay';
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // 移除拖拽遮罩
    function removeResizeOverlay() {
        const overlay = document.getElementById('sidebarResizeOverlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    // 开始拖拽
    function startResize(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startWidth = getCurrentSidebarWidth();
        
        // 添加视觉反馈
        sidebarResizer.classList.add('dragging');
        document.body.classList.add('sidebar-resizing');
        
        // 创建遮罩
        const overlay = createResizeOverlay();
        
        // 绑定事件
        overlay.addEventListener('mousemove', handleResize);
        overlay.addEventListener('mouseup', stopResize);
        
        console.log('🎯 开始拖拽调整侧边栏宽度', { startX, startWidth });
    }
    
    // 处理拖拽
    function handleResize(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;
        setSidebarWidth(newWidth);
    }
    
    // 结束拖拽
    function stopResize() {
        if (!isResizing) return;
        
        isResizing = false;
        
        // 移除视觉反馈
        sidebarResizer.classList.remove('dragging');
        document.body.classList.remove('sidebar-resizing');
        
        // 移除遮罩
        removeResizeOverlay();
        
        console.log('✅ 拖拽调整完成，当前宽度：', getCurrentSidebarWidth());
    }
    
    // 绑定事件
    sidebarResizer.addEventListener('mousedown', startResize);
    
    // 双击重置宽度
    sidebarResizer.addEventListener('dblclick', () => {
        setSidebarWidth(320); // 重置为默认宽度
        console.log('🔄 重置侧边栏宽度为默认值');
    });
    
    // 页面加载时应用保存的宽度
    const savedWidth = getCurrentSidebarWidth();
    setSidebarWidth(savedWidth);
    
    // 窗口大小改变时重新调整
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            // 移动端时重置样式
            sidebarPanel.style.width = '';
            sidebarPanel.style.flexBasis = '';
            sidebarPanel.style.minWidth = '';
            sidebarPanel.style.maxWidth = '';
            chatPanel.style.width = '';
            chatPanel.style.flexBasis = '';
        } else {
            // 桌面端时应用保存的宽度
            setSidebarWidth(getCurrentSidebarWidth());
        }
    });
    
    console.log('✅ 侧边栏拖拽调节功能初始化完成');
}

// 隐藏侧边栏 - 精简实现
function hideSidebar() {
    const container = document.querySelector('.container-fluid');
    
    if (!container) {
        console.warn('侧边栏隐藏：容器元素不存在');
        return;
    }
    
    // 添加隐藏类，CSS会处理所有样式变化
    container.classList.add('sidebar-hidden');
    
    // 保存状态
    localStorage.setItem('sidebarHidden', 'true');
    
    console.log('✅ 侧边栏已隐藏');
}

// 显示侧边栏 - 精简实现
function showSidebar() {
    const container = document.querySelector('.container-fluid');
    
    if (!container) {
        console.warn('侧边栏显示：容器元素不存在');
        return;
    }
    
    // 移除隐藏类，CSS会处理所有样式变化
    container.classList.remove('sidebar-hidden');
    
    // 保存状态
    localStorage.setItem('sidebarHidden', 'false');
    
    console.log('✅ 侧边栏已显示');
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

// 恢复侧边栏状态 - 精简实现
function restoreSidebarState() {
    const isHidden = localStorage.getItem('sidebarHidden') === 'true';
    
    if (isHidden) {
        const container = document.querySelector('.container-fluid');
        if (container) {
            container.classList.add('sidebar-hidden');
            console.log('✅ 侧边栏状态已恢复为隐藏');
        }
    } else {
        console.log('✅ 侧边栏状态已恢复为显示');
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
        
        // 初始化inputs对象
        if (!requestData.inputs) {
            requestData.inputs = {};
        }
        
        // 添加功能切换参数（始终包含，启用时为1，未启用时为0）
        requestData.inputs.enable_web_search = webSearchEnabled ? 1 : 0;
        requestData.inputs.enable_code = codeModeEnabled ? 1 : 0;
        requestData.inputs.enable_agent_mode = agentModeEnabled ? 1 : 0;
        requestData.inputs.enable_data_report = dataReportEnabled ? 1 : 0;
        
        // 根据文件类型添加inputs（按照新的格式）
        if (currentFileInfo) {
            const fileType = getFileType(currentFileInfo.mime_type || currentFileInfo.type);
            
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
    
    // 思考过程状态跟踪
    let thinkingState = {
        isInThinking: false,
        thinkingContent: '',
        thinkingId: null,
        displayContent: '',  // 累积的显示内容
        completedThinking: [],  // 已完成的思考过程
        activeThinking: null  // 正在进行的思考过程
    };
    
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
                            
                            // 处理流式思考过程
                            const newDisplayContent = processStreamThinking(data.answer, thinkingState);
                            if (newDisplayContent) {
                                thinkingState.displayContent += newDisplayContent;
                            }
                            
                            fullResponse += data.answer;
                            
                            // 更新显示内容
                            updateMessageContentWithThinking(assistantMessageElement, thinkingState.displayContent || '', false);
                            
                        } else if (data.event === 'message_end') {
                            // 处理任何剩余的思考过程
                            finalizeStreamThinking(assistantMessageElement, thinkingState);
                            
                            // 最终更新消息，标记为完成状态
                            if (fullResponse) {
                                updateMessageContentWithThinking(assistantMessageElement, fullResponse, true);
                            }
                            
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

// 处理流式思考过程
function processStreamThinking(newContent, thinkingState) {
    let displayContent = '';
    let contentToProcess = newContent;
    
    while (contentToProcess.length > 0) {
        if (!thinkingState.isInThinking) {
            // 查找思考开始标签
            const thinkStartIndex = contentToProcess.indexOf('<think>');
            if (thinkStartIndex !== -1) {
                // 添加思考开始之前的内容到显示内容
                displayContent += contentToProcess.substring(0, thinkStartIndex);
                
                // 进入思考模式，立即创建思考过程容器
                thinkingState.isInThinking = true;
                thinkingState.thinkingContent = '';
                thinkingState.thinkingId = `thinking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                
                // 添加到正在进行的思考过程（用于实时显示）
                thinkingState.activeThinking = {
                    id: thinkingState.thinkingId,
                    content: ''
                };
                
                // 继续处理剩余内容
                contentToProcess = contentToProcess.substring(thinkStartIndex + 7); // 7 = '<think>'.length
            } else {
                // 没有思考开始标签，全部添加到显示内容
                displayContent += contentToProcess;
                contentToProcess = '';
            }
        } else {
            // 在思考过程中，查找思考结束标签
            const thinkEndIndex = contentToProcess.indexOf('</think>');
            if (thinkEndIndex !== -1) {
                // 添加到思考内容（结束标签之前的内容）
                const finalThinkingContent = contentToProcess.substring(0, thinkEndIndex);
                thinkingState.thinkingContent += finalThinkingContent;
                
                // 更新正在进行的思考过程
                if (thinkingState.activeThinking) {
                    thinkingState.activeThinking.content = thinkingState.thinkingContent;
                }
                
                // 完成思考过程，移动到已完成列表
                thinkingState.completedThinking.push({
                    id: thinkingState.thinkingId,
                    content: thinkingState.thinkingContent
                });
                
                // 退出思考模式，清理状态
                thinkingState.isInThinking = false;
                thinkingState.thinkingContent = '';
                thinkingState.thinkingId = null;
                thinkingState.activeThinking = null;
                
                // 继续处理剩余内容
                contentToProcess = contentToProcess.substring(thinkEndIndex + 8); // 8 = '</think>'.length
            } else {
                // 没有思考结束标签，全部添加到思考内容（流式更新）
                thinkingState.thinkingContent += contentToProcess;
                
                // 实时更新正在进行的思考过程
                if (thinkingState.activeThinking) {
                    thinkingState.activeThinking.content = thinkingState.thinkingContent;
                }
                
                contentToProcess = '';
            }
        }
    }
    
    return displayContent;
}

// 提取HTML报表内容
function extractHtmlReport(content) {
    const reportRegex = /<html_report>([\s\S]*?)<\/html_report>/gi;
    let match;
    let hasReport = false;
    let reportContent = '';
    let reportName = '';
    let contentWithoutReport = content;
    
    while ((match = reportRegex.exec(content)) !== null) {
        hasReport = true;
        reportContent = match[1].trim();
        
        // 尝试从HTML中提取标题作为报表名称
        const titleMatch = reportContent.match(/<title[^>]*>(.*?)<\/title>/i);
        if (titleMatch) {
            reportName = titleMatch[1].trim();
        } else {
            // 如果没有title标签，使用默认名称
            reportName = `数据报表_${new Date().toLocaleString('zh-CN').replace(/[\/\s:]/g, '_')}`;
        }
        
        // 从原内容中移除HTML报表标签，替换为文件预览卡片
        const reportPreview = `[报表文件：${reportName}.html]`;
        contentWithoutReport = contentWithoutReport.replace(match[0], reportPreview);
    }
    
    return {
        hasReport,
        reportContent,
        reportName,
        contentWithoutReport
    };
}

// 更新消息内容，处理思考过程和HTML报表
function updateMessageContentWithThinking(messageElement, fullContent, isCompleted = false) {
    if (!messageElement) return;
    
    // 如果消息已完成，直接处理HTML报表
    if (isCompleted) {
        const { hasReport, reportContent, reportName, contentWithoutReport } = extractHtmlReport(fullContent);
        
        if (hasReport && dataReportEnabled) {
            // 在右侧面板显示报表
            renderReport(reportContent, reportName);
            
            // 更新报表代码显示
            updateReportCode(reportContent);
            
            // 在消息中显示文件预览并标记为完成
            const messageContent = messageElement.querySelector('.message-text');
            if (messageContent) {
                messageContent.innerHTML = renderMarkdownWithReportPreview(contentWithoutReport);
                
                // 标记报表文件预览为完成状态
                const reportPreviews = messageContent.querySelectorAll('.report-file-preview');
                reportPreviews.forEach(preview => {
                    preview.classList.add('completed');
                    const status = preview.querySelector('.report-file-status');
                    if (status) {
                        status.textContent = '生成完成';
                    }
                });
            }
        } else {
            // 普通消息处理
            const messageContent = messageElement.querySelector('.message-text');
            if (messageContent) {
                messageContent.innerHTML = renderMarkdown(fullContent);
            }
        }
        
        return;
    }
    
    // 处理流式内容
    let processedContent = fullContent;
    let reportHtml = '';
    let isInReportTag = false;
    
    // 检测HTML报表标签
    const reportStartRegex = /<html_report>/gi;
    const reportEndRegex = /<\/html_report>/gi;
        
    // 查找开始标签
    const startMatch = reportStartRegex.exec(fullContent);
    if (startMatch) {
        isInReportTag = true;
        // 替换开始标签为文件预览
        const reportName = `数据报表_${new Date().toLocaleString('zh-CN').replace(/[\/\s:]/g, '_')}`;
        const reportPreview = createReportFilePreview(reportName + '.html');
        processedContent = fullContent.substring(0, startMatch.index) + reportPreview;
        
        // 提取报表内容开始位置
        reportHtml = fullContent.substring(startMatch.index + startMatch[0].length);
    }
    
    // 如果在报表标签内，处理报表内容
    if (isInReportTag) {
        const endMatch = reportEndRegex.exec(fullContent);
        if (endMatch) {
            // 找到结束标签，提取完整报表内容
            reportHtml = fullContent.substring(startMatch.index + startMatch[0].length, endMatch.index);
        
            // 在代码面板中流式显示HTML代码
            if (dataReportEnabled) {
                updateReportCodeStream(reportHtml);
            }
            
            // 标记报表为完成
            setTimeout(() => {
                const reportPreviews = messageElement.querySelectorAll('.report-file-preview');
                reportPreviews.forEach(preview => {
                    preview.classList.add('completed');
                    const status = preview.querySelector('.report-file-status');
                    if (status) {
                        status.textContent = '生成完成';
                    }
            });
            }, 100);
        } else {
            // 还在报表标签内，在代码面板中流式显示当前内容
            if (dataReportEnabled && reportHtml) {
                updateReportCodeStream(reportHtml);
            }
        }
    }
    
    // 更新消息显示内容
    const messageContent = messageElement.querySelector('.message-text');
    if (messageContent) {
        messageContent.innerHTML = renderMarkdown(processedContent);
    }
    }
    
// 流式更新报表代码显示 - 优化版本
function updateReportCodeStream(htmlCode) {
    currentReportHtmlCode = htmlCode;
    const codeText = document.getElementById('reportCodeText');
    if (codeText) {
        // 更新代码内容
        codeText.textContent = htmlCode;
        
        // 确保父元素有正确的class
        const preElement = codeText.parentElement;
        if (preElement && preElement.tagName === 'PRE') {
            preElement.className = 'line-numbers language-html';
            preElement.style.counterReset = 'linenumber';
        }
        
        // 如果Prism.js可用，进行语法高亮和行号处理
        if (typeof Prism !== 'undefined') {
            try {
                // 移除现有的行号
                const existingLineNumbers = preElement.querySelector('.line-numbers-rows');
                if (existingLineNumbers) {
                    existingLineNumbers.remove();
                }
                
                // 重新应用语法高亮
                Prism.highlightElement(codeText);
                
                // 强制重新生成行号
                if (Prism.plugins.LineNumbers) {
                    Prism.plugins.LineNumbers.resize(codeText);
                }
                
                // 应用专门的行号修复
                setTimeout(() => {
                    fixCodeLineNumbers();
                }, 50);
                
                // 确保滚动位置在底部（对于流式更新）
                setTimeout(() => {
                    const preElement = codeText.parentElement;
                    if (preElement && preElement.scrollHeight > preElement.clientHeight) {
                        preElement.scrollTop = preElement.scrollHeight;
                    }
                }, 100);
                
            } catch (error) {
                console.warn('Prism.js 语法高亮失败:', error);
                // 如果Prism失败，直接应用行号修复
                setTimeout(() => {
                    fixCodeLineNumbers();
                }, 50);
            }
        } else if (typeof hljs !== 'undefined') {
            // 降级到hljs
            try {
                hljs.highlightElement(codeText);
                // hljs后也应用行号修复
                setTimeout(() => {
                    fixCodeLineNumbers();
                }, 50);
            } catch (error) {
                console.warn('hljs 语法高亮失败:', error);
            }
        } else {
            // 没有语法高亮库时，直接应用行号修复
            setTimeout(() => {
                fixCodeLineNumbers();
            }, 50);
        }
    }
    
    // 如果报表面板未显示，自动显示
    if (dataReportEnabled) {
        showReportPanel();
        // 自动切换到代码视图以显示流式代码
        switchToCode();
    }
}

// 创建思考过程HTML结构
function createThinkingHTML(thinkingId, thinkingContent, isActive = false) {
    // 如果是正在进行的思考过程，添加特殊样式和打字机效果
    const activeClass = isActive ? ' thinking-active' : '';
    const typingIndicator = isActive ? '<span class="thinking-typing">▋</span>' : '';
    
    return `
        <div class="thinking-container${activeClass}" data-thinking-id="${thinkingId}">
            <div class="thinking-header" onclick="toggleThinking('${thinkingId}')">
                <div class="thinking-icon">
                    <i class="fas fa-brain"></i>
                </div>
                <div class="thinking-title">思考过程${isActive ? ' (正在思考...)' : ''}</div>
                <div class="thinking-toggle">
                    <i class="fas fa-chevron-down"></i>
                </div>
            </div>
            <div class="thinking-content" id="${thinkingId}">
                <div class="thinking-text">${thinkingContent.trim()}${typingIndicator}</div>
            </div>
        </div>
    `;
}

// 完成流式思考过程处理
function finalizeStreamThinking(messageElement, thinkingState) {
    if (thinkingState.isInThinking && thinkingState.thinkingContent) {
        // 如果还在思考过程中但消息已结束，强制完成思考过程
        thinkingState.completedThinking.push({
            id: thinkingState.thinkingId || `thinking-final-${Date.now()}`,
            content: thinkingState.thinkingContent
        });
        thinkingState.isInThinking = false;
        thinkingState.activeThinking = null;
        
        // 更新最终显示
        updateMessageContentWithThinking(messageElement, thinkingState.displayContent || '', true);
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
        
        // 触发代码块的语法高亮
        if (typeof hljs !== 'undefined') {
            const codeBlocks = textElement.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                hljs.highlightElement(block);
            });
        }
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
    
    // 对完成的消息进行代码高亮处理
    if (typeof hljs !== 'undefined') {
        const codeBlocks = messageElement.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
        });
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

// 渲染Markdown内容
function renderMarkdown(content) {
    // 渲染Markdown内容
    
    // 检查marked是否已加载
    if (typeof marked === 'undefined') {
        console.warn('⚠️ Marked.js未加载，使用基本格式化');
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
    
    try {
        // 使用Marked.js渲染
        
        // 按照官网文档标准使用marked.parse()
        const htmlContent = marked.parse(content);
        // Markdown解析成功
        
        // 如果DOMPurify可用，进行安全清理
        if (typeof DOMPurify !== 'undefined') {
            const cleanHtml = DOMPurify.sanitize(htmlContent, {
                ALLOWED_TAGS: [
                    'p', 'br', 'strong', 'em', 'u', 'strike', 'del', 'code', 'pre', 'blockquote', 
                    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 
                    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span', 'sup', 'sub',
                    'hr', 'mark', 'small', 'b', 'i', 's'
                ],
                ALLOWED_ATTR: [
                    'href', 'title', 'src', 'alt', 'class', 'id', 'target', 'rel', 
                    'colspan', 'rowspan', 'align', 'valign', 'width', 'height'
                ],
                // 允许数据属性和style属性（受限）
                ALLOW_DATA_ATTR: true,
                ADD_ATTR: ['style'],
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
            });
            console.log('🛡️ HTML安全清理完成，最终长度:', cleanHtml.length);
            return cleanHtml;
        } else {
            console.warn('⚠️ DOMPurify未加载，直接返回HTML（存在安全风险）');
            return htmlContent;
        }
        
    } catch (error) {
        console.error('❌ Markdown渲染失败:', error);
        console.error('错误详情:', error.stack);
        
        // 降级处理：基本markdown语法替换
        return content
            .replace(/### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/# (.*?)$/gm, '<h1>$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([^```]+)```/g, '<pre><code>$1</code></pre>')
            .replace(/> (.*?)$/gm, '<blockquote>$1</blockquote>')
            .replace(/\n/g, '<br>');
    }
}

// 渲染包含报表文件预览的Markdown内容
function renderMarkdownWithReportPreview(content) {
    if (!content) return '';
    
    // 首先正常渲染Markdown
    let renderedContent = renderMarkdown(content);
    
    // 然后处理报表文件预览标签（在已渲染的HTML中）
    const reportFileRegex = /\[报表文件：([^\]]+)\]/g;
    renderedContent = renderedContent.replace(reportFileRegex, (match, filename) => {
        return createReportFilePreview(filename);
    });
    
    return renderedContent;
}

// 创建报表文件预览卡片（简约版）
function createReportFilePreview(filename) {
    const fileId = `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `
        <div class="report-file-preview simple" id="${fileId}">
            <div class="report-file-icon simple">
                <div class="simple-loading-dot"></div>
                <i class="fas fa-file-alt"></i>
            </div>
            <div class="report-file-info">
                <div class="report-file-name">${escapeHtml(filename)}</div>
                <div class="report-file-status">正在生成中...</div>
            </div>
        </div>
    `;
}

// 解析思考过程内容
function parseThinkingContent(content) {
    // 使用正则表达式查找 <think>...</think> 标签
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    let parsedContent = content;
    let thinkingId = 0;
    
    // 替换所有的 <think> 标签为特殊的HTML结构
    parsedContent = parsedContent.replace(thinkRegex, (match, thinkContent) => {
        thinkingId++;
        const uniqueId = `thinking-${Date.now()}-${thinkingId}`;
        
        return `
            <div class="thinking-container" data-thinking-id="${uniqueId}">
                <div class="thinking-header" onclick="toggleThinking('${uniqueId}')">
                    <div class="thinking-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="thinking-title">思考过程</div>
                    <div class="thinking-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="thinking-content" id="${uniqueId}">
                    <div class="thinking-text">${thinkContent.trim()}</div>
                </div>
            </div>
        `;
    });
    
    return parsedContent;
}

// 切换思考过程的显示/隐藏
function toggleThinking(thinkingId) {
    const container = document.querySelector(`[data-thinking-id="${thinkingId}"]`);
    const content = document.getElementById(thinkingId);
    const toggle = container.querySelector('.thinking-toggle i');
    
    if (content.classList.contains('collapsed')) {
        // 展开
        content.classList.remove('collapsed');
        toggle.classList.remove('fa-chevron-right');
        toggle.classList.add('fa-chevron-down');
        container.classList.remove('collapsed');
    } else {
        // 折叠
        content.classList.add('collapsed');
        toggle.classList.remove('fa-chevron-down');
        toggle.classList.add('fa-chevron-right');
        container.classList.add('collapsed');
    }
}

function formatMessageContent(content) {
    // 对于历史消息，仍然使用完整的思考过程解析
    // 首先解析思考过程内容
    const contentWithThinking = parseThinkingContent(content);
    // 然后进行Markdown渲染，包括报表文件预览
    return renderMarkdownWithReportPreview(contentWithThinking);
}

// 测试markdown渲染（用于调试）
function testMarkdownRendering() {
    const testContent = `# 复数的模（绝对值）计算方法

## 一、代数形式的复数计算
对于复数 \\( z = a + bi \\)（其中 \\( a,b \\in \\mathbb{R} \\)），其模定义为：
\\[
|z| = \\sqrt{a^2 + b^2}
\\]

**计算示例**：
\\[
|3 + 4i| = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = 5
\\]

## 二、几何解释
在复平面上，复数 \\( z = a + bi \\) 对应点 \\( (a,b) \\)，其模即为该点到原点的距离。

## 三、极坐标形式的模
当复数表示为极坐标形式 \\( z = r(\\cos\\theta + i\\sin\\theta) \\) 或指数形式 \\( z = re^{i\\theta} \\) 时：
\\[
|z| = r
\\]

**性质验证**：
1. 非负性：\\( |z| \\geq 0 \\)
2. 乘法性质：\\( |z_1 \\cdot z_2| = |z_1| \\cdot |z_2| \\)
3. 共轭性质：\\( |\\overline{z}| = |z| \\)
4. 三角不等式：\\( |z_1 + z_2| \\leq |z_1| + |z_2| \\)

## 四、应用实例

\`\`\`javascript
// JavaScript中计算复数模的函数
function complexMod(real, imag) {
    return Math.sqrt(real * real + imag * imag);
}

// 示例
console.log(complexMod(3, 4)); // 输出: 5
\`\`\`

> **提示**：复数的模是实数，且始终非负。在物理学中，复数的模常表示振幅或强度。

**测试完成！**`;

    console.log('🧪 开始测试markdown渲染...');
    console.log('📝 原始内容长度:', testContent.length);
    
    // 检查关键库是否加载
    const libStatus = {
        marked: typeof marked !== 'undefined',
        hljs: typeof hljs !== 'undefined',
        DOMPurify: typeof DOMPurify !== 'undefined'
    };
    console.log('📚 库加载状态:', libStatus);
    
    const result = renderMarkdown(testContent);
    console.log('🎯 渲染结果长度:', result.length);
    console.log('🎯 渲染结果预览:', result.substring(0, 200) + '...');
    
    return result;
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
    } else if (fileName.toLowerCase().endsWith('.md') || file.type === 'text/markdown') {
        fileIcon.className = 'file-icon fab fa-markdown text-info';
    } else if (fileName.toLowerCase().endsWith('.html') || file.type === 'text/html') {
        fileIcon.className = 'file-icon fab fa-html5 text-warning';
    } else if (fileName.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
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

// 功能切换按钮相关函数
function toggleWebSearch() {
    // 检查Agent模式是否已启用
    if (!webSearchEnabled && agentModeEnabled) {
        showToast('Agent模式已启用，无法同时启用网络搜索', 'warning');
        return;
    }
    
    webSearchEnabled = !webSearchEnabled;
    const button = document.getElementById('webSearchToggle');
    
    if (webSearchEnabled) {
        button.classList.add('active');
        button.title = '关闭网络搜索';
        console.log('✅ 网络搜索功能已启用');
        showToast('网络搜索功能已启用', 'success');
    } else {
        button.classList.remove('active');
        button.title = '启用网络搜索';
        console.log('❌ 网络搜索功能已关闭');
        showToast('网络搜索功能已关闭', 'info');
    }
}

function toggleCodeMode() {
    // 检查Agent模式是否已启用
    if (!codeModeEnabled && agentModeEnabled) {
        showToast('Agent模式已启用，无法同时启用代码模式', 'warning');
        return;
    }
    
    codeModeEnabled = !codeModeEnabled;
    const button = document.getElementById('codeModeToggle');
    
    if (codeModeEnabled) {
        button.classList.add('active');
        button.title = '关闭代码模式';
        console.log('✅ 代码模式已启用');
        showToast('代码模式已启用', 'success');
    } else {
        button.classList.remove('active');
        button.title = '启用代码模式';
        console.log('❌ 代码模式已关闭');
        showToast('代码模式已关闭', 'info');
    }
}

function toggleAgentMode() {
    agentModeEnabled = !agentModeEnabled;
    const button = document.getElementById('agentModeToggle');
    
    if (agentModeEnabled) {
        // 启用Agent模式时，自动禁用网络搜索和代码模式
        if (webSearchEnabled) {
            webSearchEnabled = false;
            const webSearchButton = document.getElementById('webSearchToggle');
            webSearchButton.classList.remove('active');
            webSearchButton.title = '启用网络搜索';
            console.log('❌ 网络搜索功能已自动关闭（因为启用了Agent模式）');
        }
        
        if (codeModeEnabled) {
            codeModeEnabled = false;
            const codeModeButton = document.getElementById('codeModeToggle');
            codeModeButton.classList.remove('active');
            codeModeButton.title = '启用代码模式';
            console.log('❌ 代码模式已自动关闭（因为启用了Agent模式）');
        }
        
        button.classList.add('active');
        button.title = '关闭Agent模式';
        console.log('✅ Agent模式已启用');
        showToast('Agent模式已启用，网络搜索和代码模式已自动关闭', 'success');
    } else {
        button.classList.remove('active');
        button.title = '启用Agent模式';
        console.log('❌ Agent模式已关闭');
        showToast('Agent模式已关闭', 'info');
    }
}

function toggleDataReport() {
    dataReportEnabled = !dataReportEnabled;
    const button = document.getElementById('dataReportToggle');
    
    if (dataReportEnabled) {
        button.classList.add('active');
        button.title = '关闭数据报表';
        showReportPanel();
        console.log('✅ 数据报表已启用');
        showToast('数据报表已启用', 'success');
    } else {
        button.classList.remove('active');
        button.title = '启用数据报表';
        hideReportPanel();
        console.log('❌ 数据报表已关闭');
        showToast('数据报表已关闭', 'info');
    }
}

// 重置功能切换按钮状态（页面刷新时调用）
function resetFeatureToggleButtons() {
    webSearchEnabled = false;
    codeModeEnabled = false;
    agentModeEnabled = false;
    dataReportEnabled = false;
    
    const webSearchButton = document.getElementById('webSearchToggle');
    const codeModeButton = document.getElementById('codeModeToggle');
    const agentModeButton = document.getElementById('agentModeToggle');
    const dataReportButton = document.getElementById('dataReportToggle');
    
    if (webSearchButton) {
        webSearchButton.classList.remove('active');
        webSearchButton.title = '启用网络搜索';
    }
    
    if (codeModeButton) {
        codeModeButton.classList.remove('active');
        codeModeButton.title = '启用代码模式';
    }
    
    if (agentModeButton) {
        agentModeButton.classList.remove('active');
        agentModeButton.title = '启用Agent模式';
    }
    
    if (dataReportButton) {
        dataReportButton.classList.remove('active');
        dataReportButton.title = '启用数据报表';
    }
    
    console.log('🔄 功能切换按钮状态已重置');
}

// 初始化Bootstrap tooltips
function initializeTooltips() {
    // 检查Bootstrap是否已加载
    if (typeof bootstrap !== 'undefined') {
        // 初始化所有tooltip
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                delay: { show: 500, hide: 100 }
            });
        });
        console.log('✅ Bootstrap tooltips 初始化完成');
    } else {
        console.warn('⚠️ Bootstrap 未加载，无法初始化 tooltips');
    }
}

// 数据报表面板相关函数（已合并到拖拽功能中）

function refreshReport() {
    if (currentReportData) {
        renderReport(currentReportData, currentReportFilename);
        showToast('报表已刷新', 'success');
    } else {
        showToast('暂无报表数据可刷新', 'warning');
    }
}

function downloadReport() {
    if (!currentReportData || !currentReportFilename) {
        showToast('暂无报表可下载', 'warning');
        return;
    }
    
    try {
        // 首先保存到服务器
        saveReportToServer(currentReportData, currentReportFilename).then(() => {
            // 创建下载链接
            const blob = new Blob([currentReportData], { type: 'text/html;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentReportFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            console.log(`📊 报表已下载: ${currentReportFilename}`);
            showToast(`报表 "${currentReportFilename}" 下载成功`, 'success');
        }).catch(error => {
            console.error('报表保存失败:', error);
            // 即使保存失败，仍然允许下载
            const blob = new Blob([currentReportData], { type: 'text/html;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = currentReportFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showToast('报表已下载（未保存到服务器）', 'warning');
        });
    } catch (error) {
        console.error('报表下载失败:', error);
        showToast('报表下载失败', 'error');
    }
}

// 更新报表渲染函数
function renderReport(reportHtml, filename) {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;
    
    // 保存报表数据
    currentReportData = reportHtml;
    currentReportFilename = filename || `report_${Date.now()}.html`;
    currentReportHtmlCode = reportHtml;
    
    // 如果当前在代码模式，更新代码显示
    if (currentReportTab === 'code') {
        updateReportCode(reportHtml);
    }
    
    // 清空现有内容
    reportContent.innerHTML = '';
    
    // 创建iframe来渲染报表
    const iframe = document.createElement('iframe');
    iframe.className = 'report-iframe';
    iframe.srcdoc = reportHtml;
    
    reportContent.appendChild(iframe);
    
    console.log(`📊 报表已渲染: ${currentReportFilename}`);
    showToast('报表生成完成', 'success');
}

function displayReportFilePreview(filename, description) {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;
    
    reportContent.innerHTML = `
        <div class="report-file-preview">
            <div class="report-file-icon">
                <i class="fas fa-file-code"></i>
            </div>
            <div class="report-file-name">${filename}</div>
            <div class="report-file-description">${description}</div>
            <div class="report-file-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="viewReportInPanel()" title="在右侧面板查看">
                    <i class="fas fa-eye me-1"></i>查看报表
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="downloadReport()" title="下载到本地">
                    <i class="fas fa-download me-1"></i>下载
                </button>
            </div>
        </div>
    `;
}

function viewReportInPanel() {
    if (currentReportData) {
        renderReport(currentReportData, currentReportFilename);
        showToast('报表已在右侧面板显示', 'success');
    } else {
        showToast('报表数据不可用', 'error');
    }
}

// 处理AI回复中的报表内容
function processReportInMessage(messageContent) {
    // 检查消息中是否包含报表标记
    const reportPattern = /\[报表文件：(.+?)\]/g;
    let processedContent = messageContent;
    let reportFound = false;
    
    processedContent = processedContent.replace(reportPattern, (match, filename) => {
        reportFound = true;
        return `<div class="message-report-file">
            <div class="report-file-indicator">
                <i class="fas fa-file-code"></i>
                <span>报表文件：${filename}</span>
                <button class="btn btn-sm btn-link" onclick="viewReportInPanel()" title="在右侧面板查看">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </div>
        </div>`;
    });
    
    return { content: processedContent, hasReport: reportFound };
}

// 模拟接收报表数据的函数（后端集成时替换）
function receiveReportData(reportHtml, filename, description) {
    if (dataReportEnabled) {
        // 渲染报表到右侧面板
        renderReport(reportHtml, filename);
        
        // 在聊天消息中显示文件预览（如果报表面板不可见）
        if (!document.getElementById('reportPanel').style.display === 'flex') {
            displayReportFilePreview(filename, description);
        }
        
        showToast(`报表 "${filename}" 已生成`, 'success');
    }
}

// 测试数据报表功能（开发用，后期移除）
function testReportFunction() {
    if (!dataReportEnabled) {
        showToast('请先启用数据报表功能', 'warning');
        return;
    }
    
    // 模拟报表HTML数据
    const sampleReportHtml = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>数据分析报表</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f8f9fa; }
            .header { text-align: center; margin-bottom: 30px; }
            .chart-container { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .stat-number { font-size: 2em; font-weight: bold; color: #2c5aa0; }
            .stat-label { color: #666; margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>数据分析报表</h1>
            <p>生成时间：${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">1,234</div>
                <div class="stat-label">总用户数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">89.5%</div>
                <div class="stat-label">活跃率</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">567</div>
                <div class="stat-label">新增用户</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">98.2%</div>
                <div class="stat-label">满意度</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>用户增长趋势</h3>
            <canvas id="growthChart" width="400" height="200"></canvas>
        </div>
        
        <div class="chart-container">
            <h3>功能使用分布</h3>
            <canvas id="usageChart" width="400" height="200"></canvas>
        </div>
        
        <script>
            // 用户增长趋势图
            const growthCtx = document.getElementById('growthChart').getContext('2d');
            new Chart(growthCtx, {
                type: 'line',
                data: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    datasets: [{
                        label: '用户数量',
                        data: [120, 190, 300, 500, 800, 1234],
                        borderColor: '#2c5aa0',
                        backgroundColor: 'rgba(44, 90, 160, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true }
                    }
                }
            });
            
            // 功能使用分布图
            const usageCtx = document.getElementById('usageChart').getContext('2d');
            new Chart(usageCtx, {
                type: 'pie',
                data: {
                    labels: ['AI对话', '文档处理', '知识库', '数据报表'],
                    datasets: [{
                        data: [45, 25, 20, 10],
                        backgroundColor: ['#2c5aa0', '#28a745', '#ffc107', '#dc3545']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        </script>
    </body>
    </html>`;
    
    const filename = `数据分析报表_${new Date().toISOString().slice(0, 10)}.html`;
    const description = "包含用户统计、增长趋势和功能使用分析的综合数据报表";
    
    // 渲染报表
    receiveReportData(sampleReportHtml, filename, description);
    
    // 模拟在聊天消息中显示
    const messageText = `好的，我已为您收集了最新的数据信息，生成的分析报表如下：\n\n[报表文件：${filename}]\n\n报表包含了详细的用户统计数据、增长趋势分析和功能使用分布情况。您可以在右侧面板查看完整报表，或下载到本地保存。`;
    
    // 添加测试消息到聊天区域
    addMessage('assistant', messageText);
    
    console.log('📊 测试报表已生成');
}

// 在控制台中添加测试提示
console.log('💡 数据报表测试：启用数据报表功能后，在控制台运行 testReportFunction() 来测试报表生成');

// 与后端API交互的函数
async function saveReportToServer(reportHtml, filename) {
    try {
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                html: reportHtml,
                filename: filename
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 报表已保存到服务器:', result);
        return result;
    } catch (error) {
        console.error('保存报表到服务器失败:', error);
        throw error;
    }
}

async function loadReportsFromServer() {
    try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('📊 从服务器加载报表列表:', result);
        return result.reports || [];
    } catch (error) {
        console.error('从服务器加载报表列表失败:', error);
        return [];
    }
}

function downloadReportFromServer(filename) {
    const downloadUrl = `/api/reports/${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log(`📊 从服务器下载报表: ${filename}`);
}

// 测试HTML报表检测功能
function testHtmlReportDetection() {
    console.log('🧪 开始测试HTML报表检测功能...');
    
    // 模拟包含HTML报表标签的流式回答内容
    const testContent = `这是一个测试回答，下面生成一个数据报表：

<html_report>
<!DOCTYPE html>
<html>
<head>
    <title>用户数据统计报表</title>
    <meta charset="UTF-8">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; margin-bottom: 30px; }
        .chart-container { width: 100%; height: 400px; margin: 20px 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 0.9em; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 用户数据统计报表</h1>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">1,234</div>
                <div class="stat-label">总用户数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">89%</div>
                <div class="stat-label">活跃率</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">567</div>
                <div class="stat-label">新增用户</div>
            </div>
        </div>
        <div class="chart-container">
            <canvas id="userChart"></canvas>
        </div>
    </div>
    <script>
        const ctx = document.getElementById('userChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                datasets: [{
                    label: '用户增长',
                    data: [65, 78, 95, 120, 145, 178],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '用户增长趋势'
                    }
                }
            }
        });
    </script>
</body>
</html>
</html_report>

以上是生成的用户数据统计报表，可以查看用户增长趋势和关键指标。`;

    // 测试HTML报表检测
    const reportResult = extractHtmlReport(testContent);
    
    console.log('📊 检测结果:', {
        hasReport: reportResult.hasReport,
        reportName: reportResult.reportName,
        reportHtmlLength: reportResult.reportHtml.length,
        cleanContentLength: reportResult.cleanContent.length
    });
    
    if (reportResult.hasReport) {
        console.log('✅ HTML报表检测成功！');
        console.log('📝 报表名称:', reportResult.reportName);
        console.log('🧹 清理后内容:', reportResult.cleanContent);
        
        // 如果数据报表功能已启用，测试渲染
        if (dataReportEnabled) {
            console.log('🎨 测试报表渲染...');
            renderReport(reportResult.reportHtml, reportResult.reportName);
            console.log('✅ 报表渲染完成！');
        } else {
            console.log('ℹ️ 数据报表功能未启用，跳过渲染测试');
        }
        
        // 测试报表文件预览卡片生成
        const previewHtml = createReportFilePreview(reportResult.reportName + '.html');
        console.log('🎯 报表文件预览HTML:', previewHtml);
    } else {
        console.log('❌ 未检测到HTML报表标签');
    }
    
    return reportResult;
}

// 在控制台添加测试提示
console.log('💡 提示：可以在控制台运行 testHtmlReportDetection() 来测试HTML报表检测功能');

// 在控制台添加测试提示
console.log('💡 提示：可以在控制台运行 testHtmlReportDetection() 来测试HTML报表检测功能');

// 诊断报表面板显示问题的函数
function diagnoseReportPanel() {
    console.log('🔍 开始诊断报表面板显示问题...');
    
    // 检查HTML元素是否存在
    const reportPanel = document.getElementById('reportPanel');
    const chatMain = document.getElementById('chatMain');
    const chatReportContainer = document.querySelector('.chat-report-container');
    const dataReportToggle = document.getElementById('dataReportToggle');
    
    console.log('📋 HTML元素检查:');
    console.log('  reportPanel存在:', !!reportPanel);
    console.log('  chatMain存在:', !!chatMain);
    console.log('  chatReportContainer存在:', !!chatReportContainer);
    console.log('  dataReportToggle存在:', !!dataReportToggle);
    
    if (reportPanel) {
        console.log('📊 报表面板状态:');
        console.log('  display样式:', window.getComputedStyle(reportPanel).display);
        console.log('  visibility样式:', window.getComputedStyle(reportPanel).visibility);
        console.log('  width样式:', window.getComputedStyle(reportPanel).width);
        console.log('  height样式:', window.getComputedStyle(reportPanel).height);
        console.log('  position样式:', window.getComputedStyle(reportPanel).position);
        console.log('  z-index样式:', window.getComputedStyle(reportPanel).zIndex);
    }
    
    if (chatMain) {
        console.log('💬 聊天主区域状态:');
        console.log('  是否有with-report类:', chatMain.classList.contains('with-report'));
        console.log('  width样式:', window.getComputedStyle(chatMain).width);
        console.log('  flex样式:', window.getComputedStyle(chatMain).flex);
    }
    
    if (chatReportContainer) {
        console.log('📦 聊天报表容器状态:');
        console.log('  display样式:', window.getComputedStyle(chatReportContainer).display);
        console.log('  flex-direction样式:', window.getComputedStyle(chatReportContainer).flexDirection);
        console.log('  children数量:', chatReportContainer.children.length);
        console.log('  children:', Array.from(chatReportContainer.children).map(child => child.id || child.className));
    }
    
    console.log('🎛️ 功能状态:');
    console.log('  dataReportEnabled:', dataReportEnabled);
    console.log('  按钮激活状态:', dataReportToggle?.classList.contains('active'));
    
    // 尝试强制显示报表面板
    console.log('🔧 尝试强制显示报表面板...');
    if (reportPanel) {
        reportPanel.style.display = 'flex';
        reportPanel.style.width = '40%';
        reportPanel.style.background = 'red'; // 临时设置红色背景便于查看
        console.log('✅ 已强制设置报表面板为可见状态');
    }
    
    if (chatMain) {
        chatMain.classList.add('with-report');
        chatMain.style.width = '60%';
        console.log('✅ 已强制设置聊天主区域为报表模式');
    }
    
    console.log('🎯 诊断完成！如果报表面板仍然不可见，可能是CSS层级问题');
}

// 在控制台添加诊断提示
console.log('🔧 提示：可以在控制台运行 diagnoseReportPanel() 来诊断报表面板显示问题');

// 在控制台添加诊断提示
console.log('🔧 提示：可以在控制台运行 diagnoseReportPanel() 来诊断报表面板显示问题');

// 简单测试报表面板显示的函数
function testReportPanelDisplay() {
    console.log('🧪 开始测试报表面板显示...');
    
    // 直接启用数据报表功能
    dataReportEnabled = true;
    const button = document.getElementById('dataReportToggle');
    if (button) {
        button.classList.add('active');
        button.title = '关闭数据报表';
    }
    
    // 强制显示报表面板
    showReportPanel();
    
    // 等待DOM更新后再测试
    setTimeout(() => {
        const reportPanel = document.getElementById('reportPanel');
        const chatMain = document.getElementById('chatMain');
        
        console.log('📊 测试结果:');
        console.log('  报表面板可见性:', reportPanel ? window.getComputedStyle(reportPanel).display : '元素不存在');
        console.log('  聊天区域有报表类:', chatMain ? chatMain.classList.contains('with-report') : '元素不存在');
        
        // 添加测试内容
        if (reportPanel) {
            const reportContent = document.getElementById('reportContent');
            if (reportContent && reportContent.innerHTML.includes('report-welcome')) {
                console.log('✅ 报表面板已显示并包含默认内容');
            } else {
                console.log('⚠️ 报表面板显示但内容异常');
            }
        } else {
            console.log('❌ 报表面板未找到');
        }
        
        // 测试切换功能
        console.log('🔄 测试切换功能...');
        setTimeout(() => {
            switchToCode();
            console.log('✅ 切换到HTML代码模式');
            setTimeout(() => {
                switchToPreview();
                console.log('✅ 切换回预览模式');
            }, 1000);
        }, 500);
        
        // 生成测试报表
        testReportFunction();
    }, 100);
    
    console.log('✅ 测试报表面板显示完成');
}

// 在控制台添加测试提示
console.log('🎯 提示：可以在控制台运行 testReportPanelDisplay() 来快速测试报表面板显示');

// 报表面板切换功能
let currentReportTab = 'preview'; // 'preview' 或 'code'
let currentReportHtmlCode = ''; // 存储当前报表的HTML代码

// 切换到预览模式
function switchToPreview() {
    // 显示预览内容
    const reportContent = document.getElementById('reportContent');
    if (reportContent) {
        reportContent.style.display = 'block';
    }
    
    // 隐藏HTML代码内容
    const reportCodeContent = document.getElementById('reportCodeContent');
    if (reportCodeContent) {
        reportCodeContent.style.display = 'none';
    }
    
    // 更新按钮状态
    const previewTab = document.getElementById('previewTab');
    const codeTab = document.getElementById('codeTab');
    
    if (previewTab && codeTab) {
        previewTab.classList.add('active');
        previewTab.classList.remove('btn-outline-primary');
        previewTab.classList.add('btn-primary');
        
        codeTab.classList.remove('active');
        codeTab.classList.add('btn-outline-primary');
        codeTab.classList.remove('btn-primary');
    }
}

// 切换到HTML代码页面
function switchToCode() {
    // 隐藏预览内容
    const reportContent = document.getElementById('reportContent');
    if (reportContent) {
        reportContent.style.display = 'none';
    }
    
    // 显示HTML代码内容
    const reportCodeContent = document.getElementById('reportCodeContent');
    if (reportCodeContent) {
        reportCodeContent.style.display = 'block';
    }
    
    // 更新按钮状态
    const previewTab = document.getElementById('previewTab');
    const codeTab = document.getElementById('codeTab');
    
    if (previewTab && codeTab) {
        previewTab.classList.remove('active');
        previewTab.classList.add('btn-outline-primary');
        previewTab.classList.remove('btn-primary');
        
        codeTab.classList.add('active');
        codeTab.classList.remove('btn-outline-primary');
        codeTab.classList.add('btn-primary');
    }
    
    // 如果有代码内容，重新进行语法高亮
    const codeElement = document.getElementById('reportCodeText');
    if (codeElement && typeof hljs !== 'undefined') {
        hljs.highlightElement(codeElement);
    }
}

// 更新HTML代码显示
function updateReportCode(htmlCode) {
    currentReportHtmlCode = htmlCode;
    const codeText = document.getElementById('reportCodeText');
    if (codeText) {
        // 更新代码内容
        codeText.textContent = htmlCode;
        
        // 确保父元素有正确的class
        const preElement = codeText.parentElement;
        if (preElement && preElement.tagName === 'PRE') {
            preElement.className = 'line-numbers language-html';
            preElement.style.counterReset = 'linenumber';
        }
        
        // 如果Prism.js可用，进行语法高亮和行号处理
        if (typeof Prism !== 'undefined') {
            try {
                // 移除现有的行号
                const existingLineNumbers = preElement.querySelector('.line-numbers-rows');
                if (existingLineNumbers) {
                    existingLineNumbers.remove();
                }
                
                // 重新应用语法高亮
                Prism.highlightElement(codeText);
                
                // 强制重新生成行号
                if (Prism.plugins.LineNumbers) {
                    Prism.plugins.LineNumbers.resize(codeText);
                }
                
                // 应用专门的行号修复
                setTimeout(() => {
                    fixCodeLineNumbers();
                }, 50);
                
            } catch (error) {
                console.warn('Prism.js 语法高亮失败:', error);
                // 如果Prism失败，直接应用行号修复
                setTimeout(() => {
                    fixCodeLineNumbers();
                }, 50);
            }
        } else if (typeof hljs !== 'undefined') {
            // 降级到hljs
            try {
                hljs.highlightElement(codeText);
                // hljs后也应用行号修复
                setTimeout(() => {
                    fixCodeLineNumbers();
                }, 50);
            } catch (error) {
                console.warn('hljs 语法高亮失败:', error);
            }
        } else {
            // 没有语法高亮库时，直接应用行号修复
            setTimeout(() => {
                fixCodeLineNumbers();
            }, 50);
        }
    }
}

// 复制报表代码
function copyReportCode() {
    if (!currentReportHtmlCode) {
        showToast('暂无HTML代码可复制', 'warning');
        return;
    }
    
    try {
        navigator.clipboard.writeText(currentReportHtmlCode).then(() => {
            showToast('HTML代码已复制到剪贴板', 'success');
        }).catch(() => {
            // 降级到传统复制方法
            fallbackCopyTextToClipboard(currentReportHtmlCode);
            showToast('HTML代码已复制到剪贴板', 'success');
        });
    } catch (error) {
        console.error('复制失败:', error);
        showToast('复制失败', 'error');
    }
}

// 更新报表文件状态
function updateReportFileStatus(status) {
    const reportFilePreviews = document.querySelectorAll('.report-file-status');
    reportFilePreviews.forEach(statusElement => {
        statusElement.textContent = status;
        if (status === '生成完成') {
            statusElement.style.color = 'var(--success-color, #28a745)';
        }
    });
}

// 初始化报表面板拖拽功能
function initReportResize() {
    const reportResizer = document.getElementById('reportResizer');
    const reportPanel = document.getElementById('reportPanel');
    const chatMain = document.querySelector('.chat-main');
    const overlay = document.getElementById('reportResizeOverlay');
    
    if (!reportResizer || !reportPanel || !chatMain || !overlay) return;
    
    // 鼠标按下事件
    reportResizer.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // 只响应左键
        
        reportResizing = true;
        reportStartX = e.clientX;
        reportStartWidth = reportPanel.offsetWidth;
        
        // 添加拖拽状态类
        reportResizer.classList.add('dragging');
        document.body.classList.add('report-resizing');
        overlay.style.display = 'block';
        
        // 防止选择文本
        e.preventDefault();
        
        console.log('🎯 开始拖拽报表面板', { startX: reportStartX, startWidth: reportStartWidth });
    });
    
    // 鼠标移动事件
    document.addEventListener('mousemove', (e) => {
        if (!reportResizing) return;
        
        const deltaX = reportStartX - e.clientX; // 注意方向，向左拖拽增加宽度
        const newWidth = reportStartWidth + deltaX;
        const windowWidth = window.innerWidth;
        const maxWidthPx = windowWidth * (reportMaxWidth / 100);
        const minWidthPx = windowWidth * (reportMinWidth / 100);
        
        // 限制宽度范围
        const constrainedWidth = Math.max(minWidthPx, Math.min(maxWidthPx, newWidth));
        const widthPercent = (constrainedWidth / windowWidth) * 100;
        const chatPercent = 100 - widthPercent;
        
        // 应用新宽度
        reportPanel.style.width = `${widthPercent}%`;
        reportPanel.style.flex = `0 0 ${widthPercent}%`;
        chatMain.style.width = `${chatPercent}%`;
        chatMain.style.flex = `0 0 ${chatPercent}%`;
        
        // 更新最大宽度约束
        reportPanel.style.maxWidth = `${widthPercent}vw`;
        chatMain.style.maxWidth = `${chatPercent}vw`;
        
        console.log('📏 调整报表面板宽度', { 
            width: `${widthPercent.toFixed(1)}%`, 
            chat: `${chatPercent.toFixed(1)}%` 
        });
    });
    
    // 鼠标释放事件
    document.addEventListener('mouseup', () => {
        if (!reportResizing) return;
        
        reportResizing = false;
        
        // 移除拖拽状态类
        reportResizer.classList.remove('dragging');
        document.body.classList.remove('report-resizing');
        overlay.style.display = 'none';
        
        // 保存当前宽度到localStorage
        const currentWidth = reportPanel.style.width;
        if (currentWidth) {
            localStorage.setItem('reportPanelWidth', currentWidth);
        }
        
        console.log('✅ 结束拖拽报表面板');
    });
    
    // 窗口大小改变时重新计算
    window.addEventListener('resize', () => {
        if (reportPanel.style.display !== 'none') {
            const savedWidth = localStorage.getItem('reportPanelWidth');
            if (savedWidth) {
                restoreReportPanelWidth(savedWidth);
            }
        }
    });
}

// 恢复报表面板宽度
function restoreReportPanelWidth(widthPercent) {
    const reportPanel = document.getElementById('reportPanel');
    const chatMain = document.querySelector('.chat-main');
    
    if (!reportPanel || !chatMain) return;
    
    const percent = parseFloat(widthPercent);
    const chatPercent = 100 - percent;
    
    reportPanel.style.width = `${percent}%`;
    reportPanel.style.flex = `0 0 ${percent}%`;
    chatMain.style.width = `${chatPercent}%`;
    chatMain.style.flex = `0 0 ${chatPercent}%`;
    
    reportPanel.style.maxWidth = `${percent}vw`;
    chatMain.style.maxWidth = `${chatPercent}vw`;
}

// 显示报表面板时初始化拖拽功能
function showReportPanel() {
    const reportPanel = document.getElementById('reportPanel');
    const chatMain = document.querySelector('.chat-main');
    
    if (reportPanel && chatMain) {
        reportPanel.style.display = 'flex';
        chatMain.classList.add('with-report');
        
        // 恢复保存的宽度
        const savedWidth = localStorage.getItem('reportPanelWidth');
        if (savedWidth) {
            restoreReportPanelWidth(savedWidth);
        }
        
        // 初始化拖拽功能
        setTimeout(() => {
            initReportResize();
        }, 100);
        
        console.log('📊 显示报表面板');
    }
}

// 隐藏报表面板
function hideReportPanel() {
    const reportPanel = document.getElementById('reportPanel');
    const chatMain = document.querySelector('.chat-main');
    
    if (reportPanel && chatMain) {
        reportPanel.style.display = 'none';
        chatMain.classList.remove('with-report');
        
        // 重置宽度
        chatMain.style.width = '';
        chatMain.style.flex = '';
        chatMain.style.maxWidth = '';
        
        console.log('❌ 隐藏报表面板');
    }
    
    // 如果数据报表按钮处于激活状态，也要关闭它
    if (dataReportEnabled) {
        dataReportEnabled = false;
        const button = document.getElementById('dataReportToggle');
        if (button) {
            button.classList.remove('active');
            button.title = '启用数据报表';
        }
    }
}

// 测试Prism.js语法高亮功能
function testPrismHighlight() {
    console.log('🎨 测试Prism.js语法高亮...');
    
    const testHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报表</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .chart-container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="chart-container">
        <h2>销售数据图表</h2>
        <canvas id="myChart"></canvas>
    </div>
    <script>
        const ctx = document.getElementById('myChart').getContext('2d');
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['一月', '二月', '三月', '四月', '五月', '六月'],
                datasets: [{
                    label: '销售额 (万元)',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: ['rgba(54, 162, 235, 0.6)'],
                    borderColor: ['rgba(54, 162, 235, 1)'],
                    borderWidth: 1
                }]
            }
        });
    </script>
</body>
</html>`;
    
    // 更新代码显示
    updateReportCode(testHtml);
    
    // 显示报表面板并切换到代码视图
    if (!dataReportEnabled) {
        toggleDataReport();
    }
    
    setTimeout(() => {
        switchToCode();
        console.log('✅ Prism.js语法高亮测试完成！请查看报表面板的HTML代码显示效果');
        
        // 检查Prism.js是否正常工作
        const codeElement = document.getElementById('reportCodeText');
        if (codeElement && typeof Prism !== 'undefined') {
            console.log('🎯 Prism.js已加载，代码高亮应该生效');
            
            // 检查是否有语法高亮的token元素
            setTimeout(() => {
                const tokens = codeElement.querySelectorAll('.token');
                if (tokens.length > 0) {
                    console.log(`🌈 发现 ${tokens.length} 个语法高亮token，高亮功能正常工作`);
                } else {
                    console.warn('⚠️ 未发现语法高亮token，可能需要检查配置');
                }
            }, 500);
        } else {
            console.warn('⚠️ Prism.js未加载或报表代码元素不存在');
        }
    }, 1000);
}

// 测试紧凑代码显示效果
function testCompactCodeDisplay() {
    console.log('🎨 测试紧凑代码显示效果...');
    
    const compactHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>紧凑代码测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .chart { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        h1 { color: #333; text-align: center; }
        p { line-height: 1.6; color: #666; }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { 
            padding: 8px 12px; 
            border: 1px solid #ddd; 
            text-align: left; 
        }
        .data-table th { background: #007bff; color: white; }
        .highlight { background: #fff3cd; padding: 2px 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>数据分析报表</h1>
        <div class="chart">
            <h2>销售趋势图</h2>
            <p>这里显示<span class="highlight">销售数据</span>的趋势分析</p>
            <table class="data-table">
                <thead>
                    <tr><th>月份</th><th>销售额</th><th>增长率</th></tr>
                </thead>
                <tbody>
                    <tr><td>1月</td><td>¥50,000</td><td>+5%</td></tr>
                    <tr><td>2月</td><td>¥55,000</td><td>+10%</td></tr>
                    <tr><td>3月</td><td>¥60,000</td><td>+9%</td></tr>
                </tbody>
            </table>
        </div>
    </div>
    <script>
        console.log('报表加载完成');
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM加载完成，开始初始化图表...');
        });
    </script>
</body>
</html>`;
    
    // 更新代码显示
    updateReportCode(compactHtml);
    
    // 如果报表面板未显示，自动显示
    if (!dataReportEnabled) {
        toggleDataReport();
    }
    
    // 切换到代码视图
    switchToCode();
    
    console.log('✅ 紧凑代码显示测试完成');
    console.log('📝 特点：');
    console.log('  - 12px字体，1.4行高');
    console.log('  - 40px行号宽度，10px内边距');
    console.log('  - 8px圆角，紧凑布局');
    console.log('  - 支持水平和垂直滚动');
    console.log('  - 类似聊天区域的固定窗口设计');
}

// 测试报表文件预览显示
function testReportFilePreview() {
    console.log('🧪 测试报表文件预览显示...');
    
    // 创建测试文件预览
    const testFilename = '销售数据分析报表.html';
    const previewHtml = createReportFilePreview(testFilename);
    
    console.log('📄 生成的HTML:', previewHtml);
    
    // 如果报表面板未显示，自动显示
    if (!dataReportEnabled) {
        toggleDataReport();
    }
    
    // 在聊天区域添加测试消息
    const testMessage = `
        <div class="message-report-file">
            <p>AI正在为您生成数据报表...</p>
            ${previewHtml}
        </div>
    `;
    
    // 添加到聊天消息中
    const messageElement = addMessage('assistant', testMessage, 'test-report-preview');
    
    // 2秒后更新状态为完成
    setTimeout(() => {
        const previewElement = document.querySelector('.report-file-preview.simple');
        if (previewElement) {
            previewElement.classList.add('completed');
            const statusElement = previewElement.querySelector('.report-file-status');
            if (statusElement) {
                statusElement.textContent = '生成完成';
            }
            console.log('✅ 报表状态已更新为完成');
        }
    }, 2000);
    
    console.log('✅ 报表文件预览测试完成');
    console.log('📝 检查项目：');
    console.log('  - 文件名是否显示：', testFilename);
    console.log('  - 状态文字是否显示："正在生成中..."');
    console.log('  - 图标是否正确显示');
    console.log('  - 加载动画是否工作');
    console.log('  - 2秒后状态是否更新为"生成完成"');
}

// 诊断报表文件预览样式问题
function diagnoseReportFilePreview() {
    // 查找所有报表文件预览元素
    const previews = document.querySelectorAll('.report-file-preview.simple');
    
    previews.forEach((preview, index) => {
        const nameElement = preview.querySelector('.report-file-name');
        const statusElement = preview.querySelector('.report-file-status');
        
        if (nameElement) {
            // 强制修复样式
            nameElement.style.setProperty('color', '#333333', 'important');
            nameElement.style.setProperty('opacity', '1', 'important');
            nameElement.style.setProperty('visibility', 'visible', 'important');
            nameElement.style.setProperty('display', 'block', 'important');
            nameElement.style.setProperty('background', 'transparent', 'important');
            nameElement.style.setProperty('text-shadow', 'none', 'important');
            nameElement.style.setProperty('filter', 'none', 'important');
            
            // 深色模式检查
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDarkMode) {
                nameElement.style.setProperty('color', '#f1f5f9', 'important');
            }
        }
        
        if (statusElement) {
            // 强制修复样式
            statusElement.style.setProperty('color', '#666666', 'important');
            statusElement.style.setProperty('opacity', '1', 'important');
            statusElement.style.setProperty('visibility', 'visible', 'important');
            statusElement.style.setProperty('display', 'block', 'important');
            statusElement.style.setProperty('background', 'transparent', 'important');
            statusElement.style.setProperty('text-shadow', 'none', 'important');
            statusElement.style.setProperty('filter', 'none', 'important');
            
            // 深色模式检查
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDarkMode) {
                statusElement.style.setProperty('color', '#94a3b8', 'important');
            }
            
            // 检查是否为完成状态
            if (preview.classList.contains('completed')) {
                const completedColor = isDarkMode ? '#4ade80' : '#28a745';
                statusElement.style.setProperty('color', completedColor, 'important');
            }
        }
        
    });
    
    // 检查CSS变量和主题
    const rootStyles = window.getComputedStyle(document.documentElement);
    const currentTheme = document.documentElement.getAttribute('data-theme');
    
    return {
        previewCount: previews.length,
        theme: currentTheme,
        cssVariables: {
            sidebarText: rootStyles.getPropertyValue('--sidebar-text'),
            sidebarTextSecondary: rootStyles.getPropertyValue('--sidebar-text-secondary'),
            primaryColor: rootStyles.getPropertyValue('--primary-color'),
            borderColor: rootStyles.getPropertyValue('--border-color')
        }
    };
}

// 自动修复报表文件预览文字显示问题
function autoFixReportFilePreview() {
    // 自动修复报表文件预览文字显示问题
    
    // 定义修复函数
    function fixPreviewElements() {
        const previews = document.querySelectorAll('.report-file-preview.simple');
        let fixedCount = 0;
        
        previews.forEach(preview => {
            const nameElement = preview.querySelector('.report-file-name');
            const statusElement = preview.querySelector('.report-file-status');
            const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
            
            if (nameElement) {
                // 强制设置文件名样式
                nameElement.style.setProperty('color', isDarkMode ? '#f1f5f9' : '#333333', 'important');
                nameElement.style.setProperty('opacity', '1', 'important');
                nameElement.style.setProperty('visibility', 'visible', 'important');
                nameElement.style.setProperty('display', 'block', 'important');
                nameElement.style.setProperty('background', 'transparent', 'important');
                nameElement.style.setProperty('text-shadow', 'none', 'important');
                nameElement.style.setProperty('filter', 'none', 'important');
                fixedCount++;
            }
            
            if (statusElement) {
                // 强制设置状态样式
                let statusColor = isDarkMode ? '#94a3b8' : '#666666';
                if (preview.classList.contains('completed')) {
                    statusColor = isDarkMode ? '#4ade80' : '#28a745';
                }
                
                statusElement.style.setProperty('color', statusColor, 'important');
                statusElement.style.setProperty('opacity', '1', 'important');
                statusElement.style.setProperty('visibility', 'visible', 'important');
                statusElement.style.setProperty('display', 'block', 'important');
                statusElement.style.setProperty('background', 'transparent', 'important');
                statusElement.style.setProperty('text-shadow', 'none', 'important');
                statusElement.style.setProperty('filter', 'none', 'important');
                fixedCount++;
            }
        });
        
        // 修复完成
        
        return fixedCount;
    }
    
    // 立即执行一次修复
    fixPreviewElements();
    
    // 监听主题变化
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                // 主题变化，重新修复文字显示
                setTimeout(fixPreviewElements, 100);
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
    
    // 监听DOM变化，自动修复新添加的预览元素
    const domObserver = new MutationObserver(function(mutations) {
        let hasNewPreviews = false;
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.classList && node.classList.contains('report-file-preview')) {
                        hasNewPreviews = true;
                    } else if (node.querySelector && node.querySelector('.report-file-preview.simple')) {
                        hasNewPreviews = true;
                    }
                }
            });
        });
        
        if (hasNewPreviews) {
            // 检测到新的报表预览元素，自动修复
            setTimeout(fixPreviewElements, 100);
        }
    });
    
    domObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 自动修复功能已启动
}

// 页面加载完成后启动自动修复
document.addEventListener('DOMContentLoaded', function() {
    // 延迟启动，确保所有样式都已加载
    setTimeout(autoFixReportFilePreview, 1000);
});

// 如果页面已经加载完成，立即启动
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(autoFixReportFilePreview, 100);
}

// 测试报表文件预览HTML渲染
function testReportFilePreviewRendering() {
    console.log('🧪 测试报表文件预览HTML渲染...');
    
    // 测试内容
    const testContent = '这是一个测试消息 [报表文件：406编号含义分析报告.html] 请查看报表。';
    
    console.log('📝 原始内容:', testContent);
    
    // 使用renderMarkdownWithReportPreview函数
    const renderedHtml = renderMarkdownWithReportPreview(testContent);
    
    console.log('🎯 渲染后的HTML:', renderedHtml);
    
    // 检查是否包含正确的HTML结构
    const hasReportPreview = renderedHtml.includes('report-file-preview simple');
    const hasFileName = renderedHtml.includes('406编号含义分析报告.html');
    const hasStatus = renderedHtml.includes('正在生成中...');
    
    console.log('✅ 检查结果:');
    console.log('  - 包含报表预览结构:', hasReportPreview);
    console.log('  - 包含文件名:', hasFileName);
    console.log('  - 包含状态信息:', hasStatus);
    
    if (hasReportPreview && hasFileName && hasStatus) {
        console.log('🎉 HTML渲染测试通过！');
    } else {
        console.log('❌ HTML渲染测试失败！');
    }
    
    return {
        originalContent: testContent,
        renderedHtml: renderedHtml,
        hasReportPreview: hasReportPreview,
        hasFileName: hasFileName,
        hasStatus: hasStatus
    };
}

// 修复代码编辑器行号显示 - 专门的行号修复函数
function fixCodeLineNumbers() {
    const codeText = document.getElementById('reportCodeText');
    if (!codeText) return;
    
    const preElement = codeText.parentElement;
    if (!preElement || preElement.tagName !== 'PRE') return;
    
    try {
        // 确保有正确的class和属性
        preElement.className = 'line-numbers language-html';
        preElement.setAttribute('data-language', 'html');
        
        // 确保code元素有正确的class
        codeText.className = 'language-html';
        
        // 如果Prism.js可用
        if (typeof Prism !== 'undefined') {
            // 移除现有的行号容器
            const existingLineNumbers = preElement.querySelector('.line-numbers-rows');
            if (existingLineNumbers) {
                existingLineNumbers.remove();
            }
            
            // 重新计算行数并创建行号
            const lines = codeText.textContent.split('\n');
            const lineCount = lines.length;
            
            // 创建行号容器
            const lineNumbersRows = document.createElement('span');
            lineNumbersRows.className = 'line-numbers-rows';
            lineNumbersRows.setAttribute('aria-hidden', 'true');
            
            // 为每一行创建行号span
            for (let i = 0; i < lineCount; i++) {
                const lineSpan = document.createElement('span');
                lineNumbersRows.appendChild(lineSpan);
            }
            
            // 将行号容器添加到pre元素
            preElement.appendChild(lineNumbersRows);
            
            // 应用语法高亮
            Prism.highlightElement(codeText);
            
            console.log(`✅ 成功修复代码行号，共 ${lineCount} 行`);
        }
    } catch (error) {
        console.error('修复行号时出错:', error);
    }
}

// 在页面加载和DOM内容变更时自动修复行号
function initCodeLineNumbersFix() {
    // 监听DOM变化，自动修复行号
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const codeText = document.getElementById('reportCodeText');
                if (codeText && codeText.textContent.trim()) {
                    // 延迟执行以确保DOM更新完成
                    setTimeout(fixCodeLineNumbers, 100);
                }
            }
        });
    });
    
    // 监听报表代码容器的变化
    const reportCodeContent = document.querySelector('.report-code-content');
    if (reportCodeContent) {
        observer.observe(reportCodeContent, {
            childList: true,
            subtree: true
        });
    }
    
    // 页面加载时执行一次
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(fixCodeLineNumbers, 500);
    });
}


