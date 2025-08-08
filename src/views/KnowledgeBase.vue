<template>
  <div class="h-full overflow-auto">
    <div class="max-w-7xl mx-auto p-8 space-y-8">
      <!-- 页面标题 -->
      <div class="flex items-center justify-between animate-fade-in-up">
        <div class="flex items-center space-x-4">
          <div class="icon-container icon-warning w-16 h-16">
            <t-icon name="folder" size="32px" />
          </div>
          <div>
            <h1 class="text-4xl font-bold text-gradient">知识库管理</h1>
            <p class="text-lg text-slate-600 dark:text-slate-300">集中管理您的研究资料和知识条目</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button @click="showCreateDatasetModal = true" class="btn-primary px-6 py-3">
            <t-icon name="add" size="18px" />
            <span class="ml-2">新建知识库</span>
          </button>
          <button @click="showCreateDocumentModal = true" :disabled="!currentDataset" class="btn-secondary px-6 py-3">
            <t-icon name="file-add" size="18px" />
            <span class="ml-2">新建文档</span>
          </button>
        </div>
      </div>

      <!-- 统计和搜索栏 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-fade-in-up" style="animation-delay: 200ms">
        <!-- 统计卡片 -->
        <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="metric-card">
            <div class="icon-container icon-primary w-10 h-10 mb-3">
              <t-icon name="file-text" size="20px" />
            </div>
            <div class="metric-number text-2xl">{{ stats.totalItems }}</div>
            <div class="metric-label">知识条目</div>
          </div>
          <div class="metric-card">
            <div class="icon-container icon-success w-10 h-10 mb-3">
              <t-icon name="folder" size="20px" />
            </div>
            <div class="metric-number text-2xl">{{ stats.categories }}</div>
            <div class="metric-label">分类数量</div>
          </div>
          <div class="metric-card">
            <div class="icon-container icon-warning w-10 h-10 mb-3">
              <t-icon name="star" size="20px" />
            </div>
            <div class="metric-number text-2xl">{{ stats.favorites }}</div>
            <div class="metric-label">收藏条目</div>
          </div>
        </div>

        <!-- 搜索区域 -->
        <div class="floating-card p-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <t-icon name="search" size="18px" class="text-slate-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索知识库..."
              class="input-modern pl-10"
            />
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button 
              v-for="tag in popularTags"
              :key="tag"
              @click="searchQuery = tag"
              class="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              #{{ tag }}
            </button>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 左侧分类导航 -->
        <div class="lg:col-span-1 space-y-4 animate-fade-in-up" style="animation-delay: 400ms">
          <div class="research-card p-4">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <t-icon name="folder" size="16px" />
              <span>知识分类</span>
            </h3>
            <div class="space-y-2">
              <button 
                v-for="category in categories"
                :key="category.id"
                @click="selectedCategory = category.id"
                :class="[
                  'w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 text-left',
                  selectedCategory === category.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-700/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                ]"
              >
                <div class="flex items-center space-x-3">
                  <t-icon :name="category.icon" size="16px" />
                  <span class="font-medium">{{ category.name }}</span>
                </div>
                <span class="text-sm">{{ category.count }}</span>
              </button>
            </div>
          </div>

          <!-- 当前选中的知识库 -->
          <div v-if="currentDataset" class="research-card p-4">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <t-icon name="database" size="16px" />
              <span>当前知识库</span>
            </h3>
            <div class="space-y-3">
              <div class="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border border-primary-200 dark:border-primary-700/50">
                <p class="font-medium text-primary-700 dark:text-primary-300">{{ currentDataset.name }}</p>
                <p class="text-sm text-primary-600 dark:text-primary-400 mt-1">{{ currentDataset.document_count || 0 }} 个文档</p>
                <div class="flex items-center space-x-2 mt-2">
                  <button @click="viewDocuments(currentDataset)" class="text-xs bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300 px-2 py-1 rounded">
                    查看文档
                  </button>
                  <button @click="editDataset(currentDataset)" class="text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-1 rounded">
                    编辑
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="research-card p-4">
            <h3 class="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
              <t-icon name="clock" size="16px" />
              <span>最近访问</span>
            </h3>
            <div class="space-y-3">
              <div 
                v-for="recent in recentItems"
                :key="recent.id"
                class="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                <div class="icon-container w-8 h-8" :class="recent.iconClass">
                  <t-icon :name="recent.icon" size="12px" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{{ recent.title }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ formatTime(recent.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧内容区域 -->
        <div class="lg:col-span-3 space-y-6 animate-fade-in-up" style="animation-delay: 600ms">
          <!-- 工具栏 -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-slate-600 dark:text-slate-400">视图:</span>
                <button 
                  v-for="view in viewModes"
                  :key="view.value"
                  @click="currentView = view.value"
                  :class="[
                    'p-2 rounded-lg transition-colors',
                    currentView === view.value
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  ]"
                >
                  <t-icon :name="view.icon" size="16px" />
                </button>
              </div>
              <select v-model="sortBy" class="input-modern text-sm py-2">
                <option value="created">创建时间</option>
                <option value="updated">更新时间</option>
                <option value="name">名称</option>
                <option value="size">大小</option>
              </select>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-sm text-slate-500 dark:text-slate-400">
                共 {{ filteredItems.length }} 个条目
              </span>
            </div>
          </div>

          <!-- 知识条目列表 -->
          <div v-if="loading" class="text-center py-12">
            <div class="inline-flex items-center space-x-2 text-slate-500 dark:text-slate-400">
              <div class="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              <span>正在加载知识库数据...</span>
            </div>
          </div>
          
          <div v-else-if="filteredItems.length === 0" class="text-center py-12">
            <div class="space-y-4">
              <div class="icon-container icon-gray w-16 h-16 mx-auto">
                <t-icon name="database" size="32px" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">暂无知识库数据</h3>
                <p class="text-slate-500 dark:text-slate-400">
                  {{ searchQuery ? '没有找到匹配的条目' : '系统中还没有知识库，请先创建知识库' }}
                </p>
              </div>
              <button v-if="!searchQuery" @click="showCreateDatasetModal = true" class="btn-primary px-4 py-2">
                <t-icon name="add" size="16px" />
                <span class="ml-2">创建知识库</span>
              </button>
            </div>
          </div>

          <div v-else-if="currentView === 'list'" class="space-y-3">
            <div 
              v-for="(item, index) in filteredItems"
              :key="item.id"
              class="floating-card p-4 hover:shadow-glow transition-all duration-300 cursor-pointer"
              :style="{ animationDelay: `${800 + index * 50}ms` }"
              @click="selectDataset(item)"
            >
              <div class="flex items-start space-x-4">
                <div class="icon-container w-12 h-12" :class="item.iconClass">
                  <t-icon :name="item.icon" size="20px" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1">{{ item.title }}</h3>
                      <p class="text-sm text-slate-600 dark:text-slate-300 mb-2 line-clamp-2">{{ item.description }}</p>
                      <div class="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>{{ item.category }}</span>
                        <span>•</span>
                        <span>{{ formatTime(item.updated_at) }}</span>
                        <span>•</span>
                        <span>{{ item.size }}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-4" @click.stop>
                      <button @click="editDataset(getDatasetById(item.id))" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <t-icon name="edit" size="14px" class="text-slate-400" />
                      </button>
                      <button @click="viewDocuments(getDatasetById(item.id))" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <t-icon name="folder-open" size="14px" class="text-slate-400" />
                      </button>
                      <button @click="deleteDataset(getDatasetById(item.id))" class="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <t-icon name="delete" size="14px" class="text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2 mt-3">
                    <div v-for="tag in item.tags.slice(0, 3)" :key="tag" class="badge badge-primary text-xs">
                      {{ tag }}
                    </div>
                    <span v-if="item.tags.length > 3" class="text-xs text-slate-400">+{{ item.tags.length - 3 }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 网格视图 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="(item, index) in filteredItems"
              :key="item.id"
              class="research-card p-4 hover:shadow-glow transition-all duration-300 cursor-pointer"
              :style="{ animationDelay: `${800 + index * 50}ms` }"
              @click="selectDataset(item)"
            >
              <div class="text-center space-y-3">
                <div class="icon-container w-16 h-16 mx-auto" :class="item.iconClass">
                  <t-icon :name="item.icon" size="32px" />
                </div>
                <div>
                  <h3 class="font-semibold text-slate-900 dark:text-slate-100 mb-1 truncate">{{ item.title }}</h3>
                  <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{{ item.description }}</p>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>{{ item.category }}</span>
                  <span>{{ formatTime(item.updated_at) }}</span>
                </div>
                <div class="flex flex-wrap gap-1 justify-center">
                  <div v-for="tag in item.tags.slice(0, 2)" :key="tag" class="badge badge-primary text-xs">
                    {{ tag }}
                  </div>
                </div>
                <div class="flex items-center justify-center space-x-2 pt-2" @click.stop>
                  <button @click="editDataset(getDatasetById(item.id))" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <t-icon name="edit" size="14px" class="text-slate-400" />
                  </button>
                  <button @click="viewDocuments(getDatasetById(item.id))" class="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <t-icon name="folder-open" size="14px" class="text-slate-400" />
                  </button>
                  <button @click="deleteDataset(getDatasetById(item.id))" class="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <t-icon name="delete" size="14px" class="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建知识库弹窗 -->
    <div v-if="showCreateDatasetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showCreateDatasetModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">创建知识库</h3>
        <form @submit.prevent="handleCreateDataset">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">知识库名称</label>
              <input
                v-model="newDataset.name"
                type="text"
                required
                class="input-modern w-full"
                placeholder="请输入知识库名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">描述（可选）</label>
              <textarea
                v-model="newDataset.description"
                class="input-modern w-full h-20"
                placeholder="请输入知识库描述"
              ></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button type="button" @click="showCreateDatasetModal = false" class="btn-secondary px-4 py-2">
              取消
            </button>
            <button type="submit" :disabled="!newDataset.name || knowledgeStore.loading" class="btn-primary px-4 py-2">
              <span v-if="knowledgeStore.loading">创建中...</span>
              <span v-else>创建</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 编辑知识库弹窗 -->
    <div v-if="showEditDatasetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showEditDatasetModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">编辑知识库</h3>
        <form @submit.prevent="handleEditDataset">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">知识库名称</label>
              <input
                v-model="editingDataset.name"
                type="text"
                required
                class="input-modern w-full"
                placeholder="请输入知识库名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">描述（可选）</label>
              <textarea
                v-model="editingDataset.description"
                class="input-modern w-full h-20"
                placeholder="请输入知识库描述"
              ></textarea>
            </div>
          </div>
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button type="button" @click="showEditDatasetModal = false" class="btn-secondary px-4 py-2">
              取消
            </button>
            <button type="submit" :disabled="!editingDataset.name || knowledgeStore.loading" class="btn-primary px-4 py-2">
              <span v-if="knowledgeStore.loading">更新中...</span>
              <span v-else>更新</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 创建文档弹窗 -->
    <div v-if="showCreateDocumentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showCreateDocumentModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4" @click.stop>
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">创建文档</h3>
        <div class="mb-4">
          <div class="flex items-center space-x-4">
            <button
              @click="documentCreationType = 'text'"
              :class="[
                'px-4 py-2 rounded-lg text-sm',
                documentCreationType === 'text'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              ]"
            >
              文本创建
            </button>
            <button
              @click="documentCreationType = 'file'"
              :class="[
                'px-4 py-2 rounded-lg text-sm',
                documentCreationType === 'file'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              ]"
            >
              文件上传
            </button>
          </div>
        </div>
        
        <form @submit.prevent="handleCreateDocument">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">文档名称</label>
              <input
                v-model="newDocument.name"
                type="text"
                required
                class="input-modern w-full"
                placeholder="请输入文档名称"
              />
            </div>
            
            <div v-if="documentCreationType === 'text'">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">文档内容</label>
              <textarea
                v-model="newDocument.text"
                class="input-modern w-full h-40"
                placeholder="请输入文档内容"
                required
              ></textarea>
            </div>
            
            <div v-if="documentCreationType === 'file'">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">选择文件</label>
              <input
                type="file"
                @change="handleFileSelect"
                accept=".txt,.md,.pdf,.html,.xlsx,.docx,.csv"
                class="input-modern w-full"
                required
              />
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                支持格式：txt, markdown, pdf, html, xlsx, docx, csv
              </p>
            </div>
          </div>
          
          <div class="flex items-center justify-end space-x-3 mt-6">
            <button type="button" @click="showCreateDocumentModal = false" class="btn-secondary px-4 py-2">
              取消
            </button>
            <button type="submit" :disabled="!newDocument.name || knowledgeStore.uploading" class="btn-primary px-4 py-2">
              <span v-if="knowledgeStore.uploading">创建中...</span>
              <span v-else>创建</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 文档列表弹窗 -->
    <div v-if="showDocumentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showDocumentsModal = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden" @click.stop>
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ currentDataset?.name }} - 文档列表
          </h3>
          <button @click="showDocumentsModal = false" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
            <t-icon name="close" size="16px" />
          </button>
        </div>
        
        <div class="overflow-y-auto max-h-[60vh]">
          <div v-if="knowledgeStore.loading" class="text-center py-8">
            <div class="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-slate-500 dark:text-slate-400 mt-2">加载文档中...</p>
          </div>
          
          <div v-else-if="knowledgeStore.documents.length === 0" class="text-center py-8">
            <t-icon name="file" size="32px" class="text-slate-400 mx-auto mb-2" />
            <p class="text-slate-500 dark:text-slate-400">暂无文档</p>
          </div>
          
          <div v-else class="space-y-3">
            <div 
              v-for="doc in knowledgeStore.documents"
              :key="doc.id"
              class="flex items-center space-x-4 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div class="icon-container icon-primary w-8 h-8">
                <t-icon name="file-text" size="16px" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-slate-900 dark:text-slate-100 truncate">{{ doc.name }}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  {{ formatTime(doc.created_at * 1000) }} • {{ doc.indexing_status }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <button @click="viewDocumentSegments(doc)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <t-icon name="list" size="14px" class="text-slate-400" />
                </button>
                <button @click="editDocument(doc)" class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <t-icon name="edit" size="14px" class="text-slate-400" />
                </button>
                <button @click="handleDeleteDocument(doc)" class="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded">
                  <t-icon name="delete" size="14px" class="text-red-500" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showDeleteConfirm = false">
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-sm mx-4" @click.stop>
        <div class="text-center">
          <div class="icon-container icon-error w-12 h-12 mx-auto mb-4">
            <t-icon name="warning" size="24px" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">确认删除</h3>
          <p class="text-slate-600 dark:text-slate-400 mb-6">
            {{ deleteConfirmText }}
          </p>
          <div class="flex items-center justify-center space-x-3">
            <button @click="showDeleteConfirm = false" class="btn-secondary px-4 py-2">
              取消
            </button>
            <button @click="confirmDelete" :disabled="knowledgeStore.loading" class="btn-danger px-4 py-2">
              <span v-if="knowledgeStore.loading">删除中...</span>
              <span v-else>确认删除</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeStore } from '@/stores/knowledge'
