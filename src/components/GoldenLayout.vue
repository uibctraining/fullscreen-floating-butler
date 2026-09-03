<template>
  <div class="golden-layout" v-if="visible">
    <!-- Split screen container -->
    <div class="split-container" :class="splitMode">
      <!-- Left/Top pane -->
      <div class="split-pane" :style="paneStyle.left">
        <!-- Tab bar -->
        <div class="tab-bar">
          <div
            v-for="tab in leftTabs"
            :key="tab.id"
            class="tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
            draggable="true"
            @dragstart="onTabDragStart($event, tab)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-title">{{ tab.title }}</span>
            <button class="tab-close" @click.stop="closeTab(tab.id)">✕</button>
          </div>
          <button class="tab-add" @click="showNewTabMenu = !showNewTabMenu">+</button>

          <!-- New tab menu -->
          <div class="new-tab-menu" v-if="showNewTabMenu">
            <button @click="addTab('browser'); showNewTabMenu = false">🌐 Browser</button>
            <button @click="addTab('video'); showNewTabMenu = false">🎬 Video</button>
            <button @click="addTab('image'); showNewTabMenu = false">🖼️ Image</button>
            <button @click="addTab('markdown'); showNewTabMenu = false">📝 Markdown</button>
            <button @click="addTab('code'); showNewTabMenu = false">💻 Code</button>
          </div>

          <div class="tab-actions">
            <button class="action-btn" @click="toggleSplit" :title="splitMode === 'none' ? 'Split' : 'Unsplit'">
              {{ splitMode === 'none' ? '⊞' : '⊟' }}
            </button>
            <button class="action-btn" @click="saveLayout" title="Save Layout">💾</button>
            <button class="action-btn" @click="loadLayout" title="Load Layout">📂</button>
          </div>
        </div>

        <!-- Content area -->
        <div class="content-area"
          @dragover.prevent
          @drop="onDrop($event, 'left')"
        >
          <component :is="getContentView(currentTab)" :tab="currentTab" />
        </div>
      </div>

      <!-- Split divider -->
      <div
        v-if="splitMode !== 'none'"
        class="split-divider"
        :class="splitMode"
        @mousedown="startResizeSplit"
      />

      <!-- Right/Bottom pane -->
      <div v-if="splitMode !== 'none'" class="split-pane" :style="paneStyle.right">
        <div class="tab-bar">
          <div
            v-for="tab in rightTabs"
            :key="tab.id"
            class="tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-title">{{ tab.title }}</span>
            <button class="tab-close" @click.stop="closeTab(tab.id)">✕</button>
          </div>
        </div>
        <div class="content-area"
          @dragover.prevent
          @drop="onDrop($event, 'right')"
        >
          <component :is="getContentView(getTabById(rightActiveTab))" :tab="getTabById(rightActiveTab)" />
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="shortcuts-hint" v-if="showShortcuts">
      <span>Ctrl+B: Split</span>
      <span>Ctrl+S: Save</span>
      <span>Ctrl+O: Load</span>
      <span>Ctrl+N: New Tab</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue'

const visible = ref(true)
const showNewTabMenu = ref(false)
const showShortcuts = ref(false)

// Tab interface
interface Tab {
  id: string
  type: 'browser' | 'video' | 'image' | 'markdown' | 'code'
  title: string
  icon: string
  pane: 'left' | 'right'
}

// State
const tabs = ref<Tab[]>([
  { id: 'home', type: 'browser', title: 'Home', icon: '🌐', pane: 'left' }
])
const activeTab = ref('home')
const rightActiveTab = ref('')
const splitMode = ref<'none' | 'horizontal' | 'vertical'>('none')
const splitPosition = ref(50) // percentage

// Computed
const leftTabs = computed(() => tabs.value.filter(t => t.pane === 'left'))
const rightTabs = computed(() => tabs.value.filter(t => t.pane === 'right'))

const currentTab = computed(() => tabs.value.find(t => t.id === activeTab.value))

