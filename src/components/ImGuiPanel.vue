<template>
  <div class="imgui-layer" v-if="visible">
    <!-- Agent Status Panel -->
    <div
      class="imgui-panel"
      :class="{ dragging: draggingPanel === 'status' }"
      :style="panels.status.style"
      @mousedown="bringToFront('status')"
    >
      <div
        class="panel-header"
        @mousedown.stop="startDrag($event, 'status')"
      >
        <span class="panel-icon">⚡</span>
        <span>AGENT STATUS</span>
        <div class="panel-actions">
          <button class="panel-btn" @click="toggleCollapse('status')">
            {{ panels.status.collapsed ? '□' : '−' }}
          </button>
          <button class="panel-btn close" @click="closePanel('status')">✕</button>
        </div>
      </div>
      <div class="panel-content" v-show="!panels.status.collapsed">
        <div class="status-row">
          <span class="label">Model</span>
          <span class="value accent">{{ agentStatus.model }}</span>
        </div>
        <div class="status-row">
          <span class="label">Tokens</span>
          <span class="value">{{ agentStatus.tokens.toLocaleString() }}</span>
        </div>
        <div class="status-row">
          <span class="label">Latency</span>
          <span class="value" :class="latencyClass">{{ agentStatus.latency }}ms</span>
        </div>
        <div class="status-row">
          <span class="label">Status</span>
          <span class="value" :class="agentStatus.isThinking ? 'orange' : 'green'">
            {{ agentStatus.isThinking ? 'THINKING...' : 'IDLE' }}
          </span>
        </div>
        <div class="progress-bar" v-if="agentStatus.isThinking">
          <div class="progress-fill" :style="{ width: thinkingProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- System Monitor Panel -->
    <div
      class="imgui-panel"
      :class="{ dragging: draggingPanel === 'monitor' }"
      :style="panels.monitor.style"
      @mousedown="bringToFront('monitor')"
    >
      <div
        class="panel-header"
        @mousedown.stop="startDrag($event, 'monitor')"
      >
        <span class="panel-icon">📊</span>
        <span>SYSTEM MONITOR</span>
        <div class="panel-actions">
          <button class="panel-btn" @click="toggleCollapse('monitor')">
            {{ panels.monitor.collapsed ? '□' : '−' }}
          </button>
          <button class="panel-btn close" @click="closePanel('monitor')">✕</button>
        </div>
      </div>
      <div class="panel-content" v-show="!panels.monitor.collapsed">
        <div class="metric">
          <div class="metric-header">
            <span>CPU</span>
            <span>{{ systemMetrics.cpu }}%</span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill cpu" :style="{ width: systemMetrics.cpu + '%' }"></div>
          </div>
        </div>
        <div class="metric">
          <div class="metric-header">
            <span>MEMORY</span>
            <span>{{ systemMetrics.memory }}%</span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill memory" :style="{ width: systemMetrics.memory + '%' }"></div>
          </div>
        </div>
        <div class="metric">
          <div class="metric-header">
            <span>NETWORK</span>
            <span>{{ systemMetrics.network }} KB/s</span>
          </div>
          <div class="metric-bar">
            <div class="metric-fill network" :style="{ width: Math.min(systemMetrics.network / 10, 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Log Panel -->
    <div
      class="imgui-panel"
      :class="{ dragging: draggingPanel === 'log' }"
      :style="panels.log.style"
      @mousedown="bringToFront('log')"
    >
      <div
        class="panel-header"
        @mousedown.stop="startDrag($event, 'log')"
      >
        <span class="panel-icon">📋</span>
        <span>ACTIVITY LOG</span>
        <div class="panel-actions">
          <button class="panel-btn" @click="toggleCollapse('log')">
            {{ panels.log.collapsed ? '□' : '−' }}
          </button>
          <button class="panel-btn close" @click="closePanel('log')">✕</button>
        </div>
      </div>
      <div class="panel-content log-content" v-show="!panels.log.collapsed">
        <div v-for="(log, i) in logs" :key="i" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-level" :class="log.level">{{ log.level }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- Resize Handles (shown on hover) -->
    <div
      v-for="(panel, id) in panels"
      :key="'resize-' + id"
      v-show="!panel.collapsed"
      class="resize-handle"
      :style="getResizeHandleStyle(id)"
      @mousedown.stop="startResize($event, id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'

const visible = ref(true)