import type { Dataset, Document } from '@/types'

const knowledgeStore = useKnowledgeStore()

// 响应式状态
const searchQuery = ref('')
const selectedCategory = ref('all')
const currentView = ref('list')
const sortBy = ref('updated')
const loading = ref(false)

// 弹窗控制
const showCreateDatasetModal = ref(false)
const showEditDatasetModal = ref(false) 
const showCreateDocumentModal = ref(false)
const showDocumentsModal = ref(false)
const showDeleteConfirm = ref(false)

// 当前操作的数据
const currentDataset = computed(() => knowledgeStore.currentDataset)
const newDataset = ref({ name: '', description: '' })
const editingDataset = ref({ id: '', name: '', description: '' })
const newDocument = ref({ name: '', text: '', file: null as File | null })
const documentCreationType = ref<'text' | 'file'>('text')

// 删除确认
const deleteConfirmText = ref('')
const pendingDeleteAction = ref<(() => Promise<void>) | null>(null)

// 统计数据 - 基于真实数据计算
const stats = computed(() => ({
  totalItems: knowledgeStore.datasets.length,
  categories: knowledgeStore.datasets.length,
  favorites: 0 // 暂时固定为0，后续可以添加收藏功能
}))

// 热门标签
const popularTags = ref(['机器学习', '深度学习', '数据挖掘', '人工智能', '算法'])

