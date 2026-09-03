<template>
  <div class="streaming-text" :class="{ active: isStreaming }">
    <div class="text-content" ref="contentRef">
      <span
        v-for="(char, index) in displayedChars"
        :key="index"
        class="char"
        :class="{ cursor: index === displayedChars.length - 1 && isStreaming }"
        :style="{ animationDelay: `${index * 10}ms` }"
      >{{ char }}</span>
    </div>
    <div v-if="isStreaming" class="typing-indicator">
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  text?: string
  speed?: number
  autoStart?: boolean
}>(), {
  text: '',
  speed: 30,
  autoStart: true
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'char', char: string, index: number): void
}>()

const contentRef = ref<HTMLElement | null>(null)
const displayedChars = ref<string[]>([])
const isStreaming = ref(false)
let currentIndex = 0
let timer: number | null = null

function startStreaming() {
  if (isStreaming.value) return
  isStreaming.value = true
  currentIndex = 0
  displayedChars.value = []
  streamNextChar()
}

function streamNextChar() {
  if (currentIndex >= props.text.length) {
    isStreaming.value = false
    emit('complete')
    return
  }

  const char = props.text[currentIndex]
  displayedChars.value.push(char)
  emit('char', char, currentIndex)
  currentIndex++

  // Auto-scroll to bottom
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  })

  // Variable speed for natural feel
  let delay = props.speed
  if (char === '.' || char === '!' || char === '?') {
    delay = props.speed * 4 // Pause at sentence end
  } else if (char === ',') {
    delay = props.speed * 2 // Pause at comma
  } else if (char === '\n') {
    delay = props.speed * 3 // Pause at newline
  }

  timer = window.setTimeout(streamNextChar, delay)
}

function stopStreaming() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  isStreaming.value = false
}

function reset() {
  stopStreaming()
  displayedChars.value = []
  currentIndex = 0
}

// Watch for text changes
watch(() => props.text, (newText) => {
  if (newText && props.autoStart) {
    reset()
    startStreaming()
  }
})

onMounted(() => {
  if (props.text && props.autoStart) {
    startStreaming()
  }
})

// Expose methods
defineExpose({
  startStreaming,
  stopStreaming,
  reset
})
</script>

<style scoped>
.streaming-text {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(200, 220, 255, 0.9);
}

.text-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.1);
}

.char {
  opacity: 0;
  animation: fadeIn 0.1s ease forwards;
}

.char.cursor {
  animation: blink 0.5s infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00d4ff;
  animation: typing 1.4s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}
</style>
