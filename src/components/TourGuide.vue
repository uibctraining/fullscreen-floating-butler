<template>
  <div v-if="isActive" class="tour-overlay">
    <!-- Highlight mask -->
    <div class="tour-mask" :style="maskStyle"></div>
    
    <!-- Tour tooltip -->
    <div class="tour-tooltip" :style="tooltipStyle">
      <div class="tour-header">
        <span class="tour-step">Step {{ currentStep + 1 }} of {{ steps.length }}</span>
        <button class="tour-close" @click="skip">✕</button>
      </div>
      
      <div class="tour-content">
        <div class="tour-icon">{{ currentStepData.icon }}</div>
        <h3 class="tour-title">{{ currentStepData.title }}</h3>
        <p class="tour-desc">{{ currentStepData.description }}</p>
      </div>

      <div class="tour-footer">
        <div class="tour-dots">
          <span
            v-for="(_, i) in steps"
            :key="i"
            class="dot"
            :class="{ active: i === currentStep }"
          ></span>
        </div>
        <div class="tour-actions">
          <button v-if="currentStep > 0" class="tour-btn secondary" @click="prev">Back</button>
          <button class="tour-btn primary" @click="next">
            {{ currentStep === steps.length - 1 ? 'Get Started' : 'Next' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Arrow pointer -->
    <div class="tour-arrow" :style="arrowStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface TourStep {
  icon: string
  title: string
  description: string
  target: string // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<{
  steps?: TourStep[]
  autoStart?: boolean
}>(), {
  autoStart: true
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'skip'): void
}>()

const isActive = ref(false)
const currentStep = ref(0)

const defaultSteps: TourStep[] = [
  {
    icon: '👋',
    title: 'Welcome to 99Pages!',
    description: 'Your AI-powered operating system. Let me show you around!',
    target: '.logo',
    position: 'bottom'
  },
  {
    icon: '💬',
    title: 'Chat with Friday',
    description: 'Type or speak your request here. Friday will help you with anything!',
    target: '.composer',
    position: 'top'
  },
  {
    icon: '🎤',
    title: 'Voice Control',
    description: 'Click the microphone to speak. Friday listens and responds!',
    target: '.btn-mic',
    position: 'top'
  },
  {
    icon: '📊',
    title: 'Activity Inbox',
    description: 'See all your tasks and activities here. Stay organized!',
    target: '[data-section="tasks"]',
    position: 'right'
  },
  {
    icon: '🔌',
    title: 'MCP Tools',
    description: 'Access 99 powerful tools. From social media to finance!',
    target: '[data-section="plugins"]',
    position: 'right'
  },
  {
    icon: '⚙️',
    title: 'Settings',
    description: 'Customize your experience. Manage account, model, and more!',
    target: '[data-section="settings"]',
    position: 'right'
  },
  {
    icon: '🚀',
    title: "You're Ready!",
    description: 'Start chatting with Friday or explore the tools. Have fun!',
    target: '.logo',
    position: 'bottom'
  }
]

const steps = computed(() => props.steps || defaultSteps)
const currentStepData = computed(() => steps.value[currentStep.value])

// Calculate positions
const maskStyle = computed(() => {
  const target = document.querySelector(currentStepData.value.target)
  if (!target) return { display: 'none' }
  
  const rect = target.getBoundingClientRect()
  return {
    top: `${rect.top - 8}px`,
    left: `${rect.left - 8}px`,
    width: `${rect.width + 16}px`,
    height: `${rect.height + 16}px`
  }
})

const tooltipStyle = computed(() => {
  const target = document.querySelector(currentStepData.value.target)
  if (!target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  
  const rect = target.getBoundingClientRect()
  const position = currentStepData.value.position
  const gap = 16

  switch (position) {
    case 'top':
      return {
        bottom: `${window.innerHeight - rect.top + gap}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      }
    case 'bottom':
      return {
        top: `${rect.bottom + gap}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      }
    case 'left':
      return {
        top: `${rect.top + rect.height / 2}px`,
        right: `${window.innerWidth - rect.left + gap}px`,
        transform: 'translateY(-50%)'
      }
    case 'right':
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + gap}px`,
        transform: 'translateY(-50%)'
      }
    default:
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
  }
})

const arrowStyle = computed(() => {
  const target = document.querySelector(currentStepData.value.target)
  if (!target) return { display: 'none' }
  
  const rect = target.getBoundingClientRect()
  const position = currentStepData.value.position

  switch (position) {
    case 'top':
      return {
        bottom: `${window.innerHeight - rect.top + 8}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%) rotate(180deg)'
      }
    case 'bottom':
      return {
        top: `${rect.bottom + 8}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      }
    case 'left':
      return {
        top: `${rect.top + rect.height / 2}px`,
        right: `${window.innerWidth - rect.left + 8}px`,
        transform: 'translateY(-50%) rotate(90deg)'
      }
    case 'right':
      return {
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.right + 8}px`,
        transform: 'translateY(-50%) rotate(-90deg)'
      }
    default:
      return { display: 'none' }
  }
})

function start() {
  currentStep.value = 0
  isActive.value = true
}

function next() {
  if (currentStep.value < steps.value.length - 1) {
    currentStep.value++
  } else {
    complete()
  }
}

function prev() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function skip() {
  isActive.value = false
  emit('skip')
}

function complete() {
  isActive.value = false
  localStorage.setItem('tour_completed', 'true')
  emit('complete')
}

onMounted(() => {
  // Auto-start if not completed before
  const completed = localStorage.getItem('tour_completed')
  if (props.autoStart && !completed) {
    setTimeout(() => start(), 1000)
  }
})

// Expose methods
defineExpose({ start, skip, complete })
</script>

<style scoped>
.tour-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  pointer-events: none;
}

.tour-mask {
  position: absolute;
  background: rgba(0, 200, 255, 0.1);
  border: 2px solid rgba(0, 200, 255, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.2);
  pointer-events: auto;
  transition: all 0.3s ease;
}

.tour-tooltip {
  position: absolute;
  width: 300px;
  background: rgba(10, 15, 25, 0.98);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 12px;
  padding: 0;
  pointer-events: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.tour-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.tour-step {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.5);
  font-family: 'SF Mono', monospace;
}

.tour-close {
  background: none;
  border: none;
  color: rgba(150, 170, 200, 0.5);
  cursor: pointer;
  font-size: 14px;
  padding: 2px;
}

.tour-close:hover {
  color: #ff3b30;
}

.tour-content {
  padding: 20px 16px;
  text-align: center;
}

.tour-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.tour-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 8px;
}

.tour-desc {
  font-size: 13px;
  color: rgba(150, 170, 200, 0.7);
  line-height: 1.5;
}

.tour-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 200, 255, 0.1);
}

.tour-dots {
  display: flex;
  gap: 6px;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(150, 170, 200, 0.3);
}

.dot.active {
  background: #00d4ff;
  box-shadow: 0 0 6px rgba(0, 212, 255, 0.5);
}

.tour-actions {
  display: flex;
  gap: 8px;
}

.tour-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tour-btn.primary {
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

.tour-btn.primary:hover {
  background: rgba(0, 200, 255, 0.25);
}

.tour-btn.secondary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(200, 220, 255, 0.7);
}

.tour-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 8px solid rgba(0, 200, 255, 0.5);
  pointer-events: none;
}
</style>