// 分类
const categories = ref([
  { id: 'all', name: '全部', icon: 'folder', count: 0 },
  { id: 'datasets', name: '知识库', icon: 'database', count: 0 }
])

// 视图模式
const viewModes = ref([
  { value: 'list', icon: 'list' },
  { value: 'grid', icon: 'grid' }
])

// 最近访问
const recentItems = ref([
  {
    id: 1,
    title: '深度学习基础',
    timestamp: Date.now() - 3600000,
    icon: 'book',
    iconClass: 'icon-primary'
  },
  {
    id: 2,
    title: 'MNIST数据集',
    timestamp: Date.now() - 7200000,
    icon: 'database',
    iconClass: 'icon-success'
  },
  {
    id: 3,
    title: 'CNN算法实现',
    timestamp: Date.now() - 86400000,
    icon: 'code',
    iconClass: 'icon-warning'
  }
])

// 知识条目 - 基于真实API数据
const knowledgeItems = computed(() => {
  return knowledgeStore.datasets.map(dataset => ({
    id: dataset.id,
    title: dataset.name,
    description: dataset.description || '暂无描述',
    category: '知识库',
    tags: ['知识库', 'API数据'],
    size: `${dataset.document_count || 0} 个文档`,
    updated_at: dataset.updated_at ? new Date(dataset.updated_at * 1000).getTime() : Date.now(),
    icon: 'database',
    iconClass: 'icon-success',
    document_count: dataset.document_count || 0,
    created_at: dataset.created_at ? new Date(dataset.created_at * 1000).getTime() : Date.now()
  }))
})

