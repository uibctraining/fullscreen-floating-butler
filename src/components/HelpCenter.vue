<template>
  <div class="help-center" v-if="visible">
    <div class="help-header">
      <h2>Help Center</h2>
      <button class="close-btn" @click="$emit('close')">
        <XMarkIcon class="icon" />
      </button>
    </div>

    <div class="help-content">
      <!-- Search -->
      <div class="help-search">
        <MagnifyingGlassIcon class="search-icon" />
        <input 
          v-model="searchQuery" 
          placeholder="Search for help..."
          class="search-input"
        />
      </div>

      <!-- Quick Start -->
      <div class="help-section">
        <h3>Quick Start</h3>
        <div class="help-cards">
          <div class="help-card" @click="openGuide('getting-started')">
            <div class="card-icon">🚀</div>
            <div class="card-title">Getting Started</div>
            <div class="card-desc">Learn the basics in 5 minutes</div>
          </div>
          <div class="help-card" @click="openGuide('voice-control')">
            <div class="card-icon">🎤</div>
            <div class="card-title">Voice Control</div>
            <div class="card-desc">How to use voice commands</div>
          </div>
          <div class="help-card" @click="openGuide('mcp-tools')">
            <div class="card-icon">🔧</div>
            <div class="card-title">MCP Tools</div>
            <div class="card-desc">Explore 99 powerful tools</div>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="help-section">
        <h3>Frequently Asked Questions</h3>
        <div class="faq-list">
          <div 
            v-for="(faq, index) in filteredFaqs" 
            :key="index"
            class="faq-item"
            :class="{ expanded: expandedFaq === index }"
          >
            <div class="faq-question" @click="toggleFaq(index)">
              <span>{{ faq.question }}</span>
              <ChevronDownIcon class="faq-icon" :class="{ rotated: expandedFaq === index }" />
            </div>
            <div class="faq-answer" v-if="expandedFaq === index">
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Guides -->
      <div class="help-section">
        <h3>Guides</h3>
        <div class="guide-list">
          <div 
            v-for="guide in guides" 
            :key="guide.id"
            class="guide-item"
            @click="openGuide(guide.id)"
          >
            <div class="guide-icon">{{ guide.icon }}</div>
            <div class="guide-info">
              <div class="guide-title">{{ guide.title }}</div>
              <div class="guide-desc">{{ guide.description }}</div>
            </div>
            <ChevronRightIcon class="guide-arrow" />
          </div>
        </div>
      </div>

      <!-- Contact -->
      <div class="help-section">
        <h3>Need More Help?</h3>
        <div class="contact-options">
          <a href="mailto:support@99pages.uk" class="contact-btn">
            <EnvelopeIcon class="contact-icon" />
            <span>Email Support</span>
          </a>
          <a href="https://github.com/uibctraining" target="_blank" class="contact-btn">
            <CodeBracketIcon class="contact-icon" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  XMarkIcon, 
  MagnifyingGlassIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  EnvelopeIcon,
  CodeBracketIcon
} from '@heroicons/vue/24/outline'

defineEmits(['close'])

const visible = ref(true)
const searchQuery = ref('')
const expandedFaq = ref<number | null>(null)

const faqs = [
  {
    question: 'How do I start a conversation?',
    answer: 'Simply type your message in the composer at the bottom of the screen, or click the microphone button to use voice input. Press Enter or click the send button to send your message.'
  },
  {
    question: 'How do I use voice control?',
    answer: 'Click the microphone button in the composer to start listening. Speak clearly and the AI will transcribe your speech. Click again to stop listening.'
  },
  {
    question: 'What are MCP tools?',
    answer: 'MCP (Model Context Protocol) tools are integrations with external services like Google Drive, Slack, and more. You can access them from the sidebar under "MCP Tools".'
  },
  {
    question: 'How do I save my work?',
    answer: 'Your conversations are automatically saved. You can also use Ctrl+S to save the current layout of your panels.'
  },
  {
    question: 'Can I use this offline?',
    answer: 'Some features work offline, but most AI capabilities require an internet connection. The app will notify you when offline.'
  },
  {
    question: 'How do I customize the interface?',
    answer: 'Go to Settings from the sidebar to customize theme, language, and other preferences. You can also drag and resize panels.'
  }
]

const guides = [
  { id: 'getting-started', icon: '🚀', title: 'Getting Started', description: 'Learn the basics of 99Pages' },
  { id: 'voice-control', icon: '🎤', title: 'Voice Control', description: 'Master voice commands' },
  { id: 'mcp-tools', icon: '🔧', title: 'MCP Tools', description: 'Explore 99 integrations' },
  { id: 'council', icon: '🤖', title: 'LLM Council', description: 'Multi-agent discussions' },
  { id: 'social-media', icon: '📱', title: 'Social Media', description: 'Manage your accounts' },
  { id: 'shortcuts', icon: '⌨️', title: 'Keyboard Shortcuts', description: 'Speed up your workflow' }
]

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs
  const query = searchQuery.value.toLowerCase()
  return faqs.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  )
})

function toggleFaq(index: number) {
  expandedFaq.value = expandedFaq.value === index ? null : index
}

function openGuide(guideId: string) {
  // Open guide in new tab or modal
  console.log('Opening guide:', guideId)
}
</script>

<style scoped>
.help-center {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: rgba(10, 15, 25, 0.98);
  border-left: 1px solid rgba(0, 200, 255, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.help-header h2 {
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

.icon {
  width: 20px;
  height: 20px;
}

.help-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.help-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 8px;
  margin-bottom: 20px;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: rgba(150, 170, 200, 0.5);
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  color: rgba(200, 220, 255, 0.9);
  font-size: 13px;
  outline: none;
}

.search-input::placeholder {
  color: rgba(150, 170, 200, 0.4);
}

.help-section {
  margin-bottom: 24px;
}

.help-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 200, 255, 0.8);
  margin-bottom: 12px;
}

.help-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.help-card {
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
}

.help-card:hover {
  background: rgba(0, 200, 255, 0.05);
  border-color: rgba(0, 200, 255, 0.3);
}

.card-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.card-title {
  font-size: 12px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 10px;
  color: rgba(150, 170, 200, 0.5);
}

/* FAQ */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.faq-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 13px;
  color: rgba(200, 220, 255, 0.9);
}

.faq-question:hover {
  background: rgba(0, 200, 255, 0.05);
}

.faq-icon {
  width: 16px;
  height: 16px;
  color: rgba(150, 170, 200, 0.5);
  transition: transform 0.2s;
}

.faq-icon.rotated {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 16px 12px;
  font-size: 12px;
  color: rgba(150, 170, 200, 0.7);
  line-height: 1.5;
}

/* Guides */
.guide-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.guide-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.guide-item:hover {
  background: rgba(0, 200, 255, 0.05);
  border-color: rgba(0, 200, 255, 0.3);
}

.guide-icon {
  font-size: 20px;
}

.guide-info {
  flex: 1;
}

.guide-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
}

.guide-desc {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.5);
}

.guide-arrow {
  width: 16px;
  height: 16px;
  color: rgba(150, 170, 200, 0.3);
}

/* Contact */
.contact-options {
  display: flex;
  gap: 12px;
}

.contact-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 8px;
  color: #00d4ff;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
}

.contact-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

.contact-icon {
  width: 16px;
  height: 16px;
}
</style>
