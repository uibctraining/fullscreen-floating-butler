<template>
  <div class="accessibility-settings">
    <h3>Accessibility</h3>
    
    <!-- Font Size -->
    <div class="setting-group">
      <label>Font Size</label>
      <div class="font-size-control">
        <button @click="decreaseFontSize" class="size-btn">A-</button>
        <span class="size-value">{{ fontSize }}px</span>
        <button @click="increaseFontSize" class="size-btn">A+</button>
      </div>
    </div>

    <!-- Display Mode -->
    <div class="setting-group">
      <label>Display Mode</label>
      <div class="mode-options">
        <button 
          v-for="mode in displayModes" 
          :key="mode.id"
          class="mode-btn"
          :class="{ active: currentMode === mode.id }"
          @click="setDisplayMode(mode.id)"
        >
          {{ mode.icon }} {{ mode.name }}
        </button>
      </div>
    </div>

    <!-- High Contrast -->
    <div class="setting-group">
      <label>High Contrast</label>
      <div class="toggle-switch">
        <input type="checkbox" v-model="highContrast" @change="toggleHighContrast" />
        <span class="toggle-label">{{ highContrast ? 'On' : 'Off' }}</span>
      </div>
    </div>

    <!-- Voice Feedback -->
    <div class="setting-group">
      <label>Voice Feedback</label>
      <div class="toggle-switch">
        <input type="checkbox" v-model="voiceFeedback" />
        <span class="toggle-label">{{ voiceFeedback ? 'On' : 'Off' }}</span>
      </div>
    </div>

    <!-- Animation Speed -->
    <div class="setting-group">
      <label>Animation Speed</label>
      <div class="speed-control">
        <input 
          type="range" 
          v-model="animationSpeed" 
          min="0" 
          max="2" 
          step="0.5"
          class="speed-slider"
        />
        <span class="speed-value">{{ animationSpeed }}x</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const fontSize = ref(16)
const highContrast = ref(false)
const voiceFeedback = ref(true)
const animationSpeed = ref(1)
const currentMode = ref('normal')

const displayModes = [
  { id: 'normal', name: 'Normal', icon: '📱' },
  { id: 'elderly', name: 'Elderly', icon: '👴' },
  { id: 'compact', name: 'Compact', icon: '📐' }
]

function increaseFontSize() {
  if (fontSize.value < 24) {
    fontSize.value += 2
    applyFontSize()
  }
}

function decreaseFontSize() {
  if (fontSize.value > 12) {
    fontSize.value -= 2
    applyFontSize()
  }
}

function applyFontSize() {
  document.documentElement.style.setProperty('--base-font-size', `${fontSize.value}px`)
}

function setDisplayMode(mode: string) {
  currentMode.value = mode
  
  switch (mode) {
    case 'elderly':
      fontSize.value = 20
      highContrast.value = true
      animationSpeed.value = 0.5
      break
    case 'compact':
      fontSize.value = 14
      highContrast.value = false
      animationSpeed.value = 1
      break
    default:
      fontSize.value = 16
      highContrast.value = false
      animationSpeed.value = 1
  }
  
  applyFontSize()
  applyHighContrast()
}

function toggleHighContrast() {
  applyHighContrast()
}

function applyHighContrast() {
  document.documentElement.classList.toggle('high-contrast', highContrast.value)
}

// Save settings
watch([fontSize, highContrast, voiceFeedback, animationSpeed, currentMode], () => {
  localStorage.setItem('accessibility_settings', JSON.stringify({
    fontSize: fontSize.value,
    highContrast: highContrast.value,
    voiceFeedback: voiceFeedback.value,
    animationSpeed: animationSpeed.value,
    currentMode: currentMode.value
  }))
})

// Load settings
const saved = localStorage.getItem('accessibility_settings')
if (saved) {
  const settings = JSON.parse(saved)
  fontSize.value = settings.fontSize || 16
  highContrast.value = settings.highContrast || false
  voiceFeedback.value = settings.voiceFeedback ?? true
  animationSpeed.value = settings.animationSpeed || 1
  currentMode.value = settings.currentMode || 'normal'
}
</script>

<style scoped>
.accessibility-settings {
  padding: 20px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 20px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  font-size: 14px;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 8px;
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  color: #00d4ff;
  cursor: pointer;
  font-size: 14px;
}

.size-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

.size-value {
  font-size: 16px;
  color: rgba(200, 220, 255, 0.9);
  min-width: 40px;
  text-align: center;
}

.mode-options {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  color: rgba(200, 220, 255, 0.7);
  cursor: pointer;
  font-size: 13px;
  text-align: center;
  transition: all 0.2s;
}

.mode-btn:hover {
  background: rgba(0, 200, 255, 0.05);
}

.mode-btn.active {
  background: rgba(0, 200, 255, 0.15);
  border-color: #00d4ff;
  color: #00d4ff;
}

.toggle-switch {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle-switch input[type="checkbox"] {
  width: 44px;
  height: 24px;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
}

.toggle-switch input[type="checkbox"]::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle-switch input[type="checkbox"]:checked {
  background: #00d4ff;
}

.toggle-switch input[type="checkbox"]:checked::before {
  transform: translateX(20px);
}

.toggle-label {
  font-size: 14px;
  color: rgba(200, 220, 255, 0.7);
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-slider {
  flex: 1;
  height: 4px;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.speed-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00d4ff;
  cursor: pointer;
}

.speed-value {
  font-size: 14px;
  color: rgba(200, 220, 255, 0.7);
  min-width: 30px;
}
</style>
