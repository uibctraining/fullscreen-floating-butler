<template>
  <div class="beginner-mode" v-if="isActive">
    <!-- Simplified Header -->
    <header class="beginner-header">
      <div class="logo">
        <div class="logo-icon">99</div>
        <span class="logo-text">99Pages</span>
      </div>
      <button class="mode-switch" @click="switchToAdvanced">
        ⚙️ Advanced Mode
      </button>
    </header>

    <!-- Main Content -->
    <div class="beginner-content">
      <!-- Welcome Message -->
      <div class="welcome-section" v-if="showWelcome">
        <div class="welcome-avatar">🤖</div>
        <h1 class="welcome-title">Hello! I'm Friday</h1>
        <p class="welcome-desc">Your AI assistant. How can I help you today?</p>
        
        <div class="welcome-actions">
          <button class="action-btn primary" @click="startVoice">
            🎤 Speak to me
          </button>
          <button class="action-btn secondary" @click="showInput = true">
            ✍️ Type a message
          </button>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="chat-area" v-if="!showWelcome">
        <div 
          v-for="msg in messages" 
          :key="msg.id"
          class="message"
          :class="msg.sender"
        >
          <div class="message-avatar">
            {{ msg.sender === 'user' ? '👤' : '🤖' }}
          </div>
          <div class="message-bubble">
            {{ msg.text }}
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="quick-btn" @click="quickAction('email')">
          📧 Email
        </button>
        <button class="quick-btn" @click="quickAction('calendar')">
          📅 Calendar
        </button>
        <button class="quick-btn" @click="quickAction('files')">
          📁 Files
        </button>
        <button class="quick-btn" @click="quickAction('help')">
          ❓ Help
        </button>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <button class="mic-btn" :class="{ active: isListening }" @click="toggleVoice">
          🎤
        </button>
        <input 
          v-if="showInput"
          v-model="inputText"
          class="text-input"
          placeholder="Type your message..."
          @keydown.enter="sendMessage"
        />
        <button class="send-btn" @click="sendMessage" v-if="showInput">
          ↑
        </button>
      </div>
    </div>

    <!-- Help Button -->
    <button class="help-fab" @click="showHelp">
      ❓
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'switch-mode'): void
}>()

const isActive = ref(true)
const showWelcome = ref(true)
const showInput = ref(false)
const isListening = ref(false)
const inputText = ref('')

interface Message {
  id: number
  sender: 'user' | 'friday'
  text: string
}

const messages = ref<Message[]>([])

function switchToAdvanced() {
  isActive.value = false
  emit('switch-mode')
}

function startVoice() {
  isListening.value = true
  showWelcome.value = false
  
  // Simulate voice recognition
  setTimeout(() => {
    isListening.value = false
    addMessage('user', 'Hello, can you help me?')
    
    setTimeout(() => {
      addMessage('friday', "Of course! I'm here to help. What would you like to do?")
    }, 500)
  }, 2000)
}

function toggleVoice() {
  isListening.value = !isListening.value
  
  if (isListening.value) {
    // Start listening
    setTimeout(() => {
      isListening.value = false
      addMessage('user', 'Check my email')
      
      setTimeout(() => {
        addMessage('friday', 'Checking your inbox... You have 3 unread emails.')
      }, 500)
    }, 2000)
  }
}

function sendMessage() {
  if (!inputText.value.trim()) return
  
  addMessage('user', inputText.value)
  inputText.value = ''
  
  // Simulate response
  setTimeout(() => {
    addMessage('friday', "I'll help you with that right away!")
  }, 800)
}

function addMessage(sender: 'user' | 'friday', text: string) {
  messages.value.push({
    id: Date.now(),
    sender,
    text
  })
}

function quickAction(action: string) {
  showWelcome.value = false
  
  const actions: Record<string, string> = {
    email: 'Check my email',
    calendar: 'Show my calendar',
    files: 'Open file manager',
    help: 'I need help'
  }
  
  addMessage('user', actions[action] || action)
  
  setTimeout(() => {
    const responses: Record<string, string> = {
      email: 'Checking your inbox... You have 3 unread emails.',
      calendar: 'You have 2 meetings today.',
      files: 'Opening file manager...',
      help: 'I can help you with emails, calendar, files, and more. Just ask!'
    }
    addMessage('friday', responses[action] || 'How can I help?')
  }, 800)
}

function showHelp() {
  addMessage('friday', 'Here are some things I can help you with:\n• 📧 Check email\n• 📅 View calendar\n• 📁 Manage files\n• 🔍 Search the web\n• 🌐 Translate languages\n\nJust ask me anything!')
}

onMounted(() => {
  // Check if first time user
  const firstTime = localStorage.getItem('first_time_user')
  if (firstTime === null) {
    showWelcome.value = true
    localStorage.setItem('first_time_user', 'false')
  } else {
    showWelcome.value = false
  }
})
</script>

<style scoped>
.beginner-mode {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0a1628 0%, #0d1b2a 100%);
  color: #fff;
}

.beginner-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #00d4ff, #0088ff);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
}

.mode-switch {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(200, 220, 255, 0.7);
  cursor: pointer;
  font-size: 13px;
}

.mode-switch:hover {
  background: rgba(255, 255, 255, 0.15);
}

.beginner-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  overflow: hidden;
}

/* Welcome Section */
.welcome-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.welcome-avatar {
  font-size: 64px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #fff, #00d4ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome-desc {
  font-size: 18px;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 32px;
}

.welcome-actions {
  display: flex;
  gap: 16px;
}

.action-btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: linear-gradient(135deg, #00d4ff, #0088ff);
  border: none;
  color: #fff;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
}

.action-btn.secondary {
  background: transparent;
  border: 2px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

.action-btn.secondary:hover {
  background: rgba(0, 200, 255, 0.1);
}

/* Chat Area */
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 200, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.5;
}

.message.assistant .message-bubble {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.1);
}

.message.user .message-bubble {
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  overflow-x: auto;
}

.quick-btn {
  padding: 12px 20px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 24px;
  color: #00d4ff;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: rgba(0, 200, 255, 0.2);
  transform: translateY(-2px);
}

/* Input Area */
.input-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
}

.mic-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 200, 255, 0.15);
  border: 2px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
}

.mic-btn:hover {
  background: rgba(0, 200, 255, 0.25);
}

.mic-btn.active {
  background: rgba(255, 59, 48, 0.15);
  border-color: rgba(255, 59, 48, 0.3);
  color: #ff3b30;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.text-input {
  flex: 1;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 28px;
  color: #fff;
  font-size: 16px;
  outline: none;
}

.text-input:focus {
  border-color: #00d4ff;
}

.text-input::placeholder {
  color: rgba(150, 170, 200, 0.4);
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #00d4ff;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.send-btn:hover {
  background: #00b8d9;
  transform: scale(1.05);
}

/* Help FAB */
.help-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(0, 200, 255, 0.15);
  border: 2px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 100;
}

.help-fab:hover {
  background: rgba(0, 200, 255, 0.25);
  transform: scale(1.1);
}
</style>
