<template>
  <div class="right-panel" :class="{ open: isOpen }">
    <div class="panel-header">
      <span class="panel-title">Extensions</span>
      <button class="btn-close" @click="$emit('close')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    <div class="panel-tabs">
      <button class="tab active">Installed</button>
      <button class="tab">Browse</button>
    </div>
    <div class="panel-content">
      <div 
        v-for="ext in extensions" 
        :key="ext.id"
        class="ext-card"
        @click="$emit('open-extension', ext.id)"
      >
        <div class="ext-header">
          <div class="ext-icon" :style="{ background: ext.color + '20' }">
            {{ ext.icon }}
          </div>
          <div class="ext-info">
            <div class="ext-name">{{ ext.name }}</div>
            <div class="ext-desc">{{ ext.description }}</div>
          </div>
          <span class="ext-badge" :class="ext.active ? 'active' : 'install'">
            {{ ext.active ? 'Active' : 'Install' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Extension {
  id: string
  name: string
  description: string
  icon: string
  color: string
  active: boolean
}

defineProps<{
  isOpen: boolean
  extensions: Extension[]
}>()

defineEmits<{
  close: []
  'open-extension': [id: string]
}>()
</script>

<style scoped>
.right-panel {
  position: fixed;
  top: 0;
  right: -380px;
  width: 380px;
  height: 100vh;
  background: rgba(20, 20, 30, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 100;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.right-panel.open {
  right: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.btn-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

.panel-tabs {
  display: flex;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.tab {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.tab:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab.active {
  color: #007aff;
  border-bottom-color: #007aff;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.ext-card {
  padding: 14px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  margin-bottom: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.15s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.ext-card:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.ext-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ext-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.ext-info {
  flex: 1;
  min-width: 0;
}

.ext-name {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.ext-desc {
  font-size: 12px;
  color: #86868b;
  margin-top: 2px;
}

.ext-badge {
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.ext-badge.active {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.ext-badge.install {
  background: rgba(0, 122, 255, 0.15);
  color: #007aff;
}
</style>
