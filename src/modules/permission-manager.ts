/**
 * 99Pages Agentic OS - Permission Rules System
 * ==============================================
 * 
 * Manages tool permissions, access control, and security rules.
 * Inspired by Codex's prefix_rule system.
 */

// Types
export type PermissionDecision = 'allow' | 'deny' | 'confirm';

export interface PermissionRule {
  id: string;
  name: string;
  description: string;
  pattern: string | RegExp;
  decision: PermissionDecision;
  conditions?: PermissionCondition[];
  priority: number;
  enabled: boolean;
}

export interface PermissionCondition {
  type: 'user_role' | 'time_range' | 'ip_range' | 'tool_category';
  value: string | string[];
}

export interface PermissionRequest {
  userId: string;
  tool: string;
  action: string;
  params: Record<string, any>;
  context: {
    ip?: string;
    timestamp: Date;
    userRole: string;
  };
}

export interface PermissionResult {
  allowed: boolean;
  decision: PermissionDecision;
  rule?: PermissionRule;
  reason: string;
  requiresConfirmation: boolean;
}

// Permission Manager Class
export class PermissionManager {
  private rules: PermissionRule[] = [];
  private userRoles: Map<string, string> = new Map();

  constructor() {
    this.loadDefaultRules();
  }

  /**
   * Load default permission rules
   */
  private loadDefaultRules(): void {
    this.rules = [
      // Tool access rules
      {
        id: 'allow-all-tools',
        name: 'Allow All Tools',
        description: 'Allow access to all MCP tools',
        pattern: /^tool:.*$/,
        decision: 'allow',
        priority: 100,
        enabled: true
      },
      {
        id: 'deny-dangerous-tools',
        name: 'Deny Dangerous Tools',
        description: 'Deny access to potentially dangerous tools',
        pattern: /^tool:(rm|delete|drop|truncate|format).*$/,
        decision: 'deny',
        priority: 200,
        enabled: true
      },
      {
        id: 'confirm-file-operations',
        name: 'Confirm File Operations',
        description: 'Require confirmation for file operations',
        pattern: /^tool:(file|fs|disk).*$/,
        decision: 'confirm',
        priority: 150,
        enabled: true
      },

      // MCP category rules
      {
        id: 'allow-productivity',
        name: 'Allow Productivity Tools',
        description: 'Allow access to productivity MCP tools',
        pattern: /^mcp:productivity:.*$/,
        decision: 'allow',
        priority: 100,
        enabled: true
      },
      {
        id: 'allow-communication',
        name: 'Allow Communication Tools',
        description: 'Allow access to communication MCP tools',
        pattern: /^mcp:communication:.*$/,
        decision: 'allow',
        priority: 100,
        enabled: true
      },
      {
        id: 'allow-creative',
        name: 'Allow Creative Tools',
        description: 'Allow access to creative MCP tools',
        pattern: /^mcp:creative:.*$/,
        decision: 'allow',
        priority: 100,
        enabled: true
      },
      {
        id: 'allow-finance',
        name: 'Allow Finance Tools',
        description: 'Allow access to finance MCP tools',
        pattern: /^mcp:finance:.*$/,
        decision: 'allow',
        priority: 100,
        enabled: true
      },

      // Admin rules
      {
        id: 'admin-full-access',
        name: 'Admin Full Access',
        description: 'Grant full access to admin users',
        pattern: /^.*$/,
        decision: 'allow',
        conditions: [
          { type: 'user_role', value: 'admin' }
        ],
        priority: 50,
        enabled: true
      },

      // Time-based rules
      {
        id: 'restrict-after-hours',
        name: 'Restrict After Hours',
        description: 'Restrict certain operations after business hours',
        pattern: /^tool:(finance|payment).*$/,
        decision: 'confirm',
        conditions: [
          { type: 'time_range', value: ['22:00', '06:00'] }
        ],
        priority: 180,
        enabled: true
      },

      // IP-based rules
      {
        id: 'allow-local-network',
        name: 'Allow Local Network',
        description: 'Allow all operations from local network',
        pattern: /^.*$/,
        decision: 'allow',
        conditions: [
          { type: 'ip_range', value: ['192.168.0.0/16', '10.0.0.0/8'] }
        ],
        priority: 80,
        enabled: true
      }
    ];
  }

