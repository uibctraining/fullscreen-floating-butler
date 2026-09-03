<template>
  <div class="local-terminal">
    <div class="terminal-header">
      <div class="terminal-title">
        <span class="terminal-icon">⬛</span>
        <span>Local Terminal</span>
        <span class="terminal-status" :class="{ connected: isConnected }">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>
      <div class="terminal-actions">
        <button class="action-btn" @click="connectTerminal" v-if="!isConnected">
          Connect
        </button>
        <button class="action-btn" @click="disconnectTerminal" v-else>
          Disconnect
        </button>
        <button class="action-btn" @click="clearTerminal">Clear</button>
      </div>
    </div>

    <div class="terminal-body" ref="terminalRef">
      <div 
        v-for="(line, index) in outputLines" 
        :key="index"
        class="terminal-line"
        :class="line.type"
      >
        <span class="line-prompt" v-if="line.type === 'input'">$</span>
        <span class="line-content">{{ line.content }}</span>
      </div>
    </div>

    <div class="terminal-input">
      <span class="input-prompt">$</span>
      <input 
        v-model="currentInput"
        class="input-field"
        placeholder="Type a command..."
        @keydown.enter="executeCommand"
        @keydown.up="historyUp"
        @keydown.down="historyDown"
        :disabled="!isConnected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'system'
  content: string
}

const terminalRef = ref<HTMLElement | null>(null)
const isConnected = ref(false)
const currentInput = ref('')
const outputLines = ref<TerminalLine[]>([
  { type: 'system', content: 'Welcome to 99Pages Local Terminal' },
  { type: 'system', content: 'Click "Connect" to connect to your local device' }
])

const commandHistory = ref<string[]>([])
const historyIndex = ref(-1)

// WebSocket connection for local terminal
let ws: WebSocket | null = null

function connectTerminal() {
  // Connect to local terminal via WebSocket
  // This connects to a local agent running on the user's device
  try {
    ws = new WebSocket('ws://localhost:8765/terminal')
    
    ws.onopen = () => {
      isConnected.value = true
      addLine('system', 'Connected to local device')
    }
    
    ws.onmessage = (event) => {
      addLine('output', event.data)
    }
    
    ws.onerror = () => {
      addLine('error', 'Connection failed. Make sure the local agent is running.')
    }
    
    ws.onclose = () => {
      isConnected.value = false
      addLine('system', 'Disconnected from local device')
    }
  } catch (error) {
    addLine('error', 'Failed to connect. Make sure the local agent is running.')
  }
}

function disconnectTerminal() {
  if (ws) {
    ws.close()
    ws = null
  }
  isConnected.value = false
}

function executeCommand() {
  const command = currentInput.value.trim()
  if (!command) return
  
  addLine('input', command)
  commandHistory.value.push(command)
  historyIndex.value = commandHistory.value.length
  
  // Send command to local terminal
  if (ws && isConnected.value) {
    ws.send(command)
  } else {
    // Simulate local commands
    simulateCommand(command)
  }
  
  currentInput.value = ''
}

function simulateCommand(command: string) {
  const responses: Record<string, string> = {
    'help': 'Available commands: help, clear, date, echo, ls, pwd, whoami',
    'clear': 'CLEAR',
    'date': new Date().toLocaleString(),
    'whoami': 'user@99pages-os',
    'pwd': '/home/user',
    'ls': 'Documents  Downloads  Pictures  Music  Videos  Projects',
    'echo': command.substring(5) || ''
  }
  
  const cmd = command.split(' ')[0]
  
  if (cmd === 'clear') {
    outputLines.value = []
  } else if (responses[cmd]) {
    addLine('output', responses[cmd])
  } else {
    addLine('error', `Command not found: ${cmd}`)
  }
}

function addLine(type: TerminalLine['type'], content: string) {
  outputLines.value.push({ type, content })
  
  // Auto-scroll to bottom
  setTimeout(() => {
    if (terminalRef.value) {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight
    }
  }, 50)
}

function clearTerminal() {
  outputLines.value = []
}

function historyUp() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    currentInput.value = commandHistory.value[historyIndex.value]
  }
}

function historyDown() {
  if (historyIndex.value < commandHistory.value.length - 1) {
    historyIndex.value++
    currentInput.value = commandHistory.value[historyIndex.value]
  } else {
    historyIndex.value = commandHistory.value.length
    currentInput.value = ''
  }
}

onUnmounted(() => {
  disconnectTerminal()
})
</script>

<style scoped>
.local-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #0a0a0a;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.terminal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.terminal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(200, 220, 255, 0.7);
}

.terminal-icon {
  font-size: 14px;
}

.terminal-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
}

.terminal-status.connected {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.terminal-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 10px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 4px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 11px;
}

.action-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

.terminal-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
}

.terminal-line {
  margin-bottom: 2px;
}

.line-prompt {
  color: #00d4ff;
  margin-right: 8px;
}

.line-content {
  color: rgba(200, 220, 255, 0.8);
}

.terminal-line.input .line-content {
  color: #fff;
}

.terminal-line.output .line-content {
  color: rgba(200, 220, 255, 0.7);
}

.terminal-line.error .line-content {
  color: #ff3b30;
}

.terminal-line.system .line-content {
  color: rgba(150, 170, 200, 0.5);
  font-style: italic;
}

.terminal-input {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(0, 200, 255, 0.1);
}

.input-prompt {
  color: #00d4ff;
  margin-right: 8px;
  font-size: 13px;
}

.input-field {
  flex: 1;
  background: none;
  border: none;
  color: #fff;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 13px;
  outline: none;
}

.input-field::placeholder {
  color: rgba(150, 170, 200, 0.3);
}

.input-field:disabled {
  opacity: 0.5;
}
</style>