// 筛选的条目
const filteredItems = computed(() => {
  let items = knowledgeItems.value

  // 分类筛选
  if (selectedCategory.value !== 'all') {
    const categoryName = categories.value.find(c => c.id === selectedCategory.value)?.name
    items = items.filter(item => item.category === categoryName)
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'created':
      items.sort((a, b) => b.created_at - a.created_at)
      break
    case 'updated':
      items.sort((a, b) => b.updated_at - a.updated_at)
      break
    case 'name':
      items.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'size':
      items.sort((a, b) => b.document_count - a.document_count)
      break
  }

  return items
})

// =============================================================================
// 数据操作方法
// =============================================================================

// 获取数据集
const getDatasetById = (id: string): Dataset | undefined => {
  return knowledgeStore.getDatasetById(id)
}

// 选择数据集
const selectDataset = (item: any) => {
  const dataset = getDatasetById(item.id)
  if (dataset) {
    knowledgeStore.selectDataset(dataset)
  }
}

// =============================================================================
// 知识库管理
// =============================================================================

// 创建知识库
const handleCreateDataset = async () => {
  if (!newDataset.value.name.trim()) return
  
  try {
    await knowledgeStore.createDataset(newDataset.value.name, newDataset.value.description)
    
    // 重置表单并关闭弹窗
    newDataset.value = { name: '', description: '' }
    showCreateDatasetModal.value = false
    updateCategoryCount()
    
    // 显示成功消息
    console.log('✅ 知识库创建成功')
  } catch (error) {
    console.error('❌ 创建知识库失败:', error)
    alert('创建知识库失败，请重试')
  }
}

