<template>
  <div class="custom-layout" v-if="isCustomizing">
    <div class="layout-header">
      <h3>Customize Layout</h3>
      <div class="layout-actions">
        <button class="action-btn" @click="resetLayout">Reset</button>
        <button class="action-btn" @click="saveLayout">Save</button>
        <button class="action-btn primary" @click="isCustomizing = false">Done</button>
      </div>
    </div>

    <div class="layout-grid" ref="gridRef">
      <div 
        v-for="panel in panels" 
        :key="panel.id"
        class="layout-panel"
        :style="getPanelStyle(panel)"
        @mousedown="startDrag($event, panel)"
        @touchstart="startDrag($event, panel)"
      >
        <div class="panel-header">
          <span class="panel-icon">{{ panel.icon }}</span>
          <span class="panel-title">{{ panel.title }}</span>
          <div class="panel-actions">
            <button class="panel-btn" @click="resizePanel(panel)">⇲</button>
            <button class="panel-btn" @click="removePanel(panel)">✕</button>
          </div>
        </div>
        <div class="panel-content">
          <component :is="panel.component" />
        </div>
        <!-- Resize handle -->
        <div 
          class="resize-handle"
          @mousedown.stop="startResize($event, panel)"
          @touchstart.stop="startResize($event, panel)"
        ></div>
      </div>
    </div>

    <!-- Add Panel Button -->
    <button class="add-panel-btn" @click="showAddPanel = true">
      + Add Panel
    </button>

    <!-- Add Panel Modal -->
    <div v-if="showAddPanel" class="modal-overlay" @click="showAddPanel = false">
      <div class="modal" @click.stop>
        <h3>Add Panel</h3>
        <div class="panel-options">
          <div 
            v-for="option in availablePanels" 
            :key="option.id"
            class="panel-option"
            @click="addPanel(option)"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-title">{{ option.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Panel {
  id: string
  title: string
  icon: string
  component: string
  x: number
  y: number
  width: number
  height: number
}

const isCustomizing = ref(false)
const showAddPanel = ref(false)

const panels = ref<Panel[]>([
  { id: 'chat', title: 'Chat', icon: '💬', component: 'ChatPanel', x: 0, y: 0, width: 400, height: 600 },
  { id: 'tasks', title: 'Tasks', icon: '✅', component: 'TasksPanel', x: 410, y: 0, width: 300, height: 300 },
  { id: 'notes', title: 'Notes', icon: '📝', component: 'NotesPanel', x: 410, y: 310, width: 300, height: 290 },
])

const availablePanels = [
  { id: 'browser', title: 'Browser', icon: '🌐' },
  { id: 'terminal', title: 'Terminal', icon: '⬛' },
  { id: 'files', title: 'Files', icon: '📁' },
  { id: 'calendar', title: 'Calendar', icon: '📅' },
  { id: 'calculator', title: 'Calculator', icon: '🔢' },
  { id: 'canvas', title: 'Canvas', icon: '🎨' },
  { id: 'video', title: 'Video', icon: '🎬' },
  { id: 'music', title: 'Music', icon: '🎵' },
]

// Drag state
let dragPanel: Panel | null = null
let dragOffset = { x: 0, y: 0 }

// Resize state
let resizePanelRef: Panel | null = null
let resizeStart = { x: 0, y: 0, width: 0, height: 0 }

function getPanelStyle(panel: Panel) {
  return {
    left: `${panel.x}px`,
    top: `${panel.y}px`,
    width: `${panel.width}px`,
    height: `${panel.height}px`
  }
}

function startDrag(event: MouseEvent | TouchEvent, panel: Panel) {
  dragPanel = panel
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  dragOffset.x = clientX - panel.x
  dragOffset.y = clientY - panel.y
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag)
  document.addEventListener('touchend', stopDrag)
}

function onDrag(event: MouseEvent | TouchEvent) {
  if (!dragPanel) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  dragPanel.x = Math.max(0, clientX - dragOffset.x)
  dragPanel.y = Math.max(0, clientY - dragOffset.y)
}

