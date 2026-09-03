/**
 * 99Pages Agentic OS - Agent Loop
 * ================================
 * 
 * Core agent loop that processes user input, manages tools,
 * and coordinates responses. Inspired by Codex and Kimi Desktop.
 */

import { sessionManager, type Session, type Message } from './session-manager';
import { permissionManager, type PermissionRequest } from './permission-manager';

// Types
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  model: string;
  permissions: string[];
  systemPrompt: string;
}

export interface ToolCall {
  id: string;
  tool: string;
  action: string;
  params: Record<string, any>;
  result?: any;
  error?: string;
  duration?: number;
}

export interface AgentResponse {
  content: string;
  toolCalls: ToolCall[];
  metadata: {
    agent: string;
    model: string;
    tokens: {
      input: number;
      output: number;
    };
    duration: number;
  };
}

export interface AgentLoopState {
  session: Session;
  currentAgent: AgentConfig;
  isProcessing: boolean;
  pendingToolCalls: ToolCall[];
  conversationHistory: Message[];
}

// Agent Loop Class
export class AgentLoop {
  private agents: Map<string, AgentConfig> = new Map();
  private state: AgentLoopState | null = null;
  private mcpHubUrl: string;

  constructor(mcpHubUrl: string) {
    this.mcpHubUrl = mcpHubUrl;
    this.loadDefaultAgents();
  }

  /**
   * Load default agent configurations
   */
  private loadDefaultAgents(): void {
    this.agents.set('friday', {
      id: 'friday',
      name: 'Friday',
      role: 'Main Assistant',
      model: 'mimo-v2.5-pro',
      permissions: ['all'],
      systemPrompt: `你是 Friday，99Pages Agentic OS 的主智能助手。
你的职责是帮助用户完成各种任务，调用合适的工具，提供准确的信息。
始终保持简洁高效的沟通风格。`
    });

    this.agents.set('researcher', {
      id: 'researcher',
      name: 'Researcher',
      role: 'Research & Analysis',
      model: 'mimo-v2.5-pro',
      permissions: ['web_search', 'data_analysis', 'file_read'],
      systemPrompt: `你是 Researcher，专注于研究和分析。
你擅长搜索信息、分析数据、提供深入的见解。`
    });

    this.agents.set('coder', {
      id: 'coder',
      name: 'Coder',
      role: 'Code Development',
      model: 'mimo-v2.5-pro',
      permissions: ['code_edit', 'terminal', 'file_operations'],
      systemPrompt: `你是 Coder，专注于代码开发。
你擅长编写、调试和优化代码。`
    });

    this.agents.set('writer', {
      id: 'writer',
      name: 'Writer',
      role: 'Content Creation',
      model: 'mimo-v2.5-pro',
      permissions: ['document_edit', 'file_read', 'web_search'],
      systemPrompt: `你是 Writer，专注于内容创作。
你擅长撰写文档、文章、报告等各类内容。`
    });

    this.agents.set('analyst', {
      id: 'analyst',
      name: 'Analyst',
      role: 'Data Analysis',
      model: 'mimo-v2.5-pro',
      permissions: ['data_analysis', 'chart_generation', 'file_read'],
      systemPrompt: `你是 Analyst，专注于数据分析。
你擅长处理数据、生成图表、提供洞察。`
    });
  }

  /**
   * Initialize agent loop with session
   */
  async initialize(userId: string, sessionId?: string): Promise<AgentLoopState> {
    let session: Session;

    if (sessionId) {
      const existing = await sessionManager.getSession(sessionId);
      if (!existing) {
        throw new Error(`Session ${sessionId} not found`);
      }
      session = existing;
    } else {
      session = await sessionManager.createSession(userId);
    }

    this.state = {
      session,
      currentAgent: this.agents.get('friday')!,
      isProcessing: false,
      pendingToolCalls: [],
      conversationHistory: session.messages
    };

    return this.state;
  }

