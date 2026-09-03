<template>
  <div class="mcp-manager">
    <div class="mcp-header">
      <h2>MCP Tools Manager</h2>
      <button class="add-btn" @click="showAddModal = true">
        <PlusIcon class="icon" />
        Add Custom MCP
      </button>
    </div>

    <!-- Stats -->
    <div class="mcp-stats">
      <div class="stat-card">
        <span class="stat-value">{{ totalMCPs }}</span>
        <span class="stat-label">Total MCPs</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ activeMCPs }}</span>
        <span class="stat-label">Active</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ customMCPs }}</span>
        <span class="stat-label">Custom</span>
      </div>
    </div>

    <!-- Category Filter -->
    <div class="category-filter">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="filter-btn"
        :class="{ active: selectedCategory === cat.id }"
        @click="selectedCategory = cat.id"
      >
        <span class="cat-icon">{{ cat.icon }}</span>
        <span>{{ cat.name }}</span>
      </button>
    </div>

    <!-- MCP List -->
    <div class="mcp-list">
      <div
        v-for="mcp in filteredMCPs"
        :key="mcp.id"
        class="mcp-card"
        :class="{ active: mcp.isActive, custom: mcp.isCustom }"
      >
        <div class="mcp-icon">{{ mcp.icon }}</div>
        <div class="mcp-info">
          <div class="mcp-name">{{ mcp.name }}</div>
          <div class="mcp-desc">{{ mcp.description }}</div>
          <div class="mcp-meta">
            <span class="mcp-category">{{ mcp.category }}</span>
            <span class="mcp-usage">{{ mcp.usageCount }} uses</span>
          </div>
        </div>
        <div class="mcp-actions">
          <button
            class="toggle-btn"
            :class="{ active: mcp.isActive }"
            @click="toggleMCP(mcp)"
          >
            {{ mcp.isActive ? 'Active' : 'Inactive' }}
          </button>
          <button v-if="mcp.isCustom" class="delete-btn" @click="deleteMCP(mcp)">
            <TrashIcon class="icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Add MCP Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal" @click.stop>
        <h3>Add Custom MCP</h3>
        <p class="modal-desc">Describe what you want to do, and the Agent will generate the MCP configuration for you.</p>

        <div class="form-group">
          <label>What do you want to do?</label>
          <textarea
            v-model="newMCPIntent"
            placeholder="Example: I want to monitor my website uptime and get alerts when it goes down"
            rows="4"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Name (optional)</label>
          <input v-model="newMCPName" placeholder="Example: Website Monitor" />
        </div>

        <div class="form-group">
          <label>Category</label>
          <select v-model="newMCPCategory">
            <option value="integration">Integration</option>
            <option value="automation">Automation</option>
            <option value="monitoring">Monitoring</option>
            <option value="data">Data</option>
            <option value="communication">Communication</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showAddModal = false">Cancel</button>
          <button class="confirm-btn" @click="generateMCP" :disabled="!newMCPIntent">
            <SparklesIcon class="icon" />
            Generate with Agent
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PlusIcon, TrashIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import { customMCPManager } from '../modules/custom-mcp-manager'

interface MCP {
  id: string
  name: string
  description: string
  category: string
  icon: string
  isActive: boolean
  isCustom: boolean
  usageCount: number
}

const showAddModal = ref(false)
const newMCPIntent = ref('')
const newMCPName = ref('')
const newMCPCategory = ref('custom')
const selectedCategory = ref('all')

// Built-in MCPs
const builtInMCPs: MCP[] = [
  { id: 'google-drive', name: 'Google Drive', description: 'File storage and sharing', category: 'storage', icon: '📁', isActive: true, isCustom: false, usageCount: 45 },
  { id: 'airtable', name: 'Airtable', description: 'Database and spreadsheets', category: 'data', icon: '📊', isActive: true, isCustom: false, usageCount: 32 },
  { id: 'notion', name: 'Notion', description: 'Notes and documentation', category: 'productivity', icon: '📝', isActive: true, isCustom: false, usageCount: 28 },
  { id: 'zoom', name: 'Zoom', description: 'Video conferencing', category: 'communication', icon: '📹', isActive: true, isCustom: false, usageCount: 15 },
  { id: 'canva', name: 'Canva', description: 'Design and graphics', category: 'creative', icon: '🎨', isActive: true, isCustom: false, usageCount: 22 },
  { id: 'github', name: 'GitHub', description: 'Code repository', category: 'development', icon: '🐙', isActive: true, isCustom: false, usageCount: 56 },
  { id: 'stripe', name: 'Stripe', description: 'Payment processing', category: 'finance', icon: '💳', isActive: true, isCustom: false, usageCount: 18 },
  { id: 'mailchimp', name: 'Mailchimp', description: 'Email marketing', category: 'marketing', icon: '🐵', isActive: true, isCustom: false, usageCount: 12 },
]

