<template>
  <div class="quick-actions">
    <button class="chip" @click="$emit('action', 'email')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <span>Email</span>
    </button>
    <button class="chip" @click="$emit('action', 'calendar')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <span>Calendar</span>
    </button>
    <button class="chip" @click="$emit('action', 'files')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
      <span>Files</span>
    </button>
    <button class="chip" @click="$emit('action', 'console')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="4 17 10 11 4 5"/>
        <line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
      <span>Console</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  action: [type: string]
}>()
</script>

<style scoped>
.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  min-height: 32px;
}

.chip:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-color: #007aff;
}
</style>
