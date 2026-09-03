<template>
  <div class="audio-pulse" :class="{ active: isActive, listening: isListening }">
    <!-- Outer rings -->
    <div class="pulse-ring ring-1"></div>
    <div class="pulse-ring ring-2"></div>
    <div class="pulse-ring ring-3"></div>

    <!-- Core orb -->
    <div class="orb-container">
      <div class="orb" :style="{ transform: `scale(${1 + volume * 0.3})` }">
        <div class="orb-inner"></div>
        <div class="orb-glow"></div>
      </div>
    </div>

    <!-- Audio bars -->
    <div class="audio-bars">
      <div
        v-for="i in 24"
        :key="i"
        class="bar"
        :style="{
          height: getBarHeight(i) + 'px',
          animationDelay: `${i * 50}ms`,
          opacity: isActive ? 0.8 : 0.2
        }"
      ></div>
    </div>

    <!-- Waveform -->
    <svg class="waveform" viewBox="0 0 200 60" preserveAspectRatio="none">
      <path
        :d="waveformPath"
        fill="none"
        stroke="url(#gradient)"
        stroke-width="2"
        class="wave-path"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.8" />
          <stop offset="50%" stop-color="#00ff88" stop-opacity="1" />
          <stop offset="100%" stop-color="#00d4ff" stop-opacity="0.8" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Status text -->
    <div class="status-text">
      <span v-if="isListening" class="listening-text">Listening...</span>
      <span v-else-if="isSpeaking" class="speaking-text">Speaking...</span>
      <span v-else class="idle-text">{{ idleText }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  isActive?: boolean
  isListening?: boolean
  isSpeaking?: boolean
  volume?: number
  idleText?: string
}>(), {
  isActive: false,
  isListening: false,
  isSpeaking: false,
  volume: 0,
  idleText: 'Tap to speak'
})

// Audio bars animation
const barHeights = ref<number[]>(new Array(24).fill(4))

function getBarHeight(index: number): number {
  if (!props.isActive) return 4
  const center = 12
  const distance = Math.abs(index - center)
  const base = Math.max(4, 30 - distance * 2)
  return base + (props.volume * 40 * Math.random())
}

// Waveform path
const waveformPath = computed(() => {
  const points: string[] = []
  const width = 200
  const height = 60
  const centerY = height / 2

  for (let i = 0; i <= width; i += 2) {
    const x = i
    const amplitude = props.isActive ? props.volume * 20 + 5 : 3
    const frequency = 0.05 + (props.volume * 0.02)
    const y = centerY + Math.sin(i * frequency + Date.now() * 0.003) * amplitude
    points.push(`${i === 0 ? 'M' : 'L'} ${x} ${y}`)
  }

  return points.join(' ')
})

// Animation frame for waveform
let animationId: number
function animateWaveform() {
  animationId = requestAnimationFrame(animateWaveform)
}

onMounted(() => {
  animateWaveform()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
})
</script>

<style scoped>
.audio-pulse {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Pulse rings */
.pulse-ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgba(0, 212, 255, 0.2);
  animation: pulse-ring 2s ease-out infinite;
}

.ring-1 {
  width: 100%;
  height: 100%;
  animation-delay: 0s;
}

.ring-2 {
  width: 120%;
  height: 120%;
  animation-delay: 0.5s;
}

.ring-3 {
  width: 140%;
  height: 140%;
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Orb */
.orb-container {
  position: relative;
  z-index: 2;
}

.orb {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00d4ff, #0088ff);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s ease;
  box-shadow:
    0 0 30px rgba(0, 212, 255, 0.4),
    0 0 60px rgba(0, 212, 255, 0.2),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
}

.orb-inner {
  width: 60%;
  height: 60%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent);
}

.orb-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent 70%);
  animation: orb-glow 2s ease-in-out infinite;
}

@keyframes orb-glow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Listening state */
.audio-pulse.listening .orb {
  background: linear-gradient(135deg, #ff9500, #ff6b00);
  box-shadow:
    0 0 30px rgba(255, 149, 0, 0.4),
    0 0 60px rgba(255, 149, 0, 0.2);
  animation: listening-pulse 1s ease-in-out infinite;
}

@keyframes listening-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Audio bars */
.audio-bars {
  position: absolute;
  bottom: 20px;
  display: flex;
  gap: 3px;
  align-items: flex-end;
  height: 40px;
}

.bar {
  width: 4px;
  background: linear-gradient(to top, #00d4ff, #00ff88);
  border-radius: 2px;
  transition: height 0.1s ease;
}

/* Waveform */
.waveform {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 30px;
  opacity: 0.6;
}

.wave-path {
  animation: wave-flow 2s linear infinite;
}

@keyframes wave-flow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -200; }
}

/* Status text */
.status-text {
  position: absolute;
  bottom: -30px;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  text-align: center;
}

.listening-text {
  color: #ff9500;
  animation: blink 1s infinite;
}

.speaking-text {
  color: #00d4ff;
}

.idle-text {
  color: rgba(150, 170, 200, 0.5);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
