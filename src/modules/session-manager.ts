/**
 * 99Pages Agentic OS - Session Manager (Browser Version)
 * ======================================================
 * 
 * Manages user sessions, conversation history, and session state.
 * Uses localStorage and IndexedDB for browser storage.
 */

// Types
export interface Session {
  id: string;
  userId: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  metadata: Record<string, any>;
  messages: Message[];
  context: SessionContext;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: Date;
  metadata?: {
    agent?: string;
    tool?: string;
    importance?: number;
    tokens?: number;
  };
}

export interface SessionContext {
  currentAgent: string;
  activeTools: string[];
  memoryRefs: string[];
  taskQueue: string[];
  userPreferences: Record<string, any>;
}

export interface SessionIndex {
  id: string;
  userId: string;
  title: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

// Session Manager Class
export class SessionManager {
  private storageKey = '99pages_sessions';
  private indexKey = '99pages_session_index';
  private activeSessions: Map<string, Session> = new Map();

  /**
   * Initialize session manager
   */
  async initialize(): Promise<void> {
    // Load existing sessions from localStorage
    const saved = localStorage.getItem(this.indexKey);
    if (saved) {
      try {
        // Sessions are loaded on demand
      } catch (e) {
        console.error('Failed to load session index:', e);
      }
    }
  }

  /**
   * Generate UUID
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Create a new session
   */
  async createSession(userId: string, title?: string): Promise<Session> {
    const session: Session = {
      id: this.generateId(),
      userId,
      title: title || `Session ${new Date().toISOString()}`,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      metadata: {},
      messages: [],
      context: {
        currentAgent: 'friday',
        activeTools: [],
        memoryRefs: [],
        taskQueue: [],
        userPreferences: {}
      }
    };

    // Save to memory
    this.activeSessions.set(session.id, session);

    // Save to localStorage
    await this.saveSession(session);
    await this.updateIndex(session);

    return session;
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<Session | null> {
    // Check memory first
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId)!;
    }

    // Load from localStorage
    try {
      const key = `${this.storageKey}_${sessionId}`;
      const data = localStorage.getItem(key);
      if (data) {
        const session = JSON.parse(data);
        this.activeSessions.set(sessionId, session);
        return session;
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }

    return null;
  }

  /**
   * Add message to session
   */
  async addMessage(
    sessionId: string,
    role: Message['role'],
    content: string,
    metadata?: Message['metadata']
  ): Promise<Message> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message: Message = {
      id: this.generateId(),
      role,
      content,
      timestamp: new Date(),
      metadata
    };

    session.messages.push(message);
    session.updatedAt = new Date();

    // Update session
    await this.saveSession(session);
    await this.updateIndex(session);

    return message;
  }

  /**
   * Get session messages
   */
  async getMessages(sessionId: string, limit?: number): Promise<Message[]> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return [];
    }

    if (limit) {
      return session.messages.slice(-limit);
    }

    return session.messages;
  }

  /**
   * Update session context
   */
  async updateContext(
    sessionId: string,
    updates: Partial<SessionContext>
  ): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.context = { ...session.context, ...updates };
    session.updatedAt = new Date();

    await this.saveSession(session);
  }

  /**
   * Pause session
   */
  async pauseSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'paused';
    session.updatedAt = new Date();

    await this.saveSession(session);
    await this.updateIndex(session);
  }

  /**
   * Resume session
   */
  async resumeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'active';
    session.updatedAt = new Date();
    session.expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000);

    await this.saveSession(session);
    await this.updateIndex(session);
  }

  /**
   * Complete session
   */
  async completeSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'completed';
    session.updatedAt = new Date();

    await this.saveSession(session);
    await this.updateIndex(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
  }

  /**
   * Archive session
   */
  async archiveSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.status = 'archived';
    session.updatedAt = new Date();

    await this.saveSession(session);
    await this.updateIndex(session);

    // Remove from active sessions
    this.activeSessions.delete(sessionId);
  }

  /**
   * List user sessions
   */
  async listSessions(
    userId: string,
    status?: Session['status'],
    limit?: number
  ): Promise<SessionIndex[]> {
    const saved = localStorage.getItem(this.indexKey);
    if (!saved) return [];

    let sessions: SessionIndex[] = JSON.parse(saved);

    // Filter by user
    sessions = sessions.filter(s => s.userId === userId);

    // Filter by status
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }

    // Sort by updated time (newest first)
    sessions.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Apply limit
    if (limit) {
      sessions = sessions.slice(0, limit);
    }

    return sessions;
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpired(): Promise<number> {
    const now = new Date();
    let cleaned = 0;

    for (const [id, session] of this.activeSessions) {
      if (session.expiresAt < now) {
        await this.archiveSession(id);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Save session to localStorage
   */
  private async saveSession(session: Session): Promise<void> {
    const key = `${this.storageKey}_${session.id}`;
    localStorage.setItem(key, JSON.stringify(session));
  }

  /**
   * Update session index
   */
  private async updateIndex(session: Session): Promise<void> {
    const indexEntry: SessionIndex = {
      id: session.id,
      userId: session.userId,
      title: session.title,
      status: session.status,
      messageCount: session.messages.length,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString()
    };

    // Read existing index
    let sessions: SessionIndex[] = [];
    const saved = localStorage.getItem(this.indexKey);
    if (saved) {
      sessions = JSON.parse(saved);
    }

    // Update or add entry
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
      sessions[existingIndex] = indexEntry;
    } else {
      sessions.push(indexEntry);
    }

    // Write back
    localStorage.setItem(this.indexKey, JSON.stringify(sessions));
  }
}

// Export singleton
export const sessionManager = new SessionManager();
