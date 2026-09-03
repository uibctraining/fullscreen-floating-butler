<template>
  <div class="title-bar" @dblclick="toggleMaximize">
    <!-- Drag region -->
    <div class="title-bar-drag">
      <div class="app-info">
        <span class="app-icon">99</span>
        <span class="app-name">99Pages Agentic OS</span>
      </div>
    </div>

    <!-- Window controls -->
    <div class="window-controls">
      <button class="control-btn minimize" @click="minimize" title="Minimize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="5.5" width="8" height="1" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-btn maximize" @click="toggleMaximize" title="Maximize">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect x="2" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      <button class="control-btn close" @click="close" title="Close">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const minimize = () => {
  window.electronAPI?.minimizeWindow();
};

const toggleMaximize = () => {
  window.electronAPI?.maximizeWindow();
};

const close = () => {
  window.electronAPI?.closeWindow();
};
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 32px;
  background: rgba(10, 10, 26, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  -webkit-app-region: drag;
  user-select: none;
}

.title-bar-drag {
  flex: 1;
  display: flex;
  align-items: center;
  padding-left: 12px;
}

.app-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-icon {
  width: 20px;
  height: 20px;
  background: #00d4ff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

.app-name {
  font-size: 12px;
  color: #888;
}

.window-controls {
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.control-btn.close:hover {
  background: #e81123;
  color: #fff;
}
</style>
