<template>
  <div class="social-manager">
    <div class="social-header">
      <h2>Social Media Manager</h2>
      <div class="header-actions">
        <button class="create-btn" @click="showCreatePost = true">
          <PlusIcon class="icon" />
          Create Post
        </button>
        <button class="create-btn secondary" @click="showCreateAd = true">
          <MegaphoneIcon class="icon" />
          Create Ad
        </button>
      </div>
    </div>

    <!-- Connected Accounts -->
    <div class="accounts-section">
      <h3>Connected Accounts</h3>
      <div class="accounts-grid">
        <div
          v-for="account in accounts"
          :key="account.id"
          class="account-card"
          :class="{ active: account.isActive }"
        >
          <div class="account-icon">{{ getPlatformIcon(account.platform) }}</div>
          <div class="account-info">
            <div class="account-name">{{ account.displayName }}</div>
            <div class="account-handle">@{{ account.username }}</div>
            <div class="account-stats">
              <span>{{ account.followers }} followers</span>
            </div>
          </div>
          <div class="account-status">
            <span class="status-dot" :class="{ active: account.isActive }"></span>
          </div>
        </div>
        
        <button class="account-card add-account" @click="showConnectModal = true">
          <PlusIcon class="add-icon" />
          <span>Connect Account</span>
        </button>
      </div>
    </div>

    <!-- Recent Posts -->
    <div class="posts-section">
      <h3>Recent Posts</h3>
      <div class="posts-list">
        <div
          v-for="post in recentPosts"
          :key="post.id"
          class="post-card"
        >
          <div class="post-platform">{{ getPlatformIcon(post.platform) }}</div>
          <div class="post-content">
            <div class="post-text">{{ post.content }}</div>
            <div class="post-meta">
              <span class="post-status" :class="post.status">{{ post.status }}</span>
              <span class="post-date">{{ formatDate(post.publishedAt || post.scheduledAt) }}</span>
            </div>
            <div v-if="post.metrics" class="post-metrics">
              <span>❤️ {{ post.metrics.likes }}</span>
              <span>💬 {{ post.metrics.comments }}</span>
              <span>🔄 {{ post.metrics.shares }}</span>
              <span>👁️ {{ post.metrics.views }}</span>
            </div>
          </div>
          <div class="post-actions">
            <button class="action-btn" @click="editPost(post)">Edit</button>
            <button class="action-btn delete" @click="deletePost(post.id)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Ad Campaigns -->
    <div class="campaigns-section">
      <h3>Ad Campaigns</h3>
      <div class="campaigns-list">
        <div
          v-for="campaign in campaigns"
          :key="campaign.id"
          class="campaign-card"
        >
          <div class="campaign-platform">{{ getPlatformIcon(campaign.platform) }}</div>
          <div class="campaign-info">
            <div class="campaign-name">{{ campaign.name }}</div>
            <div class="campaign-objective">{{ campaign.objective }}</div>
            <div class="campaign-budget">
              ${{ campaign.budget.daily }}/day · ${{ campaign.budget.total }} total
            </div>
          </div>
          <div class="campaign-status">
            <span class="status-badge" :class="campaign.status">{{ campaign.status }}</span>
          </div>
          <div class="campaign-actions">
            <button v-if="campaign.status === 'draft'" class="action-btn" @click="launchCampaign(campaign.id)">
              Launch
            </button>
            <button v-if="campaign.status === 'active'" class="action-btn pause" @click="pauseCampaign(campaign.id)">
              Pause
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Post Modal -->
    <div v-if="showCreatePost" class="modal-overlay" @click="showCreatePost = false">
      <div class="modal" @click.stop>
        <h3>Create Post</h3>
        
        <div class="form-group">
          <label>Platform</label>
          <select v-model="newPost.platform">
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter/X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>

        <div class="form-group">
          <label>Content</label>
          <textarea v-model="newPost.content" placeholder="What's on your mind?" rows="4"></textarea>
        </div>

        <div class="form-group">
          <label>Media URLs (one per line)</label>
          <textarea v-model="newPost.mediaUrls" placeholder="https://example.com/image.jpg" rows="2"></textarea>
        </div>

        <div class="form-group">
          <label>Schedule (optional)</label>
          <input type="datetime-local" v-model="newPost.scheduledAt" />
        </div>

        <div class="form-group">
          <label>Tags (comma separated)</label>
          <input v-model="newPost.tags" placeholder="#ai, #automation" />
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showCreatePost = false">Cancel</button>
          <button class="confirm-btn" @click="createPost">
            {{ newPost.scheduledAt ? 'Schedule' : 'Publish Now' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Create Ad Modal -->
    <div v-if="showCreateAd" class="modal-overlay" @click="showCreateAd = false">
      <div class="modal large" @click.stop>
        <h3>Create Ad Campaign</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label>Platform</label>
            <select v-model="newAd.platform">
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter/X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div class="form-group">
            <label>Campaign Name</label>
            <input v-model="newAd.name" placeholder="Summer Sale 2024" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Objective</label>
            <select v-model="newAd.objective">
              <option value="awareness">Brand Awareness</option>
              <option value="traffic">Website Traffic</option>
              <option value="engagement">Engagement</option>
              <option value="conversions">Conversions</option>
              <option value="leads">Lead Generation</option>
            </select>
          </div>
          <div class="form-group">
            <label>Daily Budget ($)</label>
            <input type="number" v-model="newAd.budgetDaily" placeholder="50" />
          </div>
          <div class="form-group">
            <label>Total Budget ($)</label>
            <input type="number" v-model="newAd.budgetTotal" placeholder="1000" />
          </div>
        </div>

        <div class="form-group">
          <label>Target Audience</label>
          <div class="targeting-grid">
            <div class="targeting-item">
              <label>Age Range</label>
              <div class="range-inputs">
                <input type="number" v-model="newAd.ageMin" placeholder="18" min="13" max="65" />
                <span>to</span>
                <input type="number" v-model="newAd.ageMax" placeholder="65" min="13" max="65" />
              </div>
            </div>
            <div class="targeting-item">
              <label>Locations</label>
              <input v-model="newAd.locations" placeholder="United States, Canada" />
            </div>
            <div class="targeting-item">
              <label>Interests</label>
              <input v-model="newAd.interests" placeholder="Technology, AI, Business" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Ad Creative</label>
          <input v-model="newAd.headline" placeholder="Headline" class="mb-2" />
          <textarea v-model="newAd.description" placeholder="Description" rows="2"></textarea>
          <input v-model="newAd.mediaUrl" placeholder="Image/Video URL" class="mt-2" />
          <input v-model="newAd.landingUrl" placeholder="Landing Page URL" class="mt-2" />
        </div>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showCreateAd = false">Cancel</button>
          <button class="confirm-btn" @click="createCampaign">Create Campaign</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusIcon, MegaphoneIcon } from '@heroicons/vue/24/outline'

const showCreatePost = ref(false)
const showCreateAd = ref(false)
const showConnectModal = ref(false)

// Mock data
const accounts = ref([
  { id: '1', platform: 'facebook', displayName: '99Pages', username: '99pages', followers: 1250, isActive: true },
  { id: '2', platform: 'instagram', displayName: '99Pages', username: '99pages', followers: 3400, isActive: true },
  { id: '3', platform: 'twitter', displayName: '99Pages', username: '99pages', followers: 890, isActive: true },
  { id: '4', platform: 'linkedin', displayName: '99Pages', username: '99pages', followers: 560, isActive: true },
])

const recentPosts = ref([
  { id: '1', platform: 'instagram', content: 'Introducing 99Pages Agentic OS - Your AI-powered workspace! 🚀', status: 'published', publishedAt: new Date(), metrics: { likes: 45, comments: 12, shares: 8, views: 1200 } },
  { id: '2', platform: 'twitter', content: 'Just launched our new Cloud OS with 99 MCP integrations! #AI #Automation', status: 'published', publishedAt: new Date(), metrics: { likes: 23, comments: 5, shares: 15, views: 890 } },
  { id: '3', platform: 'linkedin', content: 'How AI is transforming business operations...', status: 'scheduled', scheduledAt: new Date(Date.now() + 86400000) },
])

const campaigns = ref([
  { id: '1', platform: 'facebook', name: 'Summer Launch', objective: 'awareness', budget: { daily: 50, total: 1000, currency: 'USD' }, status: 'active' },
  { id: '2', platform: 'instagram', name: 'Product Demo', objective: 'traffic', budget: { daily: 30, total: 500, currency: 'USD' }, status: 'draft' },
])

// New post form
const newPost = ref({
  platform: 'instagram',
  content: '',
  mediaUrls: '',
  scheduledAt: '',
  tags: ''
})

// New ad form
const newAd = ref({
  platform: 'facebook',
  name: '',
  objective: 'awareness',
  budgetDaily: 50,
  budgetTotal: 1000,
  ageMin: 18,
  ageMax: 65,
  locations: '',
  interests: '',
  headline: '',
  description: '',
  mediaUrl: '',
  landingUrl: ''
})

function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    facebook: '📘',
    instagram: '📸',
    twitter: '🐦',
    linkedin: '💼',
    tiktok: '🎵',
    youtube: '▶️',
    telegram: '✈️',
    whatsapp: '💬'
  }
  return icons[platform] || '📱'
}

