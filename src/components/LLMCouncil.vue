<template>
  <div class="council-view">
    <div class="council-header">
      <h2>LLM Council</h2>
      <p class="subtitle">Multi-agent discussion system</p>
      <button class="new-topic-btn" @click="showNewTopic = true">
        <PlusIcon class="icon" />
        New Discussion
      </button>
    </div>

    <!-- Active Discussions -->
    <div class="discussions-section">
      <h3>Active Discussions</h3>
      <div class="discussions-list">
        <div
          v-for="topic in activeTopics"
          :key="topic.id"
          class="discussion-card"
          :class="{ active: selectedTopic === topic.id }"
          @click="selectTopic(topic.id)"
        >
          <div class="discussion-icon">💬</div>
          <div class="discussion-info">
            <div class="discussion-title">{{ topic.title }}</div>
            <div class="discussion-meta">
              <span class="status" :class="topic.status">{{ topic.status }}</span>
              <span class="time">{{ formatDate(topic.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Council Members -->
    <div class="members-section">
      <h3>Council Members</h3>
      <div class="members-grid">
        <div
          v-for="member in members"
          :key="member.id"
          class="member-card"
        >
          <div class="member-avatar">{{ member.avatar }}</div>
          <div class="member-info">
            <div class="member-name">{{ member.name }}</div>
            <div class="member-role">{{ member.role }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Discussion View -->
    <div v-if="selectedTopic" class="discussion-view">
      <div class="discussion-header">
        <h3>{{ currentTopic?.title }}</h3>
        <div class="discussion-actions">
          <button class="action-btn" @click="addAgentMessage">Add Message</button>
          <button class="action-btn primary" @click="concludeDiscussion">Conclude</button>
        </div>
      </div>

      <div class="messages-container">
        <div
          v-for="msg in currentMessages"
          :key="msg.id"
          class="message"
          :class="{ own: msg.agentId === 'user' }"
        >
          <div class="message-avatar">{{ getAgentAvatar(msg.agentId) }}</div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-name">{{ getAgentName(msg.agentId) }}</span>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="message-text">{{ msg.content }}</div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <textarea
          v-model="newMessage"
          placeholder="Add your input to the discussion..."
          rows="3"
        ></textarea>
        <button class="send-btn" @click="sendMessage">Send</button>
      </div>
    </div>

    <!-- New Topic Modal -->
    <div v-if="showNewTopic" class="modal-overlay" @click="showNewTopic = false">
      <div class="modal" @click.stop>
        <h3>Start New Discussion</h3>
        
        <div class="form-group">
          <label>Topic</label>
          <input v-model="newTopic.title" placeholder="What should we discuss?" />
        </div>

        <div class="form-group">
          <label>Context</label>
          <textarea v-model="newTopic.context" placeholder="Provide background information..." rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>Select Council Members</label>
          <div class="members-select">
            <div
              v-for="member in members"
              :key="member.id"
              class="member-option"
              :class="{ selected: newTopic.members.includes(member.id) }"
              @click="toggleMember(member.id)"
            >
              <span class="option-avatar">{{ member.avatar }}</span>
              <span class="option-name">{{ member.name }}</span>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showNewTopic = false">Cancel</button>
          <button class="confirm-btn" @click="startDiscussion">Start Discussion</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { llmCouncil } from '../modules/llm-council'

const showNewTopic = ref(false)
const selectedTopic = ref<string | null>(null)
const newMessage = ref('')

const newTopic = ref({
  title: '',
  context: '',
  members: ['strategist', 'researcher', 'advisor']
})

const members = llmCouncil.getMembers()

const activeTopics = ref([
  {
    id: '1',
    title: 'Q4 Business Strategy',
    status: 'discussing',
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Product Launch Planning',
    status: 'discussing',
    createdAt: new Date(Date.now() - 86400000)
  }
])

const currentTopic = computed(() => 
  activeTopics.value.find(t => t.id === selectedTopic.value)
)

const currentMessages = ref([
  {
    id: '1',
    agentId: 'strategist',
    content: 'Based on my analysis, we should focus on three key areas for Q4...',
    timestamp: new Date(),
    type: 'statement' as const
  },
  {
    id: '2',
    agentId: 'researcher',
    content: 'The market data supports this approach. Our competitors are...',
    timestamp: new Date(),
    type: 'statement' as const
  },
  {
    id: '3',
    agentId: 'analyst',
    content: 'From a financial perspective, the ROI looks promising...',
    timestamp: new Date(),
    type: 'statement' as const
  }
])

function selectTopic(id: string) {
  selectedTopic.value = id
}

function getAgentAvatar(agentId: string): string {
  const member = members.find(m => m.id === agentId)
  return member?.avatar || '👤'
}

function getAgentName(agentId: string): string {
  const member = members.find(m => m.id === agentId)
  return member?.name || 'User'
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

function toggleMember(memberId: string) {
  const index = newTopic.value.members.indexOf(memberId)
  if (index > -1) {
    newTopic.value.members.splice(index, 1)
  } else {
    newTopic.value.members.push(memberId)
  }
}

async function startDiscussion() {
  if (!newTopic.value.title) return

  const topic = await llmCouncil.startDiscussion(
    newTopic.value.title,
    newTopic.value.context
  )

  activeTopics.value.unshift({
    id: topic.id,
    title: topic.title,
    status: topic.status,
    createdAt: topic.createdAt
  })

  showNewTopic.value = false
  selectedTopic.value = topic.id
  newTopic.value = { title: '', context: '', members: ['strategist', 'researcher', 'advisor'] }
}

async function addAgentMessage() {
  if (!selectedTopic.value) return

  // Simulate agent response
  const agentIds = ['strategist', 'researcher', 'creative', 'analyst', 'advisor']
  const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)]

  const message = {
    id: `msg_${Date.now()}`,
    agentId: randomAgent,
    content: `Based on the discussion, I believe we should consider...`,
    timestamp: new Date(),
    type: 'statement' as const
  }

  currentMessages.value.push(message)
}

function sendMessage() {
  if (!newMessage.value.trim()) return

  currentMessages.value.push({
    id: `msg_${Date.now()}`,
    agentId: 'user',
    content: newMessage.value,
    timestamp: new Date(),
    type: 'statement' as const
  })

  newMessage.value = ''

  // Trigger agent response
  setTimeout(() => addAgentMessage(), 1000)
}

async function concludeDiscussion() {
  if (!selectedTopic.value) return

  const conclusion = await llmCouncil.concludeDiscussion(selectedTopic.value)
  
  currentMessages.value.push({
    id: `msg_${Date.now()}`,
    agentId: 'advisor',
    content: `📋 CONCLUSION: ${conclusion}`,
    timestamp: new Date(),
    type: 'statement' as const
  })

  const topic = activeTopics.value.find(t => t.id === selectedTopic.value)
  if (topic) topic.status = 'concluded'
}
</script>

<style scoped>
.council-view {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.council-header {
  margin-bottom: 24px;
}

.council-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 4px;
}

.subtitle {
  font-size: 13px;
  color: rgba(150, 170, 200, 0.5);
  margin-bottom: 16px;
}

.new-topic-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 8px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 13px;
}

.icon {
  width: 16px;
  height: 16px;
}

/* Sections */
.discussions-section, .members-section {
  margin-bottom: 24px;
}

.discussions-section h3, .members-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 12px;
}

/* Discussions */
.discussions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.discussion-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.discussion-card:hover {
  background: rgba(0, 200, 255, 0.05);
}

.discussion-card.active {
  border-color: #00d4ff;
  background: rgba(0, 200, 255, 0.1);
}

.discussion-icon {
  font-size: 20px;
}

.discussion-info {
  flex: 1;
}

.discussion-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
}

