<template>
  <div class="app">
    <!-- Layer 5: Electron Title Bar -->
    <TitleBar v-if="isElectron" />

    <!-- Layer 1: Three.js HUD Background -->
    <JarvisHUD />

    <!-- Layer 2: Dear ImGui Agent Panels -->
    <ImGuiPanel ref="imguiPanel" />

    <!-- Layer 3: Golden Layout Rich Media -->
    <GoldenLayout ref="goldenLayout" />

    <!-- Layer 4: Vue Business UI (overlay) -->
    <div class="business-ui" v-if="showChat">
      <FridayAvatar
        :status="fridayStatus"
        :is-listening="isListening"
      />
      <ChatArea :messages="messages" />
      <QuickActions @action="quickAction" />
    </div>

    <!-- Layer 5: Composer (Persistent Bottom Bar) -->
    <Composer
      v-model="inputText"
      :is-listening="isListening"
      @send="sendMessage"
      @toggle-mic="toggleMic"
    />

    <!-- Status Bar -->
    <StatusBar
      :is-active="true"
      :is-listening="isListening"
      :credits="847"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import TitleBar from './components/TitleBar.vue'
import JarvisHUD from './components/JarvisHUD.vue'
import ImGuiPanel from './components/ImGuiPanel.vue'
import GoldenLayout from './components/GoldenLayout.vue'
import FridayAvatar from './components/FridayAvatar.vue'
import ChatArea from './components/ChatArea.vue'
import Composer from './components/Composer.vue'
import QuickActions from './components/QuickActions.vue'
import StatusBar from './components/StatusBar.vue'

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
const showChat = ref(true)
const isElectron = computed(() => typeof window !== 'undefined' && !!window.electronAPI)

const imguiPanel = ref<InstanceType<typeof ImGuiPanel> | null>(null)

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

    if (lower.includes('browser') || lower.includes('open')) {
      response = 'Opening browser...'
      // Could trigger Golden Layout to open a browser tab
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

.app {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.business-ui {
  position: fixed;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 40px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.business-ui > * {
  pointer-events: auto;
}
</style>