// 编辑知识库
const editDataset = (dataset: Dataset | undefined) => {
  if (!dataset) return
  
  editingDataset.value = {
    id: dataset.id,
    name: dataset.name,
    description: dataset.description || ''
  }
  showEditDatasetModal.value = true
}

const handleEditDataset = async () => {
  if (!editingDataset.value.name.trim()) return
  
  try {
    // 注意：API可能不支持更新知识库信息，这里可能需要实现或者显示提示
    console.log('📝 编辑知识库功能待实现:', editingDataset.value)
    
    // 关闭弹窗
    showEditDatasetModal.value = false
    editingDataset.value = { id: '', name: '', description: '' }
    
    alert('编辑功能正在开发中，敬请期待！')
  } catch (error) {
    console.error('❌ 编辑知识库失败:', error)
    alert('编辑知识库失败，请重试')
  }
}

// 删除知识库
const deleteDataset = (dataset: Dataset | undefined) => {
  if (!dataset) return
  
  deleteConfirmText.value = `确定要删除知识库"${dataset.name}"吗？此操作不可撤销。`
  pendingDeleteAction.value = () => knowledgeStore.deleteDataset(dataset.id)
  showDeleteConfirm.value = true
}

// =============================================================================
// 文档管理
// =============================================================================

// 查看文档列表
const viewDocuments = async (dataset: Dataset | undefined) => {
  if (!dataset) return
  
  try {
    knowledgeStore.selectDataset(dataset)
    await knowledgeStore.loadDocuments(dataset.id)
    showDocumentsModal.value = true
  } catch (error) {
    console.error('❌ 加载文档失败:', error)
    alert('加载文档失败，请重试')
  }
}

