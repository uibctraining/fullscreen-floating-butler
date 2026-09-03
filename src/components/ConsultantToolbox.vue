<template>
  <div class="consultant-toolbox">
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
import { ref, computed } from 'vue'

const props = defineProps<{
  type: 'marketing' | 'image' | 'brand'
}>()

const toolboxTitle = computed(() => {
  const titles: Record<string, string> = {
    marketing: 'Marketing Toolbox',
    image: 'Image Consulting Toolbox',
    brand: 'Brand Consulting Toolbox'
  }
  return titles[props.type]
})

const toolboxDesc = computed(() => {
  const descs: Record<string, string> = {
    marketing: 'Tools for digital marketing, SEO, and campaign management',
    image: 'Tools for personal styling, color analysis, and wardrobe planning',
    brand: 'Tools for brand strategy, identity, and market positioning'
  }
  return descs[props.type]
})

const tools = computed(() => {
  const toolSets: Record<string, any[]> = {
    marketing: [
      { id: 'seo', icon: '🔍', name: 'SEO Analyzer', description: 'Analyze website SEO performance' },
      { id: 'competitor', icon: '📊', name: 'Competitor Monitor', description: 'Track competitor activities' },
      { id: 'roi', icon: '💰', name: 'Ad ROI Calculator', description: 'Calculate advertising ROI' },
      { id: 'calendar', icon: '📅', name: 'Content Calendar', description: 'Plan content schedule' },
      { id: 'persona', icon: '👤', name: 'Customer Persona', description: 'Create customer profiles' },
      { id: 'analytics', icon: '📈', name: 'Analytics Dashboard', description: 'View marketing metrics' },
    ],
    image: [
      { id: 'color', icon: '🎨', name: 'Color Analysis', description: 'Personal color palette' },
      { id: 'style', icon: '👗', name: 'Style Quiz', description: 'Discover your style type' },
      { id: 'virtual', icon: '🪞', name: 'Virtual Try-On', description: 'Try outfits virtually' },
      { id: 'templates', icon: '📋', name: 'Style Templates', description: 'Outfit templates' },
      { id: 'wardrobe', icon: '👔', name: 'Wardrobe Planner', description: 'Plan your wardrobe' },
      { id: 'trends', icon: '✨', name: 'Trend Tracker', description: 'Track fashion trends' },
    ],
    brand: [
      { id: 'audit', icon: '📋', name: 'Brand Audit', description: 'Assess brand health' },
      { id: 'competitor', icon: '🔍', name: 'Competitor Analysis', description: 'Analyze competitors' },
      { id: 'guide', icon: '📖', name: 'Brand Guide', description: 'Create brand guidelines' },
      { id: 'story', icon: '📝', name: 'Brand Story', description: 'Craft brand narrative' },
      { id: 'consistency', icon: '✅', name: 'Consistency Check', description: 'Check brand consistency' },
      { id: 'assets', icon: '🎨', name: 'Brand Assets', description: 'Manage brand assets' },
    ]
  }
  return toolSets[props.type] || []
})

const stats = computed(() => {
  const statSets: Record<string, any[]> = {
    marketing: [
      { value: '12', label: 'Active Campaigns' },
      { value: '2.4K', label: 'Leads Generated' },
      { value: '89%', label: 'Email Open Rate' },
      { value: '$12K', label: 'Ad Spend' },
    ],
    image: [
      { value: '45', label: 'Clients' },
      { value: '120', label: 'Style Profiles' },
      { value: '8', label: 'Color Palettes' },
      { value: '95%', label: 'Satisfaction' },
    ],
    brand: [
      { value: '28', label: 'Brand Audits' },
      { value: '15', label: 'Brand Guides' },
      { value: '92%', label: 'Consistency Score' },
      { value: '3.2M', label: 'Brand Reach' },
    ]
  }
  return statSets[props.type] || []
})

function openTool(tool: any) {
  console.log('Opening tool:', tool.name)
  // Open tool in new panel or modal
}
</script>

<style scoped>
.consultant-toolbox {
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

/* Tool Grid */
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

/* Quick Stats */
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