// Panel state
interface PanelState {
  style: {
    position: 'absolute'
    left: string
    top: string
    width: string
    height?: string
    zIndex: number
  }
  collapsed: boolean
  visible: boolean
}

const panels = reactive<Record<string, PanelState>>({
  status: {
    style: {
      position: 'absolute',
      left: '20px',
      top: '80px',
      width: '240px',
      zIndex: 10
    },
    collapsed: false,
    visible: true
  },
  monitor: {
    style: {
      position: 'absolute',
      left: 'calc(100% - 260px)',
      top: '80px',
      width: '240px',
      zIndex: 10
    },
    collapsed: false,
    visible: true
  },
  log: {
    style: {
      position: 'absolute',
      left: '20px',
      top: 'calc(100% - 280px)',
      width: '360px',
      height: '200px',
      zIndex: 10
    },
    collapsed: false,
    visible: true
  }
})

// Drag state
const draggingPanel = ref<string | null>(null)
const dragOffset = reactive({ x: 0, y: 0 })
let maxZIndex = 10

// Resize state
const resizingPanel = ref<string | null>(null)
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 })

// Agent status
const agentStatus = reactive({
  model: 'MiMo V2.5 Pro',
  tokens: 12847,
  latency: 245,
  isThinking: false
})

const thinkingProgress = ref(0)
let thinkingInterval: number

const latencyClass = computed(() => {
  if (agentStatus.latency < 200) return 'green'
  if (agentStatus.latency < 500) return 'orange'
  return 'red'
})

// System metrics
const systemMetrics = reactive({
  cpu: 23,
  memory: 45,
  network: 128
})

// Activity logs
interface LogEntry {
  time: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
}

const logs = ref<LogEntry[]>([
  { time: '10:23:01', level: 'INFO', message: 'System initialized' },
  { time: '10:23:02', level: 'INFO', message: 'Connected to API endpoint' },
  { time: '10:23:05', level: 'DEBUG', message: 'Loading MCP servers...' },
  { time: '10:23:08', level: 'INFO', message: '99 MCP services loaded' },
  { time: '10:23:10', level: 'WARN', message: 'Rate limit approaching (80/100)' },
])

function addLog(level: LogEntry['level'], message: string) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logs.value.push({ time, level, message })
  if (logs.value.length > 100) logs.value.shift()
}

// Panel management
function bringToFront(panelId: string) {
  maxZIndex++
  panels[panelId].style.zIndex = maxZIndex
}

function toggleCollapse(panelId: string) {
  panels[panelId].collapsed = !panels[panelId].collapsed
}

function closePanel(panelId: string) {
  panels[panelId].visible = false
  addLog('DEBUG', `Panel ${panelId} closed`)
}

// Drag functionality
function startDrag(event: MouseEvent, panelId: string) {
  draggingPanel.value = panelId
  const rect = (event.target as HTMLElement).closest('.imgui-panel')?.getBoundingClientRect()

  if (rect) {
    dragOffset.x = event.clientX - rect.left
    dragOffset.y = event.clientY - rect.top
  }

  bringToFront(panelId)
  event.preventDefault()
}

function onMouseMove(event: MouseEvent) {
  if (draggingPanel.value) {
    const panel = panels[draggingPanel.value]
    const newX = event.clientX - dragOffset.x
    const newY = event.clientY - dragOffset.y

    // Constrain to viewport
    const maxX = window.innerWidth - 100
    const maxY = window.innerHeight - 50

    panel.style.left = `${Math.max(0, Math.min(newX, maxX))}px`
    panel.style.top = `${Math.max(0, Math.min(newY, maxY))}px`
  }

  if (resizingPanel.value) {
    const panel = panels[resizingPanel.value]
    const deltaX = event.clientX - resizeStart.x
    const deltaY = event.clientY - resizeStart.y

    const newWidth = Math.max(200, resizeStart.width + deltaX)
    const newHeight = Math.max(100, resizeStart.height + deltaY)

    panel.style.width = `${newWidth}px`
    if (panel.style.height) {
      panel.style.height = `${newHeight}px`
    }
  }
}

function onMouseUp() {
  draggingPanel.value = null
  resizingPanel.value = null
}

// Resize functionality
function startResize(event: MouseEvent, panelId: string) {
  resizingPanel.value = panelId
  const el = (event.target as HTMLElement).closest('.imgui-panel') as HTMLElement

  if (el) {
    resizeStart.x = event.clientX
    resizeStart.y = event.clientY
    resizeStart.width = el.offsetWidth
    resizeStart.height = el.offsetHeight
  }

  bringToFront(panelId)
  event.preventDefault()
}