const paneStyle = computed(() => ({
  left: splitMode.value === 'none'
    ? { flex: 1 }
    : splitMode.value === 'horizontal'
      ? { width: `${splitPosition.value}%` }
      : { height: `${splitPosition.value}%` },
  right: splitMode.value === 'none'
    ? { display: 'none' }
    : splitMode.value === 'horizontal'
      ? { width: `${100 - splitPosition.value}%` }
      : { height: `${100 - splitPosition.value}%` }
}))

// Content views
const BrowserView = defineComponent({
  props: ['tab'],
  setup() {
    const url = ref('https://99pages.uk')
    return () => h('div', { class: 'browser-view' }, [
      h('div', { class: 'browser-toolbar' }, [
        h('input', {
          class: 'browser-url',
          value: url.value,
          onInput: (e: Event) => url.value = (e.target as HTMLInputElement).value,
          onKeydown: (e: KeyboardEvent) => e.key === 'Enter' && navigate()
        })
      ]),
      url.value
        ? h('iframe', { src: url.value, class: 'browser-frame', sandbox: 'allow-scripts allow-same-origin' })
        : h('div', { class: 'browser-empty' }, 'Enter URL')
    ])
  }
})

const VideoView = defineComponent({
  props: ['tab'],
  setup() {
    const url = ref('')
    return () => h('div', { class: 'video-view' }, [
      url.value
        ? h('video', { src: url.value, controls: true, class: 'video-player' })
        : h('div', { class: 'video-empty' }, [
            h('span', { class: 'video-icon' }, '🎬'),
            h('input', {
              class: 'video-input',
              placeholder: 'Video URL...',
              value: url.value,
              onInput: (e: Event) => url.value = (e.target as HTMLInputElement).value
            })
          ])
    ])
  }
})

const ImageView = defineComponent({
  props: ['tab'],
  setup() {
    const url = ref('')
    return () => h('div', { class: 'image-view' }, [
      url.value
        ? h('img', { src: url.value, class: 'image-display' })
        : h('div', { class: 'image-empty' }, [
            h('span', { class: 'image-icon' }, '🖼️'),
            h('input', {
              class: 'image-input',
              placeholder: 'Image URL...',
              value: url.value,
              onInput: (e: Event) => url.value = (e.target as HTMLInputElement).value
            })
          ])
    ])
  }
})

const MarkdownView = defineComponent({
  props: ['tab'],
  setup() {
    const content = ref('# Welcome\n\nStart writing...')
    return () => h('div', { class: 'markdown-split' }, [
      h('textarea', {
        class: 'markdown-editor',
        value: content.value,
        onInput: (e: Event) => content.value = (e.target as HTMLTextAreaElement).value
      }),
      h('div', { class: 'markdown-preview', innerHTML: content.value })
    ])
  }
})

const CodeView = defineComponent({
  props: ['tab'],
  setup() {
    const code = ref('console.log("Hello!");')
    const output = ref('')
    return () => h('div', { class: 'code-view' }, [
      h('div', { class: 'code-toolbar' }, [
        h('button', {
          class: 'code-btn',
          onClick: () => { try { output.value = String(eval(code.value)) } catch(e: any) { output.value = e.message } }
        }, '▶ Run')
      ]),
      h('textarea', {
        class: 'code-editor',
        value: code.value,
        onInput: (e: Event) => code.value = (e.target as HTMLTextAreaElement).value
      }),
      output.value ? h('div', { class: 'code-output' }, [h('pre', output.value)]) : null
    ])
  }
})

function getTabById(id: string): Tab | undefined {
  return tabs.value.find(t => t.id === id)
}

function getContentView(tab: Tab | undefined) {
  if (!tab) return null
  const views: Record<string, any> = {
    browser: BrowserView,
    video: VideoView,
    image: ImageView,
    markdown: MarkdownView,
    code: CodeView
  }
  return views[tab.type] || BrowserView
}