// 创建文档
const handleCreateDocument = async () => {
  if (!newDocument.value.name.trim()) return
  if (!currentDataset.value) {
    alert('请先选择一个知识库')
    return
  }
  
  try {
    if (documentCreationType.value === 'text') {
      if (!newDocument.value.text.trim()) {
        alert('请输入文档内容')
        return
      }
      
      await knowledgeStore.createDocumentByText(
        currentDataset.value.id,
        newDocument.value.name,
        newDocument.value.text
      )
    } else {
      if (!newDocument.value.file) {
        alert('请选择要上传的文件')
        return
      }
      
      await knowledgeStore.createDocumentByFile(
        currentDataset.value.id,
        newDocument.value.file
      )
    }
    
    // 重置表单并关闭弹窗
    newDocument.value = { name: '', text: '', file: null }
    showCreateDocumentModal.value = false
    
    // 如果文档列表弹窗打开，刷新列表
    if (showDocumentsModal.value) {
      await knowledgeStore.loadDocuments(currentDataset.value.id)
    }
    
    console.log('✅ 文档创建成功')
  } catch (error) {
    console.error('❌ 创建文档失败:', error)
    alert('创建文档失败，请重试')
  }
}

// 文件选择处理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    newDocument.value.file = target.files[0]
    // 如果没有设置文档名称，使用文件名
    if (!newDocument.value.name.trim()) {
      newDocument.value.name = target.files[0].name.replace(/\.[^/.]+$/, '')
    }
  }
}

// 编辑文档
const editDocument = (document: Document) => {
  console.log('📝 编辑文档功能待实现:', document)
  alert('编辑文档功能正在开发中，敬请期待！')
}

// 删除文档
const handleDeleteDocument = (document: Document) => {
  if (!currentDataset.value) return
  
  deleteConfirmText.value = `确定要删除文档"${document.name}"吗？此操作不可撤销。`
  pendingDeleteAction.value = () => knowledgeStore.deleteDocument(currentDataset.value!.id, document.id)
  showDeleteConfirm.value = true
}

// 查看文档分段
const viewDocumentSegments = (document: Document) => {
  console.log('📋 查看文档分段功能待实现:', document)
  alert('查看文档分段功能正在开发中，敬请期待！')
}

// =============================================================================
// 删除确认
// =============================================================================

const confirmDelete = async () => {
  if (!pendingDeleteAction.value) return
  
  try {
    await pendingDeleteAction.value()
    console.log('✅ 删除操作成功')
    
    // 关闭确认弹窗
    showDeleteConfirm.value = false
    pendingDeleteAction.value = null
    deleteConfirmText.value = ''
    
    // 更新计数
    updateCategoryCount()
    
    // 如果删除的是当前数据集，关闭文档列表弹窗
    if (!currentDataset.value) {
      showDocumentsModal.value = false
    }
  } catch (error) {
    console.error('❌ 删除操作失败:', error)
    alert('删除失败，请重试')
  }
}

// =============================================================================
// 工具方法
// =============================================================================

// 更新分类计数
const updateCategoryCount = () => {
  categories.value[0].count = knowledgeStore.datasets.length
  categories.value[1].count = knowledgeStore.datasets.length
}