  /**
   * Process user input
   */
  async processInput(input: string): Promise<AgentResponse> {
    if (!this.state) {
      throw new Error('Agent loop not initialized');
    }

    this.state.isProcessing = true;
    const startTime = Date.now();

    try {
      // Add user message to history
      await sessionManager.addMessage(
        this.state.session.id,
        'user',
        input
      );

      // Check permissions for any tool calls
      const permissionResult = await this.checkPermissions(input);
      if (!permissionResult.allowed) {
        return {
          content: `抱歉，我无法执行此操作：${permissionResult.reason}`,
          toolCalls: [],
          metadata: {
            agent: this.state.currentAgent.id,
            model: this.state.currentAgent.model,
            tokens: { input: 0, output: 0 },
            duration: Date.now() - startTime
          }
        };
      }

      // Process with LLM
      const response = await this.callLLM(input);

      // Execute tool calls if any
      const toolCalls = await this.executeToolCalls(response.toolCalls);

      // Add assistant message to history
      await sessionManager.addMessage(
        this.state.session.id,
        'assistant',
        response.content,
        {
          agent: this.state.currentAgent.id,
          tool: toolCalls.length > 0 ? toolCalls[0].tool : undefined
        }
      );

      this.state.isProcessing = false;

      return {
        content: response.content,
        toolCalls,
        metadata: {
          agent: this.state.currentAgent.id,
          model: this.state.currentAgent.model,
          tokens: response.tokens,
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      this.state.isProcessing = false;
      throw error;
    }
  }

  /**
   * Check permissions for input
   */
  private async checkPermissions(input: string): Promise<{ allowed: boolean; reason: string }> {
    // Extract potential tool calls from input
    const toolPatterns = [
      /use\s+(\w+)/i,
      /call\s+(\w+)/i,
      /execute\s+(\w+)/i,
      /run\s+(\w+)/i
    ];

    for (const pattern of toolPatterns) {
      const match = input.match(pattern);
      if (match) {
        const tool = match[1];
        const request: PermissionRequest = {
          userId: this.state!.session.userId,
          tool,
          action: 'execute',
          params: {},
          context: {
            timestamp: new Date(),
            userRole: permissionManager.getUserRole(this.state!.session.userId)
          }
        };

        const result = await permissionManager.checkPermission(request);
        return {
          allowed: result.allowed,
          reason: result.reason
        };
      }
    }

    // No tool call detected, allow
    return { allowed: true, reason: 'No tool call detected' };
  }

  /**
   * Call LLM (simulated)
   */
  private async callLLM(input: string): Promise<{
    content: string;
    toolCalls: ToolCall[];
    tokens: { input: number; output: number };
  }> {
    // In production, this would call the actual LLM API
    // For now, simulate a response

    const toolCalls: ToolCall[] = [];
    
    // Detect if tool call is needed
    if (input.toLowerCase().includes('search') || input.toLowerCase().includes('搜索')) {
      toolCalls.push({
        id: `tc_${Date.now()}`,
        tool: 'web_search',
        action: 'search',
        params: { query: input }
      });
    }

    return {
      content: `我收到了你的请求："${input}"。${toolCalls.length > 0 ? '我将使用工具来帮助你。' : '让我来帮你处理。'}`,
      toolCalls,
      tokens: {
        input: input.length,
        output: 100
      }
    };
  }

  /**
   * Execute tool calls
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolCall[]> {
    const results: ToolCall[] = [];

    for (const call of toolCalls) {
      const startTime = Date.now();

      try {
        // Call MCP Hub
        const result = await this.callMCPTool(call.tool, call.action, call.params);
        
        results.push({
          ...call,
          result,
          duration: Date.now() - startTime
        });
      } catch (error: any) {
        results.push({
          ...call,
          error: error.message,
          duration: Date.now() - startTime
        });
      }
    }

    return results;
  }

  /**
   * Call MCP tool via hub
   */
  private async callMCPTool(tool: string, action: string, params: any): Promise<any> {
    const response = await fetch(`${this.mcpHubUrl}/api/tools/${tool}/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`MCP tool call failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Switch agent
   */
  switchAgent(agentId: string): void {
    if (!this.state) {
      throw new Error('Agent loop not initialized');
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    this.state.currentAgent = agent;
  }

  /**
   * Get available agents
   */
  getAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get current state
   */
  getState(): AgentLoopState | null {
    return this.state;
  }

  /**
   * Add custom agent
   */
  addAgent(config: AgentConfig): void {
    this.agents.set(config.id, config);
  }

  /**
   * Remove agent
   */
  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Update agent
   */
  updateAgent(agentId: string, updates: Partial<AgentConfig>): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.set(agentId, { ...agent, ...updates });
    }
  }
}

// Export singleton
export const agentLoop = new AgentLoop(
  'https://skillhub.99pages.uk'
);