function formatDate(date: Date | undefined): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function createPost() {
  // Implementation
  showCreatePost.value = false
}

function createCampaign() {
  // Implementation
  showCreateAd.value = false
}

function editPost(_post: any) {
  // Implementation
}

function deletePost(postId: string) {
  recentPosts.value = recentPosts.value.filter(p => p.id !== postId)
}

function launchCampaign(campaignId: string) {
  const campaign = campaigns.value.find(c => c.id === campaignId)
  if (campaign) campaign.status = 'active'
}

function pauseCampaign(campaignId: string) {
  const campaign = campaigns.value.find(c => c.id === campaignId)
  if (campaign) campaign.status = 'paused'
}
</script>

<style scoped>
.social-manager {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.social-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.social-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.create-btn {
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

.create-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(200, 220, 255, 0.9);
}

.icon {
  width: 16px;
  height: 16px;
}

/* Accounts */
.accounts-section, .posts-section, .campaigns-section {
  margin-bottom: 24px;
}

.accounts-section h3, .posts-section h3, .campaigns-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 12px;
}

.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.account-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
}

.account-card.add-account {
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  border-style: dashed;
  color: rgba(150, 170, 200, 0.5);
}

.account-icon {
  font-size: 24px;
}

.account-info {
  flex: 1;
}

