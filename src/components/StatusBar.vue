<template>
  <div class="status-bar">
    <div class="status-group">
      <div class="status-item">
        <span class="dot" :class="isActive ? 'green' : 'gray'"></span>
        <span class="label">FRIDAY</span>
        <span class="value">{{ isActive ? 'ONLINE' : 'OFFLINE' }}</span>
      </div>
      <div class="divider"></div>
      <div class="status-item">
        <span class="dot" :class="isListening ? 'orange' : 'green'"></span>
        <span class="label">VOICE</span>
        <span class="value">{{ isListening ? 'LISTENING' : 'READY' }}</span>
      </div>
      <div class="divider"></div>
      <div class="status-item">
        <span class="label">CREDITS</span>
        <span class="value accent">{{ credits.toLocaleString() }}</span>
      </div>
    </div>

    <div class="status-group">
      <span class="label">99PAGES AGENTIC OS</span>
      <div class="divider"></div>
      <span class="value">{{ currentTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  isActive: boolean
  isListening: boolean
  credits: number
}>()

const currentTime = ref('')
let timer: number

function updateTime() {
  currentTime.value = new Date().toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: rgba(5, 10, 20, 0.95);
  border-top: 1px solid rgba(0, 200, 255, 0.1);
  font-size: 10px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  z-index: 50;
  backdrop-filter: blur(10px);
}

.status-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.label {
  color: rgba(150, 170, 200, 0.5);
  letter-spacing: 1px;
}

.value {
  color: rgba(200, 220, 255, 0.8);
  letter-spacing: 0.5px;
}

.value.accent {
  color: #00d4ff;
}

.divider {
  width: 1px;
  height: 12px;
  background: rgba(0, 200, 255, 0.15);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot.green {
  background: #34c759;
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.6);
}

.dot.orange {
  background: #ff9500;
  box-shadow: 0 0 6px rgba(255, 149, 0, 0.6);
  animation: blink 1s infinite;
}

.dot.gray {
  background: #555;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
