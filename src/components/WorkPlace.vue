<template>
  <div class="workplace-container">
    <t-layout class="main-layout">
      <t-aside class="sidebar" :class="{'collapsed': sidebarCollapsed}">
        <div class="sidebar-header">
          <div class="logo-section">
            <div class="logo-icon">
              <t-icon name="user-1" size="24px" />
            </div>
            <h2 class="app-title" v-show="!sidebarCollapsed">涵光学术</h2>
          </div>
        </div>
        
        <t-menu 
          theme="light" 
          :value="selectedMenu" 
          class="navigation-menu" 
          :width="sidebarCollapsed ? '64px' : '200px'"
        >
          <t-menu-item value="workplace" class="menu-item" @click="navigateTo('workplace')">
            <template #icon>
              <t-icon name="dashboard" size="20px" />
            </template>
            <span class="menu-text" v-show="!sidebarCollapsed">工作台</span>
          </t-menu-item>
          
          <t-menu-item value="ai-chat" class="menu-item" @click="navigateTo('ai-chat')">
            <template #icon>
              <t-icon name="chat" size="24px" />
            </template>
            <span class="menu-text" v-show="!sidebarCollapsed">AI对话</span>
          </t-menu-item>
          
          <t-menu-item value="translation" class="menu-item" @click="navigateTo('translation')">
            <template #icon>
              <t-icon name="translate" size="24px" />
            </template>
            <span class="menu-text" v-show="!sidebarCollapsed">文献翻译</span>
          </t-menu-item>
          
          <t-menu-item value="knowledge" class="menu-item" @click="navigateTo('knowledge')">
            <template #icon>
              <t-icon name="folder" size="24px" />
            </template>
            <span class="menu-text" v-show="!sidebarCollapsed">知识库管理</span>
          </t-menu-item>
          
          <t-menu-item value="data-analysis" class="menu-item" @click="navigateTo('data-analysis')">
            <template #icon>
              <t-icon name="chart-bar" size="24px" />
            </template>
            <span class="menu-text" v-show="!sidebarCollapsed">数据分析</span>
          </t-menu-item>
        </t-menu>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <t-avatar size="small">
              <t-icon name="user" />
            </t-avatar>
            <span class="user-name" v-show="!sidebarCollapsed">用户</span>
          </div>
        </div>
      </t-aside>
      
      <t-layout class="content-layout">
        <!-- 顶部栏 -->
        <t-header class="top-header">
          <div class="header-left">
            <t-button 
              variant="text" 
              class="sidebar-toggle-btn"
              @click="toggleSidebar"
            >
              <t-icon :name="sidebarCollapsed ? 'menu-unfold' : 'menu-fold'" size="20px" />
            </t-button>
            <span class="page-title">{{ getPageTitle() }}</span>
          </div>
          <div class="header-right">
            <t-button variant="text" class="header-btn">
              <t-icon name="notification" size="20px" />
            </t-button>
            <t-button variant="text" class="header-btn">
              <t-icon name="setting" size="20px" />
            </t-button>
          </div>
        </t-header>
        
        <t-content class="main-content">
          <!-- 动态渲染当前选中的组件 -->
          <component :is="currentComponent" v-if="currentComponent" />
          <!-- 工作台默认页面 -->
          <div v-else class="workplace-dashboard">
            <!-- 顶部欢迎区域 -->
            <div class="dashboard-header">
              <div class="welcome-section">
                <h1 class="welcome-title">欢迎使用AI学术研究助手</h1>
                <p class="welcome-subtitle">您的智能学术研究伙伴，助力高效研究</p>
              </div>
            </div>

            <!-- 统计卡片区域 -->
            <div class="stats-section">
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">
                    <t-icon name="chat" size="24px" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">0</div>
                    <div class="stat-label">对话次数</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">
                    <t-icon name="file-text" size="24px" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">12</div>
                    <div class="stat-label">处理文档</div>
                  </div>
                </div>
                
                <div class="stat-card">
                  <div class="stat-icon">
                    <t-icon name="folder" size="24px" />
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">156</div>
                    <div class="stat-label">知识条目</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 主要内容区域 -->
            <div class="dashboard-main">
              <!-- 快速开始区域 -->
              <div class="quick-start-section">
                <h2 class="section-title">快速开始</h2>
                <div class="quick-start-grid">
                  <div class="quick-start-card" @click="navigateTo('ai-chat')">
                    <div class="card-icon">
                      <t-icon name="chat" size="32px" />
                    </div>
                    <div class="card-content">
                      <h3>开始对话</h3>
                      <p>与AI助手进行学术研究对话</p>
                    </div>
                  </div>
                  
                  <div class="quick-start-card" @click="navigateTo('translation')">
                    <div class="card-icon">
                      <t-icon name="translate" size="32px" />
                    </div>
                    <div class="card-content">
                      <h3>文献处理</h3>
                      <p>上传和分析学术文献</p>
                    </div>
                  </div>
                  
                  <div class="quick-start-card" @click="navigateTo('knowledge')">
                    <div class="card-icon">
                      <t-icon name="folder" size="32px" />
                    </div>
                    <div class="card-content">
                      <h3>知识库</h3>
                      <p>管理和搜索知识内容</p>
                    </div>
                  </div>
                  
                  <div class="quick-start-card">
                    <div class="card-icon">
                      <t-icon name="help-circle" size="32px" />
                    </div>
                    <div class="card-content">
                      <h3>使用指南</h3>
                      <p>了解如何使用各项功能</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 最近活动区域 -->
              <div class="recent-activity-section">
                <h2 class="section-title">最近活动</h2>
                <div class="activity-list">
                  <div class="activity-item">
                    <div class="activity-content">
                      <div class="activity-title">创建了新的对话</div>
                      <div class="activity-time">2023-06-22 09:17</div>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <div class="activity-content">
                      <div class="activity-title">上传了文档：研究方法论.pdf</div>
                      <div class="activity-time">2023-06-22 08:37</div>
                    </div>
                  </div>
                  
                  <div class="activity-item">
                    <div class="activity-content">
                      <div class="activity-title">添加了知识库自动数据源</div>
                      <div class="activity-time">2023-06-21 16:27</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </t-content>
      </t-layout>
    </t-layout>
  </div>
