<template>
  <div class="cloud-os">
    <!-- Layer 1: HUD Background -->
    <JarvisHUD />

    <!-- Layer 2: Main Layout -->
    <div class="main-layout">
      <!-- Sidebar -->
      <Sidebar
        @new-chat="handleNewChat"
        @section-change="handleSectionChange"
      />

      <!-- Content Area -->
      <div class="content-area">
        <!-- Header -->
        <header class="content-header">
          <div class="header-left">
            <h1 class="page-title">{{ currentPageTitle }}</h1>
          </div>
          <div class="header-right">
            <div class="status-badge">
              <span class="status-dot"></span>
              <span>Friday: Active</span>
            </div>
            <div class="credit-badge" @click="showCredits = true">
              <span>⚡</span>
              <span>{{ credits.toLocaleString() }} Credits</span>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Golden Layout (Tabs) -->
          <GoldenLayout v-if="currentSection === 'workspace'" />

          <!-- Settings Page -->
          <SettingsPage v-else-if="currentSection === 'settings'" @close="currentSection = 'workspace'" />

          <!-- Credits Page -->
          <CreditsPage v-else-if="currentSection === 'credits' || showCredits" @close="showCredits = false" />

          <!-- MCP Manager -->
          <MCPManager v-else-if="currentSection === 'plugins'" />

          <!-- Default View -->
          <div v-else class="default-view">
            <FridayAvatar :status="fridayStatus" :is-listening="isListening" />
            <ChatArea :messages="messages" />
            <QuickActions @action="quickAction" />
          </div>
        </div>

        <!-- Composer (Always visible) -->
        <Composer
          v-model="inputText"
          :is-listening="isListening"
          @send="sendMessage"
          @toggle-mic="toggleMic"
        />
      </div>

      <!-- Layer 2: ImGui Panels (Floating) -->
      <ImGuiPanel ref="imguiPanel" />
    </div>

    <!-- Status Bar -->
    <StatusBar
      :is-active="true"
      :is-listening="isListening"
      :credits="credits"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import JarvisHUD from './components/JarvisHUD.vue'
import Sidebar from './components/Sidebar.vue'
import GoldenLayout from './components/GoldenLayout.vue'
import ImGuiPanel from './components/ImGuiPanel.vue'
import FridayAvatar from './components/FridayAvatar.vue'
import ChatArea from './components/ChatArea.vue'
import Composer from './components/Composer.vue'
import QuickActions from './components/QuickActions.vue'
import StatusBar from './components/StatusBar.vue'
import SettingsPage from './components/SettingsPage.vue'
import CreditsPage from './components/CreditsPage.vue'
import MCPManager from './components/MCPManager.vue'

interface Message {
  id: number
  sender: 'user' | 'friday'
  text: string
  time: string
}

const messages = ref<Message[]>([
  {
    id: 1,
    sender: 'friday',
    text: "Hello! I'm Friday, your AI assistant. How can I help you today?",
    time: 'Just now'
  }
])

const inputText = ref('')
const isListening = ref(false)
const fridayStatus = ref('Ready')
const credits = ref(1000)
const currentSection = ref('workspace')
const showCredits = ref(false)

const imguiPanel = ref<InstanceType<typeof ImGuiPanel> | null>(null)

const currentPageTitle = computed(() => {
  switch (currentSection.value) {
    case 'workspace': return 'Workspace'
    case 'settings': return 'Settings'
    case 'credits': return 'Credits & Subscription'
    case 'tasks': return 'Activity Inbox'
    case 'projects': return 'Projects'
    case 'plugins': return 'MCP Tools'
    case 'library': return 'Library'
    default: return 'Workspace'
  }
})

function handleNewChat() {
  messages.value = [{
    id: Date.now(),
    sender: 'friday',
    text: "New conversation started. How can I help?",
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }]
}

function handleSectionChange(section: string) {
  currentSection.value = section
}

function toggleMic() {
  isListening.value = !isListening.value
  fridayStatus.value = isListening.value ? 'Listening...' : 'Ready'
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  messages.value.push({
    id: Date.now(),
    sender: 'user',
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  inputText.value = ''

  // Log to ImGui panel
  imguiPanel.value?.addLog('INFO', `User: ${text}`)

  // Simulate Friday response
  setTimeout(() => {
    const lower = text.toLowerCase()
    let response = "I'll help you with that right away!"

    if (lower.includes('setting')) {
      currentSection.value = 'settings'
      response = 'Opening settings...'
    } else if (lower.includes('credit') || lower.includes('subscription')) {
      showCredits.value = true
      response = 'Opening credits page...'
    } else if (lower.includes('help')) {
      response = "I can help you with emails, calendar, files, and more. Just ask!"
    }

    messages.value.push({
      id: Date.now(),
      sender: 'friday',
      text: response,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })

    imguiPanel.value?.addLog('INFO', `Friday: ${response}`)
  }, 800)
}

function quickAction(action: string) {
  const actionMessages: Record<string, string> = {
    email: 'Check my email',
    calendar: "Show today's events",
    files: 'Open file manager',
    console: 'Open console'
  }

  inputText.value = actionMessages[action] || ''
  sendMessage()
}
</script>

<style>
@import './style.css';

.cloud-os {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.main-layout {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  height: 100%;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(10, 15, 25, 0.95);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(52, 199, 89, 0.15);
  border-radius: 20px;
  font-size: 12px;
  color: #34c759;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34c759;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.credit-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(241, 196, 15, 0.15);
  border-radius: 20px;
  font-size: 12px;
  color: #f1c40f;
  cursor: pointer;
}

.credit-badge:hover {
  background: rgba(241, 196, 15, 0.25);
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.default-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}
</style>
