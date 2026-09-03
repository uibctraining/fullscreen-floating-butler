<template>
  <div class="theme-settings">
    <h3>Appearance</h3>

    <!-- Theme Selection -->
    <div class="setting-group">
      <label>Theme</label>
      <div class="theme-grid">
        <div 
          v-for="theme in themes" 
          :key="theme.id"
          class="theme-card"
          :class="{ active: currentTheme === theme.id }"
          @click="setTheme(theme.id)"
        >
          <div class="theme-preview" :style="{ background: theme.preview }">
            <div class="preview-dot" :style="{ background: theme.accent }"></div>
          </div>
          <span class="theme-name">{{ theme.name }}</span>
        </div>
      </div>
    </div>

    <!-- Font Selection -->
    <div class="setting-group">
      <label>Font</label>
      <div class="font-options">
        <div 
          v-for="font in fonts" 
          :key="font.id"
          class="font-option"
          :class="{ active: currentFont === font.id }"
          @click="setFont(font.id)"
        >
          <span class="font-preview" :style="{ fontFamily: font.family }">Aa</span>
          <span class="font-name">{{ font.name }}</span>
        </div>
      </div>
    </div>

    <!-- Icon Style -->
    <div class="setting-group">
      <label>Icon Style</label>
      <div class="icon-options">
        <div 
          v-for="icon in iconStyles" 
          :key="icon.id"
          class="icon-option"
          :class="{ active: currentIconStyle === icon.id }"
          @click="setIconStyle(icon.id)"
        >
          <span class="icon-preview">{{ icon.preview }}</span>
          <span class="icon-name">{{ icon.name }}</span>
        </div>
      </div>
    </div>

    <!-- Animation Intensity -->
    <div class="setting-group">
      <label>Animation Intensity</label>
      <div class="animation-control">
        <input 
          type="range" 
          v-model="animationIntensity" 
          min="0" 
          max="2" 
          step="0.5"
          class="intensity-slider"
        />
        <div class="intensity-labels">
          <span>None</span>
          <span>Reduced</span>
          <span>Full</span>
        </div>
      </div>
    </div>

    <!-- Accent Color -->
    <div class="setting-group">
      <label>Accent Color</label>
      <div class="color-options">
        <div 
          v-for="color in accentColors" 
          :key="color"
          class="color-option"
          :class="{ active: currentAccent === color }"
          :style="{ background: color }"
          @click="setAccentColor(color)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const currentTheme = ref('dark')
const currentFont = ref('sf-pro')
const currentIconStyle = ref('heroicons')
const animationIntensity = ref(1)
const currentAccent = ref('#00d4ff')

const themes = [
  { id: 'dark', name: 'Dark', preview: 'linear-gradient(135deg, #0a0a1a, #0d1b2a)', accent: '#00d4ff' },
  { id: 'light', name: 'Light', preview: 'linear-gradient(135deg, #f5f5f7, #ffffff)', accent: '#007aff' },
  { id: 'pink', name: 'Pink', preview: 'linear-gradient(135deg, #1a0a1a, #2a0a2a)', accent: '#ff6b9d' },
  { id: 'purple', name: 'Purple', preview: 'linear-gradient(135deg, #0a0a2a, #1a0a3a)', accent: '#af52de' },
  { id: 'ocean', name: 'Ocean', preview: 'linear-gradient(135deg, #0a1a2a, #0a2a3a)', accent: '#00b4d8' },
  { id: 'nature', name: 'Nature', preview: 'linear-gradient(135deg, #0a1a0a, #0a2a0a)', accent: '#34c759' },
]

const fonts = [
  { id: 'sf-pro', name: 'SF Pro', family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' },
  { id: 'inter', name: 'Inter', family: '"Inter", sans-serif' },
  { id: 'nunito', name: 'Nunito', family: '"Nunito", sans-serif' },
  { id: 'poppins', name: 'Poppins', family: '"Poppins", sans-serif' },
  { id: 'roboto', name: 'Roboto', family: '"Roboto", sans-serif' },
]

const iconStyles = [
  { id: 'heroicons', name: 'Heroicons', preview: '🏠' },
  { id: 'phosphor', name: 'Phosphor', preview: '🏠' },
  { id: 'lucide', name: 'Lucide', preview: '🏠' },
  { id: 'tabler', name: 'Tabler', preview: '🏠' },
]

const accentColors = [
  '#00d4ff', '#007aff', '#ff6b9d', '#af52de', '#00b4d8', '#34c759',
  '#ff9500', '#ff3b30', '#5856d6', '#ff2d55', '#30d158', '#64d2ff'
]

function setTheme(themeId: string) {
  currentTheme.value = themeId
  applyTheme()
}

function setFont(fontId: string) {
  currentFont.value = fontId
  applyFont()
}

function setIconStyle(styleId: string) {
  currentIconStyle.value = styleId
}

function setAccentColor(color: string) {
  currentAccent.value = color
  applyAccentColor()
}

function applyTheme() {
  const theme = themes.find(t => t.id === currentTheme.value)
  if (!theme) return
  
  document.documentElement.setAttribute('data-theme', currentTheme.value)
  localStorage.setItem('theme', currentTheme.value)
}

function applyFont() {
  const font = fonts.find(f => f.id === currentFont.value)
  if (!font) return
  
  document.documentElement.style.setProperty('--font-family', font.family)
  localStorage.setItem('font', currentFont.value)
}

function applyAccentColor() {
  document.documentElement.style.setProperty('--accent-color', currentAccent.value)
  localStorage.setItem('accent-color', currentAccent.value)
}

// Load saved settings
const savedTheme = localStorage.getItem('theme')
if (savedTheme) currentTheme.value = savedTheme

const savedFont = localStorage.getItem('font')
if (savedFont) currentFont.value = savedFont

const savedAccent = localStorage.getItem('accent-color')
if (savedAccent) currentAccent.value = savedAccent
</script>

<style scoped>
.theme-settings {
  padding: 20px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 20px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-group label {
  display: block;
  font-size: 14px;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 12px;
}

/* Theme Grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-card {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.theme-card:hover {
  background: rgba(0, 200, 255, 0.05);
}

.theme-card.active {
  border-color: #00d4ff;
  background: rgba(0, 200, 255, 0.1);
}

.theme-preview {
  width: 100%;
  height: 60px;
  border-radius: 6px;
  margin-bottom: 8px;
  position: relative;
  overflow: hidden;
}

.preview-dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.theme-name {
  font-size: 12px;
  color: rgba(200, 220, 255, 0.7);
}

/* Font Options */
.font-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.font-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.font-option:hover {
  background: rgba(0, 200, 255, 0.05);
}

.font-option.active {
  border-color: #00d4ff;
  background: rgba(0, 200, 255, 0.1);
}

.font-preview {
  font-size: 18px;
  color: rgba(200, 220, 255, 0.9);
}

.font-name {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.7);
}

/* Icon Options */
.icon-options {
  display: flex;
  gap: 8px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option:hover {
  background: rgba(0, 200, 255, 0.05);
}

.icon-option.active {
  border-color: #00d4ff;
  background: rgba(0, 200, 255, 0.1);
}

.icon-preview {
  font-size: 24px;
}

.icon-name {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.7);
}

/* Animation Control */
.animation-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.intensity-slider {
  width: 100%;
  height: 4px;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.intensity-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #00d4ff;
  cursor: pointer;
}

.intensity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: rgba(150, 170, 200, 0.5);
}

/* Color Options */
.color-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.active {
  border-color: #fff;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}
</style>
