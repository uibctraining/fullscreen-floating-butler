<template>
  <div class="registration-overlay" v-if="!isRegistered">
    <div class="registration-card">
      <div class="reg-header">
        <div class="reg-logo">99</div>
        <h2>Welcome to 99Pages</h2>
        <p>Let's set up your profile</p>
      </div>

      <div class="reg-form">
        <!-- Name -->
        <div class="form-group">
          <label>Your Name</label>
          <input 
            v-model="form.name" 
            placeholder="Enter your full name"
            :class="{ error: errors.name }"
          />
          <span class="error-msg" v-if="errors.name">{{ errors.name }}</span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>Email (Gmail only)</label>
          <input 
            v-model="form.email" 
            type="email"
            placeholder="your.email@gmail.com"
            :class="{ error: errors.email }"
          />
          <span class="error-msg" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <!-- Birth Date -->
        <div class="form-group">
          <label>Date of Birth</label>
          <div class="date-inputs">
            <select v-model="form.birthYear" :class="{ error: errors.birth }">
              <option value="">Year</option>
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
            <select v-model="form.birthMonth" :class="{ error: errors.birth }">
              <option value="">Month</option>
              <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
            </select>
            <select v-model="form.birthDay" :class="{ error: errors.birth }">
              <option value="">Day</option>
              <option v-for="d in 31" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <span class="error-msg" v-if="errors.birth">{{ errors.birth }}</span>
          <span class="hint">Used for personalized insights</span>
        </div>

        <!-- Gender -->
        <div class="form-group">
          <label>Gender</label>
          <div class="gender-options">
            <button 
              class="gender-btn" 
              :class="{ active: form.gender === 'male' }"
              @click="form.gender = 'male'"
            >
              <span class="gender-icon">👨</span>
              <span>Male</span>
            </button>
            <button 
              class="gender-btn" 
              :class="{ active: form.gender === 'female' }"
              @click="form.gender = 'female'"
            >
              <span class="gender-icon">👩</span>
              <span>Female</span>
            </button>
            <button 
              class="gender-btn" 
              :class="{ active: form.gender === 'other' }"
              @click="form.gender = 'other'"
            >
              <span class="gender-icon">🧑</span>
              <span>Other</span>
            </button>
          </div>
        </div>

        <!-- Birth Time (Optional) -->
        <div class="form-group optional">
          <label>
            Birth Time 
            <span class="optional-tag">(Optional)</span>
          </label>
          <div class="time-inputs">
            <select v-model="form.birthHour">
              <option value="">Hour</option>
              <option v-for="h in 24" :key="h" :value="h-1">{{ String(h-1).padStart(2, '0') }}</option>
            </select>
            <span class="time-sep">:</span>
            <select v-model="form.birthMinute">
              <option value="">Min</option>
              <option v-for="m in 60" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
            </select>
          </div>
          <span class="hint">For more accurate analysis</span>
        </div>

        <!-- Submit -->
        <button class="submit-btn" @click="submit" :disabled="!isValid">
          Get Started
          <span class="btn-arrow">→</span>
        </button>

        <p class="terms">
          By continuing, you agree to our 
          <a href="/terms">Terms</a> and 
          <a href="/privacy">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits<{
  (e: 'complete', data: UserData): void
}>()

export interface UserData {
  name: string
  email: string
  birthDate: string
  gender: string
  birthTime?: string
}

const isRegistered = ref(false)

const form = ref({
  name: '',
  email: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  gender: '',
  birthHour: '',
  birthMinute: ''
})

const errors = ref({
  name: '',
  email: '',
  birth: ''
})

// Generate years (1940-2010)
const years = computed(() => {
  const result = []
  for (let y = 2010; y >= 1940; y--) {
    result.push(y)
  }
  return result
})

const isValid = computed(() => {
  return form.value.name && 
         form.value.email && 
         form.value.birthYear && 
         form.value.birthMonth && 
         form.value.birthDay && 
         form.value.gender
})

function validate(): boolean {
  errors.value = { name: '', email: '', birth: '' }
  let valid = true

  if (!form.value.name.trim()) {
    errors.value.name = 'Name is required'
    valid = false
  }

  if (!form.value.email.includes('@gmail.com')) {
    errors.value.email = 'Please use a Gmail address'
    valid = false
  }

  if (!form.value.birthYear || !form.value.birthMonth || !form.value.birthDay) {
    errors.value.birth = 'Date of birth is required'
    valid = false
  }

  return valid
}

function submit() {
  if (!validate()) return

  const birthDate = `${form.value.birthYear}-${String(form.value.birthMonth).padStart(2, '0')}-${String(form.value.birthDay).padStart(2, '0')}`
  
  const birthTime = form.value.birthHour !== '' 
    ? `${String(form.value.birthHour).padStart(2, '0')}:${String(form.value.birthMinute || 0).padStart(2, '0')}`
    : undefined

  const userData: UserData = {
    name: form.value.name,
    email: form.value.email,
    birthDate,
    gender: form.value.gender,
    birthTime
  }

  // Save to localStorage
  localStorage.setItem('user_data', JSON.stringify(userData))
  localStorage.setItem('user_registered', 'true')
  
  isRegistered.value = true
  emit('complete', userData)
}

// Check if already registered
onMounted(() => {
  const registered = localStorage.getItem('user_registered')
  if (registered === 'true') {
    isRegistered.value = true
  }
})
</script>

<style scoped>
.registration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(5, 10, 20, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(20px);
}

.registration-card {
  width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  background: rgba(15, 20, 35, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 20px;
  padding: 40px 32px;
}

.reg-header {
  text-align: center;
  margin-bottom: 32px;
}

.reg-logo {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #00d4ff, #0088ff);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 auto 16px;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
}

.reg-header h2 {
  font-size: 22px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 4px;
}

.reg-header p {
  font-size: 14px;
  color: rgba(150, 170, 200, 0.6);
}

.reg-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.8);
}

.optional-tag {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.4);
  font-weight: normal;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.15);
  border-radius: 10px;
  color: rgba(200, 220, 255, 0.9);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #00d4ff;
  box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.form-group input.error,
.form-group select.error {
  border-color: #ff3b30;
}

.error-msg {
  font-size: 12px;
  color: #ff3b30;
}

.hint {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.4);
}

.date-inputs {
  display: flex;
  gap: 8px;
}

.date-inputs select {
  flex: 1;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-inputs select {
  flex: 1;
}

.time-sep {
  color: rgba(150, 170, 200, 0.5);
  font-size: 18px;
}

.gender-options {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(200, 220, 255, 0.7);
}

.gender-btn:hover {
  background: rgba(0, 200, 255, 0.05);
  border-color: rgba(0, 200, 255, 0.3);
}

.gender-btn.active {
  background: rgba(0, 200, 255, 0.1);
  border-color: #00d4ff;
  color: #00d4ff;
}

.gender-icon {
  font-size: 24px;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  background: linear-gradient(135deg, #00d4ff, #0088ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-arrow {
  font-size: 18px;
}

.terms {
  text-align: center;
  font-size: 11px;
  color: rgba(150, 170, 200, 0.4);
}

.terms a {
  color: rgba(0, 200, 255, 0.6);
  text-decoration: none;
}

.terms a:hover {
  color: #00d4ff;
}
</style>