</template>

<script>
import AIChat from './AIChat.vue'
import Translate from './Translate.vue'
import KnowledgeBase from './KnowledgeBase.vue'
import DataAnalysis from './DataAnalysis.vue'

export default {
  name: 'WorkPlace',
  components: {
    AIChat,
    Translate,
    KnowledgeBase,
    DataAnalysis
  },
  data() {
    return {
      selectedMenu: 'workplace',
      sidebarCollapsed: false
    }
  },
  computed: {
    currentComponent() {
      const componentMap = {
        'workplace': null, // 工作台显示默认内容
        'ai-chat': 'AIChat',
        'translation': 'Translate',
        'knowledge': 'KnowledgeBase',
        'data-analysis': 'DataAnalysis'
      }
      return componentMap[this.selectedMenu]
    }
  },
  methods: {
    navigateTo(menu) {
      this.selectedMenu = menu;
    },
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    },
    getPageTitle() {
      const titleMap = {
        'workplace': '工作台',
        'ai-chat': 'AI对话',
        'translation': '文献翻译',
        'knowledge': '知识库管理',
        'data-analysis': '数据分析'
      }
      return titleMap[this.selectedMenu] || '工作台'
    }
  }
}
</script>

<style scoped>
.workplace-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  box-sizing: border-box;
}

.main-layout {
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  background: #ffffff;
}

