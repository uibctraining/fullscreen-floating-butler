<template>
  <div class="error-boundary" v-if="hasError">
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{{ errorMessage }}</p>
      
      <div class="error-actions">
        <button class="error-btn primary" @click="retry">
          <ArrowPathIcon class="btn-icon" />
          Try Again
        </button>
        <button class="error-btn secondary" @click="reportError">
          <BugAntIcon class="btn-icon" />
          Report Issue
        </button>
      </div>

      <div class="error-details" v-if="showDetails">
        <pre>{{ errorStack }}</pre>
      </div>
      
      <button class="details-toggle" @click="showDetails = !showDetails">
        {{ showDetails ? 'Hide' : 'Show' }} Details
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { ArrowPathIcon, BugAntIcon } from '@heroicons/vue/24/outline'

const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const showDetails = ref(false)

onErrorCaptured((error) => {
  hasError.value = true
  errorMessage.value = error.message || 'An unexpected error occurred'
  errorStack.value = error.stack || ''
  return false
})

function retry() {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
}

function reportError() {
  const issueUrl = `https://github.com/uibctraining/fullscreen-floating-butler/issues/new?title=${encodeURIComponent(errorMessage.value)}&body=${encodeURIComponent(errorStack.value)}`
  window.open(issueUrl, '_blank')
}
</script>

<style scoped>
.error-boundary {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 26, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.error-container {
  text-align: center;
  padding: 40px;
  max-width: 500px;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 12px;
}

.error-message {
  font-size: 14px;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 24px;
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
}

.error-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.error-btn.primary {
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

.error-btn.primary:hover {
  background: rgba(0, 200, 255, 0.25);
}

.error-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(200, 220, 255, 0.7);
}

.error-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.error-details {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  text-align: left;
}

.error-details pre {
  font-family: 'SF Mono', monospace;
  font-size: 11px;
  color: rgba(255, 59, 48, 0.7);
  white-space: pre-wrap;
  word-break: break-all;
}

.details-toggle {
  background: none;
  border: none;
  color: rgba(150, 170, 200, 0.5);
  cursor: pointer;
  font-size: 12px;
}

.details-toggle:hover {
  color: rgba(200, 220, 255, 0.9);
}
</style>
