<template>
  <div class="settings-page">
    <div class="settings-header">
      <h2>Settings</h2>
      <button class="close-btn" @click="$emit('close')">
        <XMarkIcon class="icon" />
      </button>
    </div>

    <div class="settings-content">
      <!-- Account Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <UserCircleIcon class="section-icon" />
          Account
        </h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Profile</span>
            <span class="setting-desc">Manage your account information</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Subscription</span>
            <span class="setting-value">Pro Plan</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Credits</span>
            <span class="setting-value credits">{{ credits.toLocaleString() }}</span>
          </div>
          <button class="top-up-btn">Top Up</button>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Billing</span>
            <span class="setting-desc">View billing history and invoices</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
      </div>

      <!-- Model Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <CpuChipIcon class="section-icon" />
          Model
        </h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Model Selection</span>
            <span class="setting-value">{{ currentModel }}</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">API Keys</span>
            <span class="setting-desc">Manage your API keys</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Reasoning Effort</span>
            <span class="setting-value">{{ reasoningEffort }}</span>
          </div>
          <select v-model="reasoningEffort" class="setting-select">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <PaintBrushIcon class="section-icon" />
          Appearance
        </h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Theme</span>
          </div>
          <div class="theme-toggle">
            <button :class="{ active: theme === 'dark' }" @click="theme = 'dark'">Dark</button>
            <button :class="{ active: theme === 'light' }" @click="theme = 'light'">Light</button>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Language</span>
            <span class="setting-value">{{ language }}</span>
          </div>
          <select v-model="language" class="setting-select">
            <option>English</option>
            <option>中文</option>
            <option>日本語</option>
          </select>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Font Size</span>
          </div>
          <div class="font-size-control">
            <button @click="fontSize = Math.max(12, fontSize - 1)">-</button>
            <span>{{ fontSize }}px</span>
            <button @click="fontSize = Math.min(20, fontSize + 1)">+</button>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <ShieldCheckIcon class="section-icon" />
          Security
        </h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Privacy</span>
            <span class="setting-desc">Manage your privacy settings</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Data Controls</span>
            <span class="setting-desc">Manage data retention and export</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Sessions</span>
            <span class="setting-desc">Manage active sessions</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
      </div>

      <!-- About Section -->
      <div class="settings-section">
        <h3 class="section-title">
          <InformationCircleIcon class="section-icon" />
          About
        </h3>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Version</span>
            <span class="setting-value">v1.0.0</span>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Updates</span>
            <span class="setting-desc">Check for updates</span>
          </div>
          <button class="check-update-btn">Check</button>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <span class="setting-label">Support</span>
            <span class="setting-desc">Get help and documentation</span>
          </div>
          <ChevronRightIcon class="setting-arrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  XMarkIcon,
  UserCircleIcon,
  CpuChipIcon,
  PaintBrushIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

defineEmits(['close'])

const credits = ref(1000)
const currentModel = ref('MiMo V2.5 Pro')
const reasoningEffort = ref('Medium')
const theme = ref('dark')
const language = ref('English')
const fontSize = ref(14)
</script>

<style scoped>
.settings-page {
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 25, 0.98);
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.settings-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.close-btn {
  background: none;
  border: none;
  color: rgba(150, 170, 200, 0.5);
  cursor: pointer;
  padding: 4px;
}

.close-btn:hover {
  color: rgba(200, 220, 255, 0.9);
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.settings-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 200, 255, 0.8);
  margin-bottom: 12px;
}

.section-icon {
  width: 18px;
  height: 18px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.setting-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-label {
  font-size: 13px;
  color: rgba(200, 220, 255, 0.9);
}

.setting-desc {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.5);
}

.setting-value {
  font-size: 12px;
  color: rgba(0, 200, 255, 0.7);
}

.setting-value.credits {
  color: #f1c40f;
  font-weight: 600;
}

.setting-arrow {
  width: 16px;
  height: 16px;
  color: rgba(150, 170, 200, 0.3);
}

.setting-select {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  color: rgba(200, 220, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.top-up-btn {
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.top-up-btn:hover {
  background: rgba(0, 200, 255, 0.25);
}

.theme-toggle {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 2px;
}

.theme-toggle button {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: rgba(150, 170, 200, 0.7);
  cursor: pointer;
  font-size: 12px;
}

.theme-toggle button.active {
  background: rgba(0, 200, 255, 0.2);
  color: #00d4ff;
}

.font-size-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.font-size-control button {
  width: 24px;
  height: 24px;
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 4px;
  background: transparent;
  color: rgba(200, 220, 255, 0.9);
  cursor: pointer;
}

.font-size-control span {
  font-size: 12px;
  color: rgba(200, 220, 255, 0.9);
  min-width: 40px;
  text-align: center;
}

.check-update-btn {
  background: rgba(52, 199, 89, 0.15);
  border: 1px solid rgba(52, 199, 89, 0.3);
  color: #34c759;
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.check-update-btn:hover {
  background: rgba(52, 199, 89, 0.25);
}
</style>
