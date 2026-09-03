<template>
  <div class="design-toolbox">
    <div class="toolbox-header">
      <h2>{{ toolboxTitle }}</h2>
      <p class="toolbox-desc">{{ toolboxDesc }}</p>
    </div>

    <!-- Tool Grid -->
    <div class="tool-grid">
      <div 
        v-for="tool in tools" 
        :key="tool.id"
        class="tool-card"
        @click="openTool(tool)"
      >
        <div class="tool-icon">{{ tool.icon }}</div>
        <div class="tool-info">
          <div class="tool-name">{{ tool.name }}</div>
          <div class="tool-desc">{{ tool.description }}</div>
        </div>
        <div class="tool-arrow">→</div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type: 'uxui' | 'junior' | 'senior' | 'director' | 'psychology'
}>()

const toolboxTitle = computed(() => {
  const titles: Record<string, string> = {
    uxui: 'UX/UI Designer Toolbox',
    junior: 'Junior Designer Toolbox',
    senior: 'Senior Designer Toolbox',
    director: 'Design Director Toolbox',
    psychology: 'Psychology Expert Toolbox'
  }
  return titles[props.type]
})

const toolboxDesc = computed(() => {
  const descs: Record<string, string> = {
    uxui: 'Tools for user experience and interface design',
    junior: 'Learning resources and templates for beginners',
    senior: 'Advanced tools for professional designers',
    director: 'Team management and design system tools',
    psychology: 'User research and behavioral analysis tools'
  }
  return descs[props.type]
})

const tools = computed(() => {
  const toolSets: Record<string, any[]> = {
    uxui: [
      { id: 'components', icon: '🧩', name: 'Component Library', description: 'Manage reusable UI components' },
      { id: 'design-system', icon: '🎨', name: 'Design System', description: 'Create and maintain design systems' },
      { id: 'prototype', icon: '🖼️', name: 'Prototype Builder', description: 'Create interactive prototypes' },
      { id: 'animation', icon: '✨', name: 'Animation Editor', description: 'Design micro-interactions' },
      { id: 'spec-checker', icon: '✅', name: 'Spec Checker', description: 'Verify design specifications' },
      { id: 'handoff', icon: '🤝', name: 'Design Handoff', description: 'Export designs for developers' },
    ],
    junior: [
      { id: 'tutorials', icon: '📚', name: 'Design Tutorials', description: 'Learn design fundamentals' },
      { id: 'templates', icon: '📋', name: 'Template Gallery', description: 'Pre-made design templates' },
      { id: 'inspiration', icon: '💡', name: 'Inspiration Gallery', description: 'Browse design inspiration' },
      { id: 'skill-test', icon: '🎯', name: 'Skill Assessment', description: 'Test your design skills' },
      { id: 'portfolio', icon: '📁', name: 'Portfolio Builder', description: 'Create your portfolio' },
      { id: 'feedback', icon: '💬', name: 'Feedback Forum', description: 'Get design feedback' },
    ],
    senior: [
      { id: 'design-system', icon: '🏗️', name: 'Design System Manager', description: 'Manage enterprise design systems' },
      { id: 'automation', icon: '⚡', name: 'Workflow Automation', description: 'Automate design tasks' },
      { id: 'code-export', icon: '💻', name: 'Code Export', description: 'Export designs as code' },
      { id: 'version-control', icon: '🔄', name: 'Version Control', description: 'Track design changes' },
      { id: 'review', icon: '👁️', name: 'Design Review', description: 'Review and approve designs' },
      { id: 'performance', icon: '📊', name: 'Performance Monitor', description: 'Monitor design performance' },
    ],
    director: [
      { id: 'team', icon: '👥', name: 'Team Manager', description: 'Manage design team' },
      { id: 'standards', icon: '📏', name: 'Design Standards', description: 'Set design standards' },
      { id: 'quality', icon: '✅', name: 'Quality Control', description: 'Ensure design quality' },
      { id: 'resources', icon: '📦', name: 'Resource Allocator', description: 'Allocate design resources' },
      { id: 'tracker', icon: '📈', name: 'Progress Tracker', description: 'Track project progress' },
      { id: 'reports', icon: '📊', name: 'Report Generator', description: 'Generate design reports' },
    ],
    psychology: [
      { id: 'behavior', icon: '🧠', name: 'Behavior Analyzer', description: 'Analyze user behavior patterns' },
      { id: 'cognitive', icon: '💭', name: 'Cognitive Load Tester', description: 'Test cognitive load' },
      { id: 'emotion', icon: '❤️', name: 'Emotion Analyzer', description: 'Analyze emotional responses' },
      { id: 'usability', icon: '🖥️', name: 'Usability Tester', description: 'Test interface usability' },
      { id: 'heatmap', icon: '🔥', name: 'Heatmap Generator', description: 'Generate user heatmaps' },
      { id: 'research', icon: '📝', name: 'Research Reports', description: 'Generate research reports' },
    ]
  }
  return toolSets[props.type] || []
})

const stats = computed(() => {
  const statSets: Record<string, any[]> = {
    uxui: [
      { value: '156', label: 'Components' },
      { value: '12', label: 'Design Systems' },
      { value: '89%', label: 'Consistency' },
      { value: '2.4s', label: 'Avg Load Time' },
    ],
    junior: [
      { value: '24', label: 'Tutorials Done' },
      { value: '8', label: 'Templates Used' },
      { value: '3', label: 'Projects' },
      { value: '85%', label: 'Skill Score' },
    ],
    senior: [
      { value: '45', label: 'Projects Done' },
      { value: '8', label: 'Design Systems' },
      { value: '96%', label: 'Quality Score' },
      { value: '12', label: 'Team Members' },
    ],
    director: [
      { value: '28', label: 'Team Members' },
      { value: '156', label: 'Projects' },
      { value: '94%', label: 'On-time Delivery' },
      { value: '4.8', label: 'Team Rating' },
    ],
    psychology: [
      { value: '1.2K', label: 'Users Tested' },
      { value: '89%', label: 'Satisfaction' },
      { value: '24', label: 'Studies Done' },
      { value: '15', label: 'Reports Generated' },
    ]
  }
  return statSets[props.type] || []
})

function openTool(tool: any) {
  console.log('Opening tool:', tool.name)
}
</script>

<style scoped>
.design-toolbox {
  padding: 20px;
  height: 100%;
  overflow-y: auto;
}

.toolbox-header {
  margin-bottom: 24px;
}

.toolbox-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 4px;
}

.toolbox-desc {
  font-size: 13px;
  color: rgba(150, 170, 200, 0.6);
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-card:hover {
  background: rgba(0, 200, 255, 0.05);
  border-color: rgba(0, 200, 255, 0.3);
  transform: translateY(-2px);
}

.tool-icon {
  font-size: 28px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 200, 255, 0.1);
  border-radius: 10px;
}

.tool-info {
  flex: 1;
}

.tool-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(200, 220, 255, 0.9);
  margin-bottom: 2px;
}

.tool-desc {
  font-size: 12px;
  color: rgba(150, 170, 200, 0.5);
}

.tool-arrow {
  color: rgba(150, 170, 200, 0.3);
  font-size: 16px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 16px;
  background: rgba(0, 200, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.1);
  border-radius: 10px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #00d4ff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: rgba(150, 170, 200, 0.5);
}
</style>