  /**
   * Check permission for a request
   */
  async checkPermission(request: PermissionRequest): Promise<PermissionResult> {
    const resource = `tool:${request.tool}:${request.action}`;
    
    // Sort rules by priority (higher priority first)
    const sortedRules = [...this.rules]
      .filter(r => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      // Check pattern match
      const patternMatch = this.matchPattern(rule.pattern, resource);
      if (!patternMatch) continue;

      // Check conditions
      if (rule.conditions) {
        const conditionsMet = await this.checkConditions(rule.conditions, request);
        if (!conditionsMet) continue;
      }

      // Rule matched
      return {
        allowed: rule.decision === 'allow',
        decision: rule.decision,
        rule,
        reason: `Matched rule: ${rule.name}`,
        requiresConfirmation: rule.decision === 'confirm'
      };
    }

    // Default: deny
    return {
      allowed: false,
      decision: 'deny',
      reason: 'No matching rule found',
      requiresConfirmation: false
    };
  }

  /**
   * Match pattern against resource
   */
  private matchPattern(pattern: string | RegExp, resource: string): boolean {
    if (pattern instanceof RegExp) {
      return pattern.test(resource);
    }
    return resource.includes(pattern);
  }

  /**
   * Check conditions
   */
  private async checkConditions(
    conditions: PermissionCondition[],
    request: PermissionRequest
  ): Promise<boolean> {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'user_role':
          if (!this.checkUserRole(request.userId, condition.value)) {
            return false;
          }
          break;

        case 'time_range':
          if (!this.checkTimeRange(condition.value as string[])) {
            return false;
          }
          break;

        case 'ip_range':
          if (!this.checkIpRange(request.context.ip, condition.value as string[])) {
            return false;
          }
          break;

        case 'tool_category':
          if (!this.checkToolCategory(request.tool, condition.value)) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  /**
   * Check user role
   */
  private checkUserRole(userId: string, requiredRole: string | string[]): boolean {
    const userRole = this.userRoles.get(userId) || 'user';
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  }

  /**
   * Check time range
   */
  private checkTimeRange(range: string[]): boolean {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startHour, startMinute] = range[0].split(':').map(Number);
    const [endHour, endMinute] = range[1].split(':').map(Number);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Cross midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }

  /**
   * Check IP range
   */
  private checkIpRange(ip: string | undefined, ranges: string[]): boolean {
    if (!ip) return false;
    
    // Simple IP range check (in production, use proper CIDR matching)
    for (const range of ranges) {
      if (range.includes('/')) {
        // CIDR notation - simplified check
        const [network, bits] = range.split('/');
        // For now, just check if IP starts with network prefix
        if (ip.startsWith(network.split('.').slice(0, parseInt(bits) / 8).join('.'))) {
          return true;
        }
      } else if (ip === range) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check tool category
   */
  private checkToolCategory(tool: string, category: string | string[]): boolean {
    // This would check against MCP category mappings
    // For now, simple string matching
    if (Array.isArray(category)) {
      return category.some(c => tool.includes(c));
    }
    return tool.includes(category);
  }

  /**
   * Add a new rule
   */
  addRule(rule: PermissionRule): void {
    this.rules.push(rule);
  }

  /**
   * Remove a rule
   */
  removeRule(ruleId: string): void {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  /**
   * Update a rule
   */
  updateRule(ruleId: string, updates: Partial<PermissionRule>): void {
    const index = this.rules.findIndex(r => r.id === ruleId);
    if (index >= 0) {
      this.rules[index] = { ...this.rules[index], ...updates };
    }
  }

  /**
   * Set user role
   */
  setUserRole(userId: string, role: string): void {
    this.userRoles.set(userId, role);
  }

  /**
   * Get user role
   */
  getUserRole(userId: string): string {
    return this.userRoles.get(userId) || 'user';
  }

  /**
   * Get all rules
   */
  getRules(): PermissionRule[] {
    return [...this.rules];
  }

  /**
   * Get enabled rules
   */
  getEnabledRules(): PermissionRule[] {
    return this.rules.filter(r => r.enabled);
  }

  /**
   * Load rules from file
   */
  async loadRulesFromFile(filePath: string): Promise<void> {
    try {
      const data = await import(filePath);
      this.rules = data.default || data.rules || [];
    } catch (error) {
      console.error('Failed to load rules:', error);
    }
  }

  /**
   * Save rules to file
   */
  async saveRulesToFile(filePath: string): Promise<void> {
    const fs = await import('fs/promises');
    await fs.writeFile(filePath, JSON.stringify(this.rules, null, 2));
  }
}

// Export singleton
export const permissionManager = new PermissionManager();