// Tab management
function addTab(type: Tab['type'], pane: 'left' | 'right' = 'left') {
  const id = `${type}-${Date.now()}`
  const icons: Record<string, string> = {
    browser: '🌐', video: '🎬', image: '🖼️', markdown: '📝', code: '💻'
  }
  tabs.value.push({
    id, type,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    icon: icons[type], pane
  })
  if (pane === 'left') activeTab.value = id
  else rightActiveTab.value = id
}

function closeTab(id: string) {
  const index = tabs.value.findIndex(t => t.id === id)
  if (index > -1) {
    tabs.value.splice(index, 1)
    if (activeTab.value === id) {
      activeTab.value = leftTabs.value[0]?.id || rightTabs.value[0]?.id || ''
    }
    if (rightActiveTab.value === id) {
      rightActiveTab.value = rightTabs.value[0]?.id || ''
    }
  }
}

// Split screen
function toggleSplit() {
  if (splitMode.value === 'none') {
    splitMode.value = 'horizontal'
    if (rightTabs.value.length === 0) {
      addTab('browser', 'right')
    }
  } else {
    splitMode.value = 'none'
  }
}

// Drag and drop
function onTabDragStart(event: DragEvent, tab: Tab) {
  event.dataTransfer?.setData('text/plain', tab.id)
}

function onDrop(event: DragEvent, pane: 'left' | 'right') {
  const tabId = event.dataTransfer?.getData('text/plain')
  if (tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      tab.pane = pane
      if (pane === 'right') rightActiveTab.value = tabId
      else activeTab.value = tabId
    }
  }
}

// Split resize
let isResizing = false

function startResizeSplit() {
  isResizing = true
  document.addEventListener('mousemove', onSplitResize)
  document.addEventListener('mouseup', stopResizeSplit)
}

function onSplitResize(event: MouseEvent) {
  if (!isResizing) return
  const container = document.querySelector('.split-container')
  if (!container) return

  const rect = container.getBoundingClientRect()
  if (splitMode.value === 'horizontal') {
    splitPosition.value = ((event.clientX - rect.left) / rect.width) * 100
  } else {
    splitPosition.value = ((event.clientY - rect.top) / rect.height) * 100
  }
  splitPosition.value = Math.max(20, Math.min(80, splitPosition.value))
}

function stopResizeSplit() {
  isResizing = false
  document.removeEventListener('mousemove', onSplitResize)
  document.removeEventListener('mouseup', stopResizeSplit)
}

// Layout persistence
function saveLayout() {
  const layout = {
    tabs: tabs.value,
    splitMode: splitMode.value,
    splitPosition: splitPosition.value,
    activeTab: activeTab.value,
    rightActiveTab: rightActiveTab.value
  }
  localStorage.setItem('golden-layout', JSON.stringify(layout))
}

function loadLayout() {
  const saved = localStorage.getItem('golden-layout')
  if (saved) {
    const layout = JSON.parse(saved)
    tabs.value = layout.tabs
    splitMode.value = layout.splitMode
    splitPosition.value = layout.splitPosition
    activeTab.value = layout.activeTab
    rightActiveTab.value = layout.rightActiveTab
  }
}

// Keyboard shortcuts
function onKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        toggleSplit()
        break
      case 's':
        event.preventDefault()
        saveLayout()
        break
      case 'o':
        event.preventDefault()
        loadLayout()
        break
      case 'n':
        event.preventDefault()
        addTab('browser')
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  // Auto-load layout
  loadLayout()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

function navigate() {
  // Navigate to URL
}
</script>

<style scoped>
.golden-layout {
  position: fixed;
  top: 32px;
  left: 60px;
  right: 0;
  bottom: 40px;
  z-index: 5;
  pointer-events: auto;
}

.split-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 25, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.1);
}

.split-container.vertical {
  flex-direction: column;
}

.split-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.split-divider {
  background: rgba(0, 200, 255, 0.15);
  cursor: col-resize;
  flex-shrink: 0;
}

.split-divider.horizontal {
  width: 4px;
}

.split-divider.vertical {
  height: 4px;
  cursor: row-resize;
}

.split-divider:hover {
  background: rgba(0, 200, 255, 0.4);
}