function stopDrag() {
  dragPanel = null
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
}

function startResize(event: MouseEvent | TouchEvent, panel: Panel) {
  resizePanelRef = panel
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  resizeStart = { x: clientX, y: clientY, width: panel.width, height: panel.height }
  
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
  document.addEventListener('touchmove', onResize)
  document.addEventListener('touchend', stopResize)
}

function onResize(event: MouseEvent | TouchEvent) {
  if (!resizePanelRef) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  
  resizePanelRef.width = Math.max(200, resizeStart.width + (clientX - resizeStart.x))
  resizePanelRef.height = Math.max(150, resizeStart.height + (clientY - resizeStart.y))
}

function stopResize() {
  resizePanelRef = null
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('touchmove', onResize)
  document.removeEventListener('touchend', stopResize)
}

function addPanel(option: any) {
  panels.value.push({
    id: `${option.id}-${Date.now()}`,
    title: option.title,
    icon: option.icon,
    component: `${option.title}Panel`,
    x: 100,
    y: 100,
    width: 300,
    height: 300
  })
  showAddPanel.value = false
}

function removePanel(panel: Panel) {
  panels.value = panels.value.filter(p => p.id !== panel.id)
}

function resizePanel(panel: Panel) {
  // Toggle between default and maximized
  if (panel.width < 600) {
    panel.width = 600
    panel.height = 400
  } else {
    panel.width = 300
    panel.height = 300
  }
}

function resetLayout() {
  panels.value = [
    { id: 'chat', title: 'Chat', icon: '💬', component: 'ChatPanel', x: 0, y: 0, width: 400, height: 600 },
    { id: 'tasks', title: 'Tasks', icon: '✅', component: 'TasksPanel', x: 410, y: 0, width: 300, height: 300 },
    { id: 'notes', title: 'Notes', icon: '📝', component: 'NotesPanel', x: 410, y: 310, width: 300, height: 290 },
  ]
}

function saveLayout() {
  localStorage.setItem('custom_layout', JSON.stringify(panels.value))
}

// Load saved layout
onMounted(() => {
  const saved = localStorage.getItem('custom_layout')
  if (saved) {
    panels.value = JSON.parse(saved)
  }
})
</script>

<style scoped>
.custom-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 26, 0.95);
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.layout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.layout-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.layout-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.7);
  cursor: pointer;
  font-size: 13px;
}

.action-btn.primary {
  background: rgba(0, 200, 255, 0.15);
  border-color: rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

.layout-grid {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.layout-panel {
  position: absolute;
  background: rgba(15, 20, 35, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: move;
}

.layout-panel:hover {
  border-color: rgba(0, 200, 255, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
  cursor: move;
}

.panel-icon {
  font-size: 14px;
}

.panel-title {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.8);
}

.panel-actions {
  display: flex;
  gap: 4px;
}

.panel-btn {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: none;
  border: none;
  color: rgba(150, 170, 200, 0.5);
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(200, 220, 255, 0.9);
}

.panel-content {
  flex: 1;
  overflow: auto;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 16px;
  height: 16px;
  cursor: nwse-resize;
}

.resize-handle::after {
  content: '';
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  border-right: 2px solid rgba(0, 200, 255, 0.3);
  border-bottom: 2px solid rgba(0, 200, 255, 0.3);
}

.add-panel-btn {
  position: fixed;
  bottom: 80px;
  right: 20px;
  padding: 12px 20px;
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 24px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 14px;
  z-index: 1001;
}

.add-panel-btn:hover {
  background: rgba(0, 200, 255, 0.25);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1002;
}

.modal {
  background: rgba(10, 15, 25, 0.98);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  width: 400px;
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 16px;
}

.panel-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.panel-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.panel-option:hover {
  background: rgba(0, 200, 255, 0.1);
  border-color: rgba(0, 200, 255, 0.3);
}

.option-icon {
  font-size: 20px;
}

.option-title {
  font-size: 13px;
  color: rgba(200, 220, 255, 0.8);
}
</style>