// 格式化时间
function formatTime(timestamp: number) {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return '未知时间'
  
  return date.toLocaleString('zh-CN', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 加载知识库数据
const loadKnowledgeData = async () => {
  try {
    loading.value = true
    console.log('🔄 开始加载知识库数据...')
    
    await knowledgeStore.loadDatasets()
    updateCategoryCount()
    
    console.log('✅ 知识库数据加载完成:', {
      数据集数量: knowledgeStore.datasets.length,
      数据: knowledgeStore.datasets
    })
    
  } catch (error) {
    console.error('❌ 加载知识库数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 组件挂载
onMounted(() => {
  loadKnowledgeData()
})
</script>

<style scoped>
/* 自定义动画 */
.animate-fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fade-in-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 渐变文本 */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 卡片样式 */
.floating-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.floating-card:hover {
  box-shadow: 0 10px 25px 0 rgba(0, 0, 0, 0.1), 0 4px 6px 0 rgba(0, 0, 0, 0.05);
  transform: translateY(-2px);
}

.research-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.metric-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.metric-card:hover {
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 发光效果 */
.shadow-glow {
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

/* 图标容器 */
.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  flex-shrink: 0;
}

.icon-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.icon-success {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
}

.icon-warning {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
}

.icon-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.icon-gray {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
}

/* 按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 输入框样式 */
.input-modern {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  transition: all 0.3s ease;
  font-size: 14px;
}

.input-modern:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-modern::placeholder {
  color: #94a3b8;
}

/* 徽章样式 */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-primary {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* 指标样式 */
.metric-number {
  font-weight: 700;
  color: #1e293b;
}

.metric-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* 主要颜色变量 */
.bg-primary-50 { background-color: rgba(102, 126, 234, 0.05); }
.bg-primary-100 { background-color: rgba(102, 126, 234, 0.1); }
.bg-primary-800 { background-color: rgba(102, 126, 234, 0.8); }
.bg-primary-900\/30 { background-color: rgba(75, 85, 178, 0.3); }

.text-primary-300 { color: rgba(147, 197, 253, 1); }
.text-primary-400 { color: rgba(96, 165, 250, 1); }
.text-primary-600 { color: rgba(37, 99, 235, 1); }
.text-primary-700 { color: rgba(29, 78, 216, 1); }

.border-primary-200 { border-color: rgba(191, 219, 254, 1); }
.border-primary-700\/50 { border-color: rgba(29, 78, 216, 0.5); }

/* 暗色主题支持 */
.dark .floating-card,
.dark .research-card,
.dark .metric-card {
  background: #1e293b;
  border-color: #334155;
}

.dark .text-slate-900 { color: #f1f5f9; }
.dark .text-slate-800 { color: #f8fafc; }
.dark .text-slate-700 { color: #e2e8f0; }
.dark .text-slate-600 { color: #cbd5e1; }
.dark .text-slate-500 { color: #94a3b8; }
.dark .text-slate-400 { color: #64748b; }
.dark .text-slate-300 { color: #94a3b8; }

.dark .bg-slate-800 { background-color: #1e293b; }
.dark .bg-slate-700 { background-color: #334155; }
.dark .bg-slate-100 { background-color: #334155; }
.dark .bg-slate-50 { background-color: #475569; }

.dark .border-slate-700 { border-color: #334155; }
.dark .border-slate-200 { border-color: #475569; }

.dark .input-modern {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.dark .input-modern:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.dark .btn-secondary {
  background: #475569;
  color: #e2e8f0;
  border-color: #64748b;
}

.dark .btn-secondary:hover:not(:disabled) {
  background: #64748b;
  border-color: #94a3b8;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .lg\:col-span-1 {
    order: 2;
  }
  
  .lg\:col-span-3 {
    order: 1;
  }
  
  .floating-card,
  .research-card,
  .metric-card {
    margin-bottom: 1rem;
  }
  
  .flex.space-x-3 {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .flex.space-x-3 > * {
    margin-left: 0 !important;
  }
}

/* 加载动画 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* 过渡效果 */
.transition-all {
  transition: all 0.3s ease;
}

.transition-colors {
  transition: color 0.3s ease, background-color 0.3s ease, border-color 0.3s ease;
}
</style> 