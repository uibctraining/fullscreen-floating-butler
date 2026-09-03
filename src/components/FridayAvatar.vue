<template>
  <div class="friday-section">
    <!-- Animated rings -->
    <div class="friday-avatar">
      <div class="ring ring-outer"></div>
      <div class="ring ring-middle"></div>
      <div class="ring ring-inner"></div>
      <div class="avatar-core" :class="{ listening: isListening, active: isActive }">
        <svg class="avatar-icon" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" opacity="0.3"/>
          <circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
          <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/>
          <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="1.5"/>
          <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" stroke-width="1.5"/>
          <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5"/>
        </svg>
      </div>
      <!-- Orbiting dots -->
      <div class="orbit-dot dot-1"></div>
      <div class="orbit-dot dot-2"></div>
      <div class="orbit-dot dot-3"></div>
    </div>

    <div class="friday-name">FRIDAY</div>
    <div class="friday-subtitle">AI Assistant</div>
    <div class="friday-status" :class="{ listening: isListening }">
      <span class="status-dot"></span>
      {{ status }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  status: string
  isListening: boolean
  isActive?: boolean
}>(), {
  isActive: true
})
</script>

<style scoped>
.friday-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
}

.friday-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 16px;
}

/* Rings */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid;
}

.ring-outer {
  top: -10px; left: -10px; right: -10px; bottom: -10px;
  border-color: rgba(0, 200, 255, 0.15);
  animation: rotate 8s linear infinite;
}

.ring-middle {
  top: -5px; left: -5px; right: -5px; bottom: -5px;
  border-color: rgba(0, 200, 255, 0.25);
  border-style: dashed;
  animation: rotate 12s linear infinite reverse;
}

.ring-inner {
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  border-color: rgba(0, 255, 200, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* Core */
.avatar-core {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 100, 200, 0.8), rgba(0, 200, 255, 0.6));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 30px rgba(0, 200, 255, 0.3),
    0 0 60px rgba(0, 200, 255, 0.1),
    inset 0 0 20px rgba(0, 200, 255, 0.2);
  transition: all 0.3s;
}

.avatar-core.listening {
  background: linear-gradient(135deg, rgba(200, 100, 0, 0.8), rgba(255, 150, 0, 0.6));
  box-shadow:
    0 0 30px rgba(255, 150, 0, 0.4),
    0 0 60px rgba(255, 150, 0, 0.15);
  animation: listenPulse 1.5s ease-in-out infinite;
}

@keyframes listenPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.avatar-icon {
  width: 50px;
  height: 50px;
  color: rgba(255, 255, 255, 0.9);
}

/* Orbiting dots */
.orbit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #00d4ff;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.dot-1 {
  top: 50%; left: -13px;
  animation: orbit1 4s linear infinite;
}

.dot-2 {
  top: -13px; left: 50%;
  animation: orbit2 6s linear infinite;
}

.dot-3 {
  bottom: -13px; right: 20%;
  animation: orbit3 5s linear infinite;
}

@keyframes orbit1 {
  from { transform: rotate(0deg) translateX(65px) rotate(0deg); }
  to { transform: rotate(360deg) translateX(65px) rotate(-360deg); }
}

@keyframes orbit2 {
  from { transform: rotate(0deg) translateX(65px) rotate(0deg); }
  to { transform: rotate(-360deg) translateX(65px) rotate(360deg); }
}

@keyframes orbit3 {
  from { transform: rotate(90deg) translateX(65px) rotate(-90deg); }
  to { transform: rotate(450deg) translateX(65px) rotate(-450deg); }
}

/* Text */
.friday-name {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4px;
  margin-bottom: 2px;
}

.friday-subtitle {
  font-size: 11px;
  color: rgba(0, 200, 255, 0.6);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.friday-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #34c759;
  transition: color 0.3s;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #34c759;
  box-shadow: 0 0 8px rgba(52, 199, 89, 0.6);
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.friday-status.listening {
  color: #ff9500;
}

.friday-status.listening .status-dot {
  background: #ff9500;
  box-shadow: 0 0 8px rgba(255, 149, 0, 0.6);
}
</style>
