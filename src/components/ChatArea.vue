<template>
  <div class="chat-area" ref="chatRef">
    <div 
      v-for="msg in messages" 
      :key="msg.id" 
      class="message"
      :class="msg.sender"
    >
      <div class="message-avatar">
        {{ msg.sender === 'user' ? '👤' : '🤖' }}
      </div>
      <div class="message-content">
        <div class="message-bubble">{{ msg.text }}</div>
        <div class="message-time">{{ msg.time }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

interface Message {
  id: number
  sender: 'user' | 'friday'
  text: string
  time: string
}

const props = defineProps<{
  messages: Message[]
}>()

const chatRef = ref<HTMLElement | null>(null)

watch(() => props.messages.length, async () => {
  await nextTick()
  if (chatRef.value) {
    chatRef.value.scrollTop = chatRef.value.scrollHeight
  }
})
</script>

<style scoped>
.chat-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.message {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  animation: fadeIn 0.2s ease;
}

.message.user {
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: rgba(0, 122, 255, 0.15);
}

.message.friday .message-avatar {
  background: rgba(52, 199, 89, 0.15);
}

.message-content {
  max-width: 75%;
}

.message-bubble {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.45;
}

.message.user .message-bubble {
  background: #007aff;
  color: #fff;
  border-bottom-right-radius: 6px;
}

.message.friday .message-bubble {
  background: #f0f0f5;
  color: #1d1d1f;
  border-bottom-left-radius: 6px;
}

.message-time {
  font-size: 11px;
  color: #86868b;
  margin-top: 4px;
}

.message.user .message-time {
  text-align: right;
}
</style>
