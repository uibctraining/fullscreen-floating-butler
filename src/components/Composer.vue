<template>
  <div class="composer">
    <button 
      class="btn-mic"
      :class="{ active: isListening }"
      @click="$emit('toggle-mic')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
        <path d="M19 10v2a7 7 0 01-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    </button>
    <div class="composer-input-wrapper">
      <input 
        type="text" 
        class="composer-input"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @keydown.enter="$emit('send')"
        placeholder="Speak or type..."
      >
      <button class="btn-send" @click="$emit('send')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  isListening: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'send': []
  'toggle-mic': []
}>()
</script>

<style scoped>
.composer {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.btn-mic {
  width: 44px;
  height: 44px;
  padding: 0;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-mic:hover {
  background: #0066d6;
}

.btn-mic.active {
  background: #ff3b30;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 59, 48, 0.4); }
  50% { box-shadow: 0 0 0 10px transparent; }
}

.composer-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  min-height: 44px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.composer-input-wrapper:focus-within {
  border-color: #007aff;
}

.composer-input {
  flex: 1;
  background: none;
  border: none;
  color: #1d1d1f;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  outline: none;
}

.composer-input::placeholder {
  color: #86868b;
}

.btn-send {
  width: 36px;
  height: 36px;
  padding: 0;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn-send:hover {
  background: #0066d6;
}
</style>