.tab-bar {
  display: flex;
  align-items: center;
  background: rgba(5, 10, 20, 0.98);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
  padding: 0 8px;
  min-height: 36px;
  overflow-x: auto;
  position: relative;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  color: rgba(150, 170, 200, 0.6);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab:hover {
  color: rgba(200, 220, 255, 0.8);
  background: rgba(255, 255, 255, 0.03);
}

.tab.active {
  color: #00d4ff;
  border-bottom-color: #00d4ff;
  background: rgba(0, 200, 255, 0.05);
}

.tab-icon { font-size: 14px; }

.tab-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  font-size: 10px;
  padding: 2px;
}

.tab-close:hover { color: #ff3b30; }

.tab-add {
  background: none;
  border: 1px dashed rgba(0, 200, 255, 0.2);
  color: rgba(0, 200, 255, 0.5);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 4px;
}

.tab-add:hover {
  background: rgba(0, 200, 255, 0.1);
  color: #00d4ff;
}

.tab-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: rgba(150, 170, 200, 0.5);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-btn:hover {
  background: rgba(0, 200, 255, 0.1);
  color: #00d4ff;
}

.new-tab-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(10, 15, 25, 0.98);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  padding: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.new-tab-menu button {
  background: none;
  border: none;
  color: rgba(200, 220, 255, 0.8);
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
}

.new-tab-menu button:hover {
  background: rgba(0, 200, 255, 0.1);
}

.content-area {
  flex: 1;
  overflow: hidden;
}

.shortcuts-hint {
  position: fixed;
  bottom: 50px;
  right: 20px;
  display: flex;
  gap: 12px;
  font-size: 10px;
  font-family: 'SF Mono', monospace;
  color: rgba(150, 170, 200, 0.3);
}

/* Browser */
.browser-view { display: flex; flex-direction: column; height: 100%; }
.browser-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.browser-url { flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: 'SF Mono', monospace; }
.browser-frame { flex: 1; border: none; background: #fff; }
.browser-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: rgba(150, 170, 200, 0.5); }

/* Video */
.video-view { display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; }
.video-player { max-width: 100%; max-height: 100%; }
.video-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(150, 170, 200, 0.5); }
.video-icon { font-size: 48px; }
.video-input { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 8px 16px; border-radius: 4px; font-size: 13px; width: 300px; }

/* Image */
.image-view { display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; }
.image-display { max-width: 100%; max-height: 100%; object-fit: contain; }
.image-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(150, 170, 200, 0.5); }
.image-icon { font-size: 48px; }
.image-input { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 8px 16px; border-radius: 4px; font-size: 13px; width: 300px; }

/* Markdown */
.markdown-split { display: flex; height: 100%; }
.markdown-editor { flex: 1; background: rgba(0, 0, 0, 0.3); border: none; border-right: 1px solid rgba(0, 200, 255, 0.1); color: rgba(200, 220, 255, 0.9); padding: 16px; font-family: 'SF Mono', monospace; font-size: 13px; resize: none; outline: none; }
.markdown-preview { flex: 1; padding: 16px; color: rgba(200, 220, 255, 0.9); font-size: 14px; line-height: 1.6; overflow-y: auto; }

/* Code */
.code-view { display: flex; flex-direction: column; height: 100%; }
.code-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.code-btn { background: rgba(0, 200, 255, 0.15); border: 1px solid rgba(0, 200, 255, 0.3); color: #00d4ff; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
.code-btn:hover { background: rgba(0, 200, 255, 0.25); }
.code-editor { flex: 1; background: rgba(0, 0, 0, 0.3); border: none; color: rgba(200, 220, 255, 0.9); padding: 16px; font-family: 'SF Mono', monospace; font-size: 13px; resize: none; outline: none; tab-size: 2; }
.code-output { height: 100px; background: rgba(0, 0, 0, 0.5); border-top: 1px solid rgba(0, 200, 255, 0.1); padding: 12px; overflow-y: auto; }
.code-output pre { font-family: 'SF Mono', monospace; font-size: 12px; color: #34c759; margin: 0; }
</style>