.account-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
}

.account-handle {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
}

.account-stats {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.4);
  margin-top: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #555;
}

.status-dot.active {
  background: #34c759;
  box-shadow: 0 0 6px rgba(52, 199, 89, 0.4);
}

/* Posts */
.posts-list, .campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.post-card, .campaign-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 8px;
}

.post-platform, .campaign-platform {
  font-size: 24px;
}

.post-content, .campaign-info {
  flex: 1;
}

.post-text {
  font-size: 13px;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
}

.post-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

.post-status.published {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.post-status.scheduled {
  background: rgba(0, 200, 255, 0.15);
  color: #00d4ff;
}

.post-date {
  color: rgba(150, 170, 200, 0.5);
}

.post-metrics {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 11px;
  color: rgba(150, 170, 200, 0.5);
}

.post-actions, .campaign-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 12px;
}

.action-btn.delete {
  background: rgba(255, 59, 48, 0.1);
  border-color: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.action-btn.pause {
  background: rgba(255, 149, 0, 0.1);
  border-color: rgba(255, 149, 0, 0.2);
  color: #ff9500;
}

.campaign-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
}

.campaign-objective {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
  text-transform: capitalize;
}

.campaign-budget {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.4);
  margin-top: 4px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.status-badge.draft {
  background: rgba(150, 170, 200, 0.15);
  color: rgba(150, 170, 200, 0.7);
}

.status-badge.paused {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
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
  max-height: 80vh;
  overflow-y: auto;
}

.modal.large {
  width: 700px;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.9);
  font-size: 13px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.targeting-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-inputs input {
  width: 60px;
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