.sidebar {
  width: 200px;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 64px; /* 48px图标 + 8px左右内边距 = 64px最小宽度 */
  min-width: 64px;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, #e2e8f0 20%, #e2e8f0 80%, transparent 100%);
}

.sidebar-header {
  padding: 30px 24px 20px;
  border-bottom: 1px solid #e2e8f0;
  transition: padding 0.3s ease;
}

.sidebar.collapsed .sidebar-header {
  padding: 30px 8px 20px;
  display: flex;
  justify-content: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar.collapsed .logo-section {
  justify-content: center;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  flex-shrink: 0; /* 确保图标不会被压缩 */
}

/* 折叠状态下logo图标保持原有大小 */
.sidebar.collapsed .logo-icon {
  width: 48px;
  height: 48px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.5px;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
}


/* 菜单宽度控制 */
.navigation-menu {
  transition: width 0.3s ease;
}

.navigation-menu :deep(.t-default-menu__inner) {
  transition: width 0.3s ease;
}

.navigation-menu :deep(.t-menu__item) {
  transition: all 0.3s ease;
  justify-content: flex-start;
}

.sidebar.collapsed .navigation-menu :deep(.t-menu__item) {
  justify-content: center;
  padding-left: 8px;
  padding-right: 8px;
  min-width: 48px; /* 确保菜单项有足够的点击区域 */
}



.menu-text {
  font-size: 15px;
  font-weight: 500;
  margin-left: 12px;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .menu-text {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* 折叠状态下的菜单项图标居中 */
.sidebar.collapsed .navigation-menu :deep(.t-menu__item-icon) {
  margin-right: 0 !important;
}

.sidebar-footer {
  width: 100%;
  border-top: 1px solid #e2e8f0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: padding 0.3s ease;
}

.sidebar.collapsed .user-info {
  padding: 12px 8px;
  justify-content: center;
  min-width: 48px; /* 确保用户头像区域有足够空间 */
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
  transition: opacity 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
}

.content-layout {
  flex: 1;
  background: #ffffff;
  width: 100%;
  height: 100%;
}

.top-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-toggle-btn {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.sidebar-toggle-btn:hover {
  background: #f1f5f9;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.header-btn {
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.header-btn:hover {
  background: #f1f5f9;
}

.main-content {
  width: 100%;
  height: calc(100% - 64px);
  padding: 0;
}

/* 工作台仪表板样式 */
.workplace-dashboard {
  width: 100%;
  height: 100%;
  background: #f5f6f7;
  overflow-y: auto;
}

.dashboard-header {
  padding: 32px 32px 24px 32px;
  width: 94%;
  /* 居中 */
  margin: 0 auto;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-section {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.welcome-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
}

/* 统计卡片区域 */
.stats-section {
  padding: 0 32px;
  margin-top: -16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* 主要内容区域 */
.dashboard-main {
  padding: 32px;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 20px 0;
}

/* 快速开始区域 */
.quick-start-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.quick-start-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.quick-start-card {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fefefe;
}

.quick-start-card:hover {
  border-color: #667eea;
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  flex-shrink: 0;
}

.card-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.card-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

/* 最近活动区域 */
.recent-activity-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fefefe;
  transition: all 0.3s ease;
}

.activity-item:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}

.activity-time {
  font-size: 12px;
  color: #64748b;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .workplace-container {
    padding: 10px;
  }
  
  .main-layout {
    border-radius: 16px;
  }
  
  .sidebar {
    width: 240px;
  }
  
  .sidebar.collapsed {
    width: 64px;
    min-width: 64px;
  }
  
  .top-header {
    padding: 0 16px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .welcome-content h1 {
    font-size: 28px;
  }

  /* 工作台响应式 */
  .dashboard-header {
    padding: 24px 16px;
  }

  .stats-section {
    padding: 0 16px;
  }

  .dashboard-main {
    padding: 24px 16px;
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .quick-start-grid {
    grid-template-columns: 1fr;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 15px;
  }
}
</style>