function getResizeHandleStyle(panelId: string) {
  const panel = panels[panelId]
  return {
    position: 'absolute' as const,
    left: `calc(${panel.style.left} + ${panel.style.width} - 8px)`,
    top: `calc(${panel.style.top} + ${(panel.style.height || '200px')} - 8px)`,
    width: '16px',
    height: '16px',
    zIndex: (panel.style.zIndex || 10) + 1
  }
}

// Simulate updates
let updateInterval: number

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)

  // Simulate system metrics
  updateInterval = window.setInterval(() => {
    systemMetrics.cpu = Math.max(5, Math.min(95, systemMetrics.cpu + (Math.random() - 0.5) * 10))
    systemMetrics.memory = Math.max(20, Math.min(80, systemMetrics.memory + (Math.random() - 0.5) * 5))
    systemMetrics.network = Math.max(0, Math.min(1000, systemMetrics.network + (Math.random() - 0.5) * 50))
    agentStatus.latency = Math.max(100, Math.min(800, agentStatus.latency + (Math.random() - 0.5) * 50))
    agentStatus.tokens += Math.floor(Math.random() * 10)
  }, 2000)

  // Simulate thinking
  thinkingInterval = window.setInterval(() => {
    if (Math.random() < 0.1) {
      agentStatus.isThinking = !agentStatus.isThinking
      if (agentStatus.isThinking) {
        addLog('INFO', 'Agent processing request...')
      }
    }
    if (agentStatus.isThinking) {
      thinkingProgress.value = (thinkingProgress.value + 5) % 100
    }
  }, 500)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  clearInterval(updateInterval)
  clearInterval(thinkingInterval)
})

// Expose addLog for external use
defineExpose({ addLog })
</script>

<style scoped>
.imgui-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.imgui-panel {
  background: rgba(10, 15, 25, 0.92);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
  box-shadow: 0 0 20px rgba(0, 100, 200, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.imgui-panel:hover {
  box-shadow: 0 0 30px rgba(0, 100, 200, 0.2);
}

.imgui-panel.dragging {
  box-shadow: 0 0 40px rgba(0, 200, 255, 0.3);
  opacity: 0.95;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 100, 200, 0.15);
  border-bottom: 1px solid rgba(0, 200, 255, 0.15);
  font-size: 11px;
  font-family: 'SF Mono', monospace;
  font-weight: 600;
  color: rgba(0, 200, 255, 0.9);
  letter-spacing: 1px;
  cursor: move;
  user-select: none;
}

.panel-icon {
  font-size: 12px;
}

.panel-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.panel-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
}

.panel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.panel-btn.close:hover {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.panel-content {
  padding: 12px;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
}

.status-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.label {
  color: rgba(150, 170, 200, 0.6);
}

.value {
  color: rgba(200, 220, 255, 0.9);
}

.value.accent { color: #00d4ff; }
.value.green { color: #34c759; }
.value.orange { color: #ff9500; }
.value.red { color: #ff3b30; }

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #00ff88);
  border-radius: 2px;
  transition: width 0.3s;
}

.metric {
  margin-bottom: 12px;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  color: rgba(150, 170, 200, 0.7);
}

.metric-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.metric-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s;
}

.metric-fill.cpu { background: #00d4ff; }
.metric-fill.memory { background: #34c759; }
.metric-fill.network { background: #ff9500; }

.log-content {
  max-height: 160px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 3px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.02);
  font-size: 11px;
}

.log-time {
  color: rgba(100, 120, 150, 0.5);
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  padding: 0 4px;
  border-radius: 2px;
  font-size: 10px;
}

.log-level.INFO { color: #00d4ff; background: rgba(0, 212, 255, 0.1); }
.log-level.WARN { color: #ff9500; background: rgba(255, 149, 0, 0.1); }
.log-level.ERROR { color: #ff3b30; background: rgba(255, 59, 48, 0.1); }
.log-level.DEBUG { color: #888; background: rgba(136, 136, 136, 0.1); }

.log-message {
  color: rgba(200, 220, 255, 0.7);
}

.resize-handle {
  position: absolute;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
  pointer-events: auto;
}

.resize-handle::after {
  content: '';
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(0, 200, 255, 0.3);
  border-bottom: 2px solid rgba(0, 200, 255, 0.3);
}

.resize-handle:hover::after {
  border-color: rgba(0, 200, 255, 0.6);
}
</style>
