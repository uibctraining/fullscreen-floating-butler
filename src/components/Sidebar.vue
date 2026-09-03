<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">99</div>
      <span v-if="!isCollapsed" class="logo-text">99Pages</span>
    </div>

    <!-- New Chat Button -->
    <button class="new-chat-btn" @click="$emit('new-chat')">
      <PlusIcon class="icon" />
      <span v-if="!isCollapsed">New Chat</span>
    </button>

    <!-- Navigation Items -->
    <nav class="sidebar-nav">
      <!-- Search -->
      <div class="nav-item" @click="activeSection = 'search'" :class="{ active: activeSection === 'search' }">
        <MagnifyingGlassIcon class="icon" />
        <span v-if="!isCollapsed">Search</span>
        <kbd v-if="!isCollapsed" class="shortcut">⌘K</kbd>
      </div>

      <!-- Tasks -->
      <div class="nav-item" @click="activeSection = 'tasks'" :class="{ active: activeSection === 'tasks' }">
        <ClockIcon class="icon" />
        <span v-if="!isCollapsed">Tasks</span>
        <span v-if="!isCollapsed && taskCount > 0" class="badge">{{ taskCount }}</span>
      </div>

      <!-- Projects -->
      <div class="nav-item" @click="activeSection = 'projects'" :class="{ active: activeSection === 'projects' }">
        <FolderIcon class="icon" />
        <span v-if="!isCollapsed">Projects</span>
      </div>

      <!-- Divider -->
      <div class="nav-divider"></div>

      <!-- Plugins (Skill Hub MCP) -->
      <div class="nav-item" @click="activeSection = 'plugins'" :class="{ active: activeSection === 'plugins' }">
        <PuzzlePieceIcon class="icon" />
        <span v-if="!isCollapsed">MCP Tools</span>
        <span v-if="!isCollapsed" class="badge-info">99</span>
      </div>

      <!-- Library (Skill Hub MCP) -->
      <div class="nav-item" @click="activeSection = 'library'" :class="{ active: activeSection === 'library' }">
        <BookOpenIcon class="icon" />
        <span v-if="!isCollapsed">Library</span>
      </div>

      <!-- Divider -->
      <div class="nav-divider"></div>

      <!-- Onboarding -->
      <div class="nav-item" @click="activeSection = 'onboarding'" :class="{ active: activeSection === 'onboarding' }">
        <SparklesIcon class="icon" />
        <span v-if="!isCollapsed">Getting Started</span>
        <span v-if="!isCollapsed && onboardingProgress < 100" class="progress-badge">{{ onboardingProgress }}%</span>
      </div>
    </nav>

    <!-- Bottom Section -->
    <div class="sidebar-bottom">
      <!-- Credits -->
      <div class="nav-item credits" @click="activeSection = 'credits'">
        <CurrencyDollarIcon class="icon" />
        <div v-if="!isCollapsed" class="credits-info">
          <span class="credits-amount">{{ credits.toLocaleString() }}</span>
          <span class="credits-label">credits</span>
        </div>
      </div>

      <!-- Settings -->
      <div class="nav-item" @click="activeSection = 'settings'" :class="{ active: activeSection === 'settings' }">
        <Cog6ToothIcon class="icon" />
        <span v-if="!isCollapsed">Settings</span>
      </div>

      <!-- Collapse Toggle -->
      <div class="nav-item" @click="isCollapsed = !isCollapsed">
        <ChevronDoubleLeftIcon v-if="!isCollapsed" class="icon" />
        <ChevronDoubleRightIcon v-else class="icon" />
        <span v-if="!isCollapsed">Collapse</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  FolderIcon,
  PuzzlePieceIcon,
  BookOpenIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/24/outline'

const emit = defineEmits(['new-chat', 'section-change'])

const isCollapsed = ref(false)
const activeSection = ref('tasks')
const taskCount = ref(5)
const credits = ref(1000)
const onboardingProgress = ref(60)
</script>

<style scoped>
.sidebar {
  width: 260px;
  height: 100%;
  background: rgba(10, 15, 25, 0.98);
  border-right: 1px solid rgba(0, 200, 255, 0.1);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #00d4ff, #0088ff);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  white-space: nowrap;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 12px;
  padding: 10px 16px;
  background: rgba(0, 200, 255, 0.1);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 8px;
  color: #00d4ff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background: rgba(0, 200, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 8px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: rgba(150, 170, 200, 0.7);
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(200, 220, 255, 0.9);
}

.nav-item.active {
  background: rgba(0, 200, 255, 0.1);
  color: #00d4ff;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.shortcut {
  margin-left: auto;
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 10px;
  font-family: monospace;
  color: rgba(150, 170, 200, 0.5);
}

.badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(0, 200, 255, 0.2);
  border-radius: 10px;
  font-size: 11px;
  color: #00d4ff;
}

.badge-info {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(52, 199, 89, 0.2);
  border-radius: 10px;
  font-size: 11px;
  color: #34c759;
}

.progress-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: rgba(255, 149, 0, 0.2);
  border-radius: 10px;
  font-size: 11px;
  color: #ff9500;
}

.nav-divider {
  height: 1px;
  background: rgba(0, 200, 255, 0.1);
  margin: 8px 0;
}

.sidebar-bottom {
  padding: 8px;
  border-top: 1px solid rgba(0, 200, 255, 0.1);
}

.credits {
  background: rgba(241, 196, 15, 0.05);
}

.credits-info {
  display: flex;
  flex-direction: column;
}

.credits-amount {
  font-size: 14px;
  font-weight: 600;
  color: #f1c40f;
}

.credits-label {
  font-size: 10px;
  color: rgba(150, 170, 200, 0.5);
}
</style>