// Custom MCPs from manager
const customMCPsList = computed(() => {
  return customMCPManager.getCapabilities().map(cap => ({
    id: cap.id,
    name: cap.name,
    description: cap.description,
    category: cap.category,
    icon: cap.icon,
    isActive: cap.isActive,
    isCustom: true,
    usageCount: cap.usageCount
  }))
})

const allMCPs = computed(() => [...builtInMCPs, ...customMCPsList.value])

const categories = [
  { id: 'all', name: 'All', icon: '📦' },
  { id: 'productivity', name: 'Productivity', icon: '⚡' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'creative', name: 'Creative', icon: '🎨' },
  { id: 'data', name: 'Data', icon: '📊' },
  { id: 'storage', name: 'Storage', icon: '📁' },
  { id: 'development', name: 'Development', icon: '💻' },
  { id: 'finance', name: 'Finance', icon: '💰' },
  { id: 'marketing', name: 'Marketing', icon: '📢' },
  { id: 'custom', name: 'Custom', icon: '⚡' },
]

const filteredMCPs = computed(() => {
  if (selectedCategory.value === 'all') return allMCPs.value
  return allMCPs.value.filter(m => m.category === selectedCategory.value)
})

const totalMCPs = computed(() => allMCPs.value.length)
const activeMCPs = computed(() => allMCPs.value.filter(m => m.isActive).length)
const customMCPs = computed(() => customMCPsList.value.length)

function toggleMCP(mcp: MCP) {
  if (mcp.isCustom) {
    customMCPManager.toggleCapability(mcp.id)
  }
}

function deleteMCP(mcp: MCP) {
  if (confirm(`Delete ${mcp.name}?`)) {
    customMCPManager.deleteCapability(mcp.id)
  }
}

async function generateMCP() {
  if (!newMCPIntent.value) return

  await customMCPManager.generateMCP({
    userIntent: newMCPIntent.value,
    suggestedName: newMCPName.value || undefined,
    category: newMCPCategory.value
  })

  showAddModal.value = false
  newMCPIntent.value = ''
  newMCPName.value = ''
  newMCPCategory.value = 'custom'
}
</script>

<style scoped>
.mcp-manager {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.mcp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.mcp-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.add-btn {
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

.add-btn:hover {
  background: rgba(0, 200, 255, 0.25);
}

.icon {
  width: 16px;
  height: 16px;
}

/* Stats */
.mcp-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
}

.stat-label {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
}

/* Category Filter */
.category-filter {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 20px;
  color: rgba(150, 170, 200, 0.7);
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.filter-btn:hover {
  background: rgba(0, 200, 255, 0.1);
}

.filter-btn.active {
  background: rgba(0, 200, 255, 0.15);
  border-color: #00d4ff;
  color: #00d4ff;
}

.cat-icon {
  font-size: 14px;
}

/* MCP List */
.mcp-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mcp-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  transition: all 0.2s;
}

.mcp-card:hover {
  background: rgba(255, 255, 255, 0.05);
}

.mcp-card.custom {
  border-left: 3px solid #00d4ff;
}

.mcp-icon {
  font-size: 24px;
  width: 40px;
  text-align: center;
}

.mcp-info {
  flex: 1;
}

.mcp-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
}

.mcp-desc {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
  margin-top: 2px;
}

.mcp-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.mcp-category {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(0, 200, 255, 0.1);
  border-radius: 10px;
  color: #00d4ff;
}

.mcp-usage {
  font-size: 10px;
  color: rgba(150, 170, 200, 0.4);
}

.mcp-actions {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(150, 170, 200, 0.7);
}

.toggle-btn.active {
  background: rgba(52, 199, 89, 0.15);
  border-color: rgba(52, 199, 89, 0.3);
  color: #34c759;
}

.delete-btn {
  padding: 6px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 6px;
  color: #ff3b30;
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
  margin-bottom: 8px;
}

.modal-desc {
  font-size: 13px;
  color: rgba(150, 170, 200, 0.7);
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

.form-group textarea,
.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.9);
  font-size: 13px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 6px;
  color: #00d4ff;
  cursor: pointer;
}

.confirm-btn:hover {
  background: rgba(0, 200, 255, 0.25);
}
</style>