.discussion-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
  font-size: 11px;
}

.status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

.status.discussing {
  background: rgba(0, 200, 255, 0.15);
  color: #00d4ff;
}

.status.concluded {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.time {
  color: rgba(150, 170, 200, 0.4);
}

/* Members */
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
}

.member-avatar {
  font-size: 20px;
}

.member-name {
  font-size: 12px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
}

.member-role {
  font-size: 10px;
  color: rgba(150, 170, 200, 0.5);
}

/* Discussion View */
.discussion-view {
  margin-top: 24px;
  border-top: 1px solid rgba(0, 200, 255, 0.1);
  padding-top: 24px;
}

.discussion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.discussion-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.discussion-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.7);
  cursor: pointer;
  font-size: 12px;
}

.action-btn.primary {
  background: rgba(0, 200, 255, 0.15);
  border-color: rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

/* Messages */
.messages-container {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.message {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.message.own {
  flex-direction: row-reverse;
  background: rgba(0, 200, 255, 0.05);
}

.message-avatar {
  font-size: 20px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.message-content {
  flex: 1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.message-name {
  font-size: 12px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.message-time {
  font-size: 10px;
  color: rgba(150, 170, 200, 0.4);
}

.message-text {
  font-size: 13px;
  color: rgba(200, 220, 255, 0.8);
  line-height: 1.5;
}

/* Input */
.input-area {
  display: flex;
  gap: 12px;
}

.input-area textarea {
  flex: 1;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 8px;
  color: rgba(200, 220, 255, 0.9);
  font-size: 13px;
  resize: none;
}

.send-btn {
  padding: 12px 24px;
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 8px;
  color: #00d4ff;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: rgba(10, 15, 25, 0.98);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  width: 500px;
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 8px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.9);
  font-size: 13px;
}

.members-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
}

.member-option.selected {
  background: rgba(0, 200, 255, 0.15);
  border-color: #00d4ff;
}

.option-avatar {
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.cancel-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.9);
  cursor: pointer;
}

.confirm-btn {
  padding: 10px 20px;
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 6px;
  color: #00d4ff;
  cursor: pointer;
}
</style>
