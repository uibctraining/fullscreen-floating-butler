<template>
  <div class="credits-page">
    <div class="credits-header">
      <h2>Credits & Subscription</h2>
      <button class="close-btn" @click="$emit('close')">
        <XMarkIcon class="icon" />
      </button>
    </div>

    <div class="credits-content">
      <!-- Balance Card -->
      <div class="balance-card">
        <div class="balance-header">
          <span class="balance-label">Available Credits</span>
          <span class="balance-amount">{{ credits.toLocaleString() }}</span>
        </div>
        <div class="balance-bar">
          <div class="balance-fill" :style="{ width: (credits / maxCredits * 100) + '%' }"></div>
        </div>
        <div class="balance-footer">
          <span>{{ credits }} of {{ maxCredits.toLocaleString() }} credits remaining</span>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <button class="action-btn primary" @click="showTopUp = true">
          <PlusCircleIcon class="action-icon" />
          Top Up Credits
        </button>
        <button class="action-btn secondary">
          <ArrowPathIcon class="action-icon" />
          Auto-Recharge
        </button>
      </div>

      <!-- Usage History -->
      <div class="usage-section">
        <h3>Credit Usage History</h3>
        <div class="usage-chart">
          <div class="chart-bars">
            <div v-for="(day, index) in usageHistory" :key="index" class="chart-bar">
              <div class="bar-fill" :style="{ height: (day.usage / maxUsage * 100) + '%' }"></div>
              <span class="bar-label">{{ day.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage by Model -->
      <div class="model-usage">
        <h3>Tokens by Model</h3>
        <div class="model-list">
          <div v-for="model in modelUsage" :key="model.name" class="model-item">
            <div class="model-info">
              <span class="model-name">{{ model.name }}</span>
              <span class="model-tokens">{{ model.tokens.toLocaleString() }} tokens</span>
            </div>
            <div class="model-bar">
              <div class="model-fill" :style="{ width: (model.tokens / maxModelTokens * 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subscription Plans -->
      <div class="plans-section">
        <h3>Subscription Plans</h3>
        <div class="plans-grid">
          <div class="plan-card" :class="{ active: currentPlan === 'free' }">
            <div class="plan-name">Free</div>
            <div class="plan-price">$0/month</div>
            <ul class="plan-features">
              <li>100 credits/month</li>
              <li>Basic models</li>
              <li>Community support</li>
            </ul>
            <button class="plan-btn" :class="{ current: currentPlan === 'free' }">
              {{ currentPlan === 'free' ? 'Current Plan' : 'Downgrade' }}
            </button>
          </div>
          <div class="plan-card" :class="{ active: currentPlan === 'pro' }">
            <div class="plan-badge">Popular</div>
            <div class="plan-name">Pro</div>
            <div class="plan-price">$29/month</div>
            <ul class="plan-features">
              <li>5,000 credits/month</li>
              <li>All models</li>
              <li>Priority support</li>
              <li>Advanced features</li>
            </ul>
            <button class="plan-btn" :class="{ current: currentPlan === 'pro' }">
              {{ currentPlan === 'pro' ? 'Current Plan' : 'Upgrade' }}
            </button>
          </div>
          <div class="plan-card" :class="{ active: currentPlan === 'enterprise' }">
            <div class="plan-name">Enterprise</div>
            <div class="plan-price">$99/month</div>
            <ul class="plan-features">
              <li>Unlimited credits</li>
              <li>All models + custom</li>
              <li>Dedicated support</li>
              <li>API access</li>
              <li>Team management</li>
            </ul>
            <button class="plan-btn" :class="{ current: currentPlan === 'enterprise' }">
              {{ currentPlan === 'enterprise' ? 'Current Plan' : 'Contact Sales' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Up Modal -->
    <div v-if="showTopUp" class="modal-overlay" @click="showTopUp = false">
      <div class="modal" @click.stop>
        <h3>Top Up Credits</h3>
        <div class="top-up-options">
          <button v-for="option in topUpOptions" :key="option.credits" class="top-up-option" @click="topUp(option)">
            <span class="option-credits">{{ option.credits.toLocaleString() }}</span>
            <span class="option-price">${{ option.price }}</span>
          </button>
        </div>
        <div class="custom-amount">
          <label>Custom Amount</label>
          <input v-model="customAmount" type="number" placeholder="Enter credits amount" />
        </div>
        <div class="modal-actions">
          <button class="cancel-btn" @click="showTopUp = false">Cancel</button>
          <button class="confirm-btn" @click="topUpCustom">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  XMarkIcon,
  PlusCircleIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline'

defineEmits(['close'])

const credits = ref(1000)
const maxCredits = ref(5000)
const currentPlan = ref('pro')
const showTopUp = ref(false)
const customAmount = ref(0)

const usageHistory = ref([
  { label: 'Mon', usage: 120 },
  { label: 'Tue', usage: 85 },
  { label: 'Wed', usage: 200 },
  { label: 'Thu', usage: 150 },
  { label: 'Fri', usage: 90 },
  { label: 'Sat', usage: 50 },
  { label: 'Sun', usage: 30 },
])

const maxUsage = ref(200)

const modelUsage = ref([
  { name: 'MiMo V2.5 Pro', tokens: 45000 },
  { name: 'GPT-4', tokens: 28000 },
  { name: 'Claude 3', tokens: 15000 },
  { name: 'Gemini', tokens: 8000 },
])

const maxModelTokens = ref(45000)

const topUpOptions = ref([
  { credits: 100, price: 10 },
  { credits: 500, price: 45 },
  { credits: 1000, price: 80 },
  { credits: 5000, price: 350 },
])

function topUp(option: { credits: number; price: number }) {
  credits.value += option.credits
  showTopUp.value = false
}

function topUpCustom() {
  if (customAmount.value > 0) {
    credits.value += customAmount.value
    customAmount.value = 0
    showTopUp.value = false
  }
}
</script>

<style scoped>
.credits-page {
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 25, 0.98);
  display: flex;
  flex-direction: column;
}

.credits-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.credits-header h2 {
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

.credits-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.balance-card {
  background: linear-gradient(135deg, rgba(0, 200, 255, 0.1), rgba(0, 100, 200, 0.1));
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.balance-label {
  font-size: 14px;
  color: rgba(150, 170, 200, 0.7);
}

.balance-amount {
  font-size: 32px;
  font-weight: 700;
  color: #00d4ff;
}

.balance-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.balance-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0088ff);
  border-radius: 4px;
  transition: width 0.3s;
}

.balance-footer {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

.action-btn.primary:hover {
  background: rgba(0, 200, 255, 0.25);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(200, 220, 255, 0.9);
}

.action-icon {
  width: 18px;
  height: 18px;
}

.usage-section, .model-usage, .plans-section {
  margin-bottom: 24px;
}

.usage-section h3, .model-usage h3, .plans-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 12px;
}

.chart-bars {
  display: flex;
  gap: 8px;
  height: 120px;
  align-items: flex-end;
}

.chart-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #00d4ff, #0088ff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
}

.bar-label {
  font-size: 10px;
  color: rgba(150, 170, 200, 0.5);
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.model-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.model-info {
  display: flex;
  justify-content: space-between;
}

.model-name {
  font-size: 13px;
  color: rgba(200, 220, 255, 0.9);
}

.model-tokens {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
}

.model-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.model-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #0088ff);
  border-radius: 3px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.plan-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  position: relative;
}

.plan-card.active {
  border-color: #00d4ff;
  background: rgba(0, 200, 255, 0.05);
}

.plan-badge {
  position: absolute;
  top: -10px;
  right: 10px;
  background: #00d4ff;
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 4px;
}

.plan-price {
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
  margin-bottom: 12px;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin-bottom: 16px;
}

.plan-features li {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.7);
  padding: 4px 0;
}

.plan-btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}

.plan-btn.current {
  background: rgba(0, 200, 255, 0.05);
  border-color: rgba(0, 200, 255, 0.2);
  color: rgba(0, 200, 255, 0.5);
  cursor: default;
}

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
  width: 400px;
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 16px;
}

.top-up-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.top-up-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: rgba(0, 200, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.top-up-option:hover {
  background: rgba(0, 200, 255, 0.1);
}

.option-credits {
  font-size: 20px;
  font-weight: 600;
  color: #00d4ff;
}

.option-price {
  font-size: 14px;
  color: rgba(150, 170, 200, 0.7);
}

.custom-amount {
  margin-bottom: 16px;
}

.custom-amount label {
  display: block;
  font-size: 13px;
  color: rgba(150, 170, 200, 0.7);
  margin-bottom: 8px;
}

.custom-amount input {
  width: 100%;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 6px;
  color: rgba(200, 220, 255, 0.9);
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn, .confirm-btn {
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(200, 220, 255, 0.9);
}

.confirm-btn {
  background: rgba(0, 200, 255, 0.15);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00d4ff;
}
</style>
