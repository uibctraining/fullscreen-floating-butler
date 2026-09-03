/**
 * 99Pages Agentic OS - Custom MCP Manager
 * ========================================
 * 
 * Allows users to add custom MCP tools through Agent assistance.
 * Users request new capabilities, and the Agent generates the MCP configuration.
 */

export interface MCPCapability {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  config: MCPConfig;
  isActive: boolean;
  createdAt: Date;
  usageCount: number;
}

export interface MCPConfig {
  type: 'api' | 'webhook' | 'script' | 'connector';
  endpoint?: string;
  method?: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  script?: string;
  auth?: {
    type: 'none' | 'api_key' | 'oauth' | 'basic';
    credentials?: Record<string, string>;
  };
}

export interface MCPRequest {
  userIntent: string;
  suggestedName?: string;
  category?: string;
}

export class CustomMCPManager {
  private storageKey = '99pages_custom_mcp';
  private capabilities: Map<string, MCPCapability> = new Map();

  constructor() {
    this.loadCapabilities();
  }

  /**
   * Load capabilities from localStorage
   */
  private loadCapabilities() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        for (const [id, cap] of Object.entries(data)) {
          this.capabilities.set(id, cap as MCPCapability);
        }
      } catch (e) {
        console.error('Failed to load MCP capabilities:', e);
      }
    }
  }

  /**
   * Save capabilities to localStorage
   */
  private saveCapabilities() {
    const data: Record<string, MCPCapability> = {};
    for (const [id, cap] of this.capabilities) {
      data[id] = cap;
    }
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Generate MCP configuration from user intent
   * This is the "magic" - Agent generates the config
   */
  async generateMCP(request: MCPRequest): Promise<MCPCapability> {
    // Analyze user intent and generate appropriate config
    const config = this.analyzeIntent(request.userIntent);
    
    const capability: MCPCapability = {
      id: this.generateId(),
      name: request.suggestedName || this.extractName(request.userIntent),
      description: request.userIntent,
      category: request.category || this.categorizeIntent(request.userIntent),
      icon: this.selectIcon(request.userIntent),
      config,
      isActive: true,
      createdAt: new Date(),
      usageCount: 0
    };

    this.capabilities.set(capability.id, capability);
    this.saveCapabilities();

    return capability;
  }

  /**
   * Analyze user intent and generate MCP config
   */
  private analyzeIntent(intent: string): MCPConfig {
    const lower = intent.toLowerCase();

    // API integration
    if (lower.includes('api') || lower.includes('webhook')) {
      return {
        type: 'api',
        endpoint: this.extractEndpoint(intent),
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      };
    }

    // Web scraping
    if (lower.includes('scrape') || lower.includes('website') || lower.includes('monitor')) {
      return {
        type: 'webhook',
        endpoint: this.extractUrl(intent),
        method: 'GET'
      };
    }

    // Script execution
    if (lower.includes('script') || lower.includes('automate') || lower.includes('run')) {
      return {
        type: 'script',
        script: this.generateScript(intent)
      };
    }

    // Default: connector
    return {
      type: 'connector',
      endpoint: '/api/mcp/custom/' + this.generateId()
    };
  }

  /**
   * Extract endpoint from intent
   */
  private extractEndpoint(intent: string): string {
    const urlMatch = intent.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : '/api/custom';
  }

  /**
   * Extract URL from intent
   */
  private extractUrl(intent: string): string {
    const urlMatch = intent.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : '';
  }

  /**
   * Extract name from intent
   */
  private extractName(intent: string): string {
    // Simple name extraction
    const words = intent.split(' ').slice(0, 3);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  /**
   * Categorize intent
   */
  private categorizeIntent(intent: string): string {
    const lower = intent.toLowerCase();
    
    if (lower.includes('email') || lower.includes('mail')) return 'communication';
    if (lower.includes('calendar') || lower.includes('schedule')) return 'productivity';
    if (lower.includes('social') || lower.includes('post')) return 'social';
    if (lower.includes('data') || lower.includes('analytics')) return 'data';
    if (lower.includes('file') || lower.includes('storage')) return 'storage';
    if (lower.includes('api') || lower.includes('webhook')) return 'integration';
    
    return 'custom';
  }

  /**
   * Select icon based on intent
   */
  private selectIcon(intent: string): string {
    const lower = intent.toLowerCase();
    
    if (lower.includes('email')) return '📧';
    if (lower.includes('calendar')) return '📅';
    if (lower.includes('social')) return '📱';
    if (lower.includes('data')) return '📊';
    if (lower.includes('file')) return '📁';
    if (lower.includes('api')) return '🔗';
    if (lower.includes('webhook')) return '🪝';
    if (lower.includes('script')) return '📜';
    
    return '⚡';
  }

  /**
   * Generate script from intent
   */
  private generateScript(intent: string): string {
    return `// Auto-generated script for: ${intent}
async function execute(params) {
  // TODO: Implement functionality
  return { success: true, message: 'Executed successfully' };
}`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return 'mcp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get all capabilities
   */
  getCapabilities(): MCPCapability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Get capability by ID
   */
  getCapability(id: string): MCPCapability | undefined {
    return this.capabilities.get(id);
  }

  /**
   * Update capability
   */
  updateCapability(id: string, updates: Partial<MCPCapability>): boolean {
    const cap = this.capabilities.get(id);
    if (!cap) return false;

    this.capabilities.set(id, { ...cap, ...updates });
    this.saveCapabilities();
    return true;
  }

  /**
   * Delete capability
   */
  deleteCapability(id: string): boolean {
    const deleted = this.capabilities.delete(id);
    if (deleted) {
      this.saveCapabilities();
    }
    return deleted;
  }

  /**
   * Toggle capability active state
   */
  toggleCapability(id: string): boolean {
    const cap = this.capabilities.get(id);
    if (!cap) return false;

    cap.isActive = !cap.isActive;
    this.saveCapabilities();
    return true;
  }

  /**
   * Execute capability
   */
  async executeCapability(id: string, params: Record<string, any> = {}): Promise<any> {
    const cap = this.capabilities.get(id);
    if (!cap || !cap.isActive) {
      throw new Error('Capability not found or inactive');
    }

    cap.usageCount++;
    this.saveCapabilities();

    // Execute based on type
    switch (cap.config.type) {
      case 'api':
        return this.executeAPI(cap.config, params);
      case 'webhook':
        return this.executeWebhook(cap.config, params);
      case 'script':
        return this.executeScript(cap.config, params);
      default:
        return { success: true, message: 'Executed' };
    }
  }

  /**
   * Execute API call
   */
  private async executeAPI(config: MCPConfig, params: Record<string, any>): Promise<any> {
    if (!config.endpoint) throw new Error('No endpoint configured');

    const response = await fetch(config.endpoint, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.method !== 'GET' ? JSON.stringify(params) : undefined
    });

    return response.json();
  }

  /**
   * Execute webhook
   */
  private async executeWebhook(config: MCPConfig, params: Record<string, any>): Promise<any> {
    if (!config.endpoint) throw new Error('No endpoint configured');

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    return response.json();
  }

  /**
   * Execute script
   */
  private async executeScript(config: MCPConfig, params: Record<string, any>): Promise<any> {
    if (!config.script) throw new Error('No script configured');

    // In production, this would use a sandboxed execution environment
    // For now, return a placeholder
    return { success: true, message: 'Script executed', params };
  }
}

// Export singleton
export const customMCPManager = new CustomMCPManager();
