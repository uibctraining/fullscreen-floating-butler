/**
 * 99Pages Agentic OS - Extended MCP Tools
 * ========================================
 * 
 * Additional MCP integrations for productivity, creativity, and automation
 */

export interface MCPTool {
  id: string
  name: string
  category: string
  icon: string
  description: string
  endpoint: string
  isActive: boolean
  requiresAuth: boolean
}

export const EXTENDED_MCP_TOOLS: MCPTool[] = [
  // Productivity
  {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    icon: '📓',
    description: 'Notes, docs, and project management',
    endpoint: '/api/mcp/notion',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'trello',
    name: 'Trello',
    category: 'productivity',
    icon: '📋',
    description: 'Kanban boards and task management',
    endpoint: '/api/mcp/trello',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'productivity',
    icon: '✅',
    description: 'Team project management',
    endpoint: '/api/mcp/asana',
    isActive: true,
    requiresAuth: true
  },

  // Communication
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    icon: '💼',
    description: 'Team messaging and channels',
    endpoint: '/api/mcp/slack',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'communication',
    icon: '🎮',
    description: 'Voice and text chat',
    endpoint: '/api/mcp/discord',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'communication',
    icon: '✈️',
    description: 'Messaging and bots',
    endpoint: '/api/mcp/telegram',
    isActive: true,
    requiresAuth: true
  },

  // Creative
  {
    id: 'figma',
    name: 'Figma',
    category: 'creative',
    icon: '🖌️',
    description: 'Design and prototyping',
    endpoint: '/api/mcp/figma',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'canva',
    name: 'Canva',
    category: 'creative',
    icon: '🎨',
    description: 'Graphic design platform',
    endpoint: '/api/mcp/canva',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'capcut',
    name: 'CapCut',
    category: 'creative',
    icon: '🎬',
    description: 'Video editing',
    endpoint: '/api/mcp/capcut',
    isActive: true,
    requiresAuth: true
  },

  // Finance
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'finance',
    icon: '💳',
    description: 'Payment processing',
    endpoint: '/api/mcp/stripe',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: 'finance',
    icon: '💰',
    description: 'Online payments',
    endpoint: '/api/mcp/paypal',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'wise',
    name: 'Wise',
    category: 'finance',
    icon: '🌍',
    description: 'International transfers',
    endpoint: '/api/mcp/wise',
    isActive: true,
    requiresAuth: true
  },

  // Development
  {
    id: 'github',
    name: 'GitHub',
    category: 'development',
    icon: '🐙',
    description: 'Code hosting and collaboration',
    endpoint: '/api/mcp/github',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'development',
    icon: '🦊',
    description: 'DevOps platform',
    endpoint: '/api/mcp/gitlab',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'development',
    icon: '▲',
    description: 'Frontend deployment',
    endpoint: '/api/mcp/vercel',
    isActive: true,
    requiresAuth: true
  },

  // Data & Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    category: 'data',
    icon: '📊',
    description: 'Website analytics',
    endpoint: '/api/mcp/google-analytics',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'data',
    icon: '📈',
    description: 'Product analytics',
    endpoint: '/api/mcp/mixpanel',
    isActive: true,
    requiresAuth: true
  },

  // AI Tools
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    icon: '🤖',
    description: 'GPT models and DALL-E',
    endpoint: '/api/mcp/openai',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'ai',
    icon: '🧠',
    description: 'Claude models',
    endpoint: '/api/mcp/anthropic',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'stability',
    name: 'Stability AI',
    category: 'ai',
    icon: '🎨',
    description: 'Image generation',
    endpoint: '/api/mcp/stability',
    isActive: true,
    requiresAuth: true
  },

  // Storage
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'storage',
    icon: '📁',
    description: 'Cloud storage',
    endpoint: '/api/mcp/google-drive',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    icon: '📦',
    description: 'File hosting',
    endpoint: '/api/mcp/dropbox',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'storage',
    icon: '☁️',
    description: 'Microsoft cloud storage',
    endpoint: '/api/mcp/onedrive',
    isActive: true,
    requiresAuth: true
  },

  // Marketing
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    icon: '🐵',
    description: 'Email marketing',
    endpoint: '/api/mcp/mailchimp',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'marketing',
    icon: '🎯',
    description: 'CRM and marketing',
    endpoint: '/api/mcp/hubspot',
    isActive: true,
    requiresAuth: true
  },

  // Education
  {
    id: 'google-classroom',
    name: 'Google Classroom',
    category: 'education',
    icon: '🏫',
    description: 'Learning management',
    endpoint: '/api/mcp/google-classroom',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'canvas-lms',
    name: 'Canvas LMS',
    category: 'education',
    icon: '🎓',
    description: 'Learning platform',
    endpoint: '/api/mcp/canvas-lms',
    isActive: true,
    requiresAuth: true
  },

  // Utilities
  {
    id: 'google-translate',
    name: 'Google Translate',
    category: 'utilities',
    icon: '🌍',
    description: 'Language translation',
    endpoint: '/api/mcp/google-translate',
    isActive: true,
    requiresAuth: false
  },
  {
    id: 'wolfram-alpha',
    name: 'Wolfram Alpha',
    category: 'utilities',
    icon: '🔬',
    description: 'Computational knowledge',
    endpoint: '/api/mcp/wolfram-alpha',
    isActive: true,
    requiresAuth: true
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'utilities',
    icon: '⚡',
    description: 'Workflow automation',
    endpoint: '/api/mcp/zapier',
    isActive: true,
    requiresAuth: true
  }
]

export class MCPRegistry {
  private tools: Map<string, MCPTool> = new Map()

  constructor() {
    // Register all extended tools
    EXTENDED_MCP_TOOLS.forEach(tool => {
      this.tools.set(tool.id, tool)
    })
  }

  /**
   * Get all tools
   */
  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values())
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: string): MCPTool[] {
    return Array.from(this.tools.values()).filter(t => t.category === category)
  }

  /**
   * Get tool by ID
   */
  getTool(id: string): MCPTool | undefined {
    return this.tools.get(id)
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set(Array.from(this.tools.values()).map(t => t.category))
    return Array.from(categories)
  }

  /**
   * Search tools
   */
  searchTools(query: string): MCPTool[] {
    const lower = query.toLowerCase()
    return Array.from(this.tools.values()).filter(tool =>
      tool.name.toLowerCase().includes(lower) ||
      tool.description.toLowerCase().includes(lower) ||
      tool.category.toLowerCase().includes(lower)
    )
  }

  /**
   * Toggle tool active state
   */
  toggleTool(id: string): boolean {
    const tool = this.tools.get(id)
    if (tool) {
      tool.isActive = !tool.isActive
      return true
    }
    return false
  }
}

// Export singleton
export const mcpRegistry = new MCPRegistry()
