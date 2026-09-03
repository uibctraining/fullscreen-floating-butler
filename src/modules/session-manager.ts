/**
 * 99Pages Agentic OS - Session Manager
 * =====================================
 * 
 * Manages user sessions, conversation history, and session state.
 * Inspired by Codex's session management with JSONL indexing.
 */

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';

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
  private sessionsDir: string;
  private indexPath: string;
  private activeSessions: Map<string, Session> = new Map();

  constructor(baseDir: string) {
    this.sessionsDir = path.join(baseDir, 'sessions');
    this.indexPath = path.join(baseDir, 'session_index.jsonl');
  }

  /**
   * Initialize session manager
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.mkdir(path.join(this.sessionsDir, 'active'), { recursive: true });
    await fs.mkdir(path.join(this.sessionsDir, 'archived'), { recursive: true });
  }

  /**
   * Create a new session
   */
  async createSession(userId: string, title?: string): Promise<Session> {
    const session: Session = {
      id: uuidv4(),
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

    // Save to disk
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

    // Load from disk
    try {
      const sessionPath = path.join(this.sessionsDir, 'active', `${sessionId}.json`);
      const data = await fs.readFile(sessionPath, 'utf-8');
      const session = JSON.parse(data);
      this.activeSessions.set(sessionId, session);
      return session;
    } catch {
      return null;
    }
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
      id: uuidv4(),
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

    // Move to archived directory
    const activePath = path.join(this.sessionsDir, 'active', `${sessionId}.json`);
    const archivedPath = path.join(this.sessionsDir, 'archived', `${sessionId}.json`);

    await fs.writeFile(archivedPath, JSON.stringify(session, null, 2));
    await fs.unlink(activePath);

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
    const indexData = await fs.readFile(this.indexPath, 'utf-8');
    const lines = indexData.trim().split('\n').filter(Boolean);
    
    let sessions: SessionIndex[] = lines.map(line => JSON.parse(line));
    
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
   * Save session to disk
   */
  private async saveSession(session: Session): Promise<void> {
    const sessionPath = path.join(
      this.sessionsDir,
      'active',
      `${session.id}.json`
    );
    await fs.writeFile(sessionPath, JSON.stringify(session, null, 2));
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
    let lines: string[] = [];
    try {
      const data = await fs.readFile(this.indexPath, 'utf-8');
      lines = data.trim().split('\n').filter(Boolean);
    } catch {
      // File doesn't exist yet
    }

    // Update or add entry
    const existingIndex = lines.findIndex(line => {
      const entry = JSON.parse(line);
      return entry.id === session.id;
    });

    if (existingIndex >= 0) {
      lines[existingIndex] = JSON.stringify(indexEntry);
    } else {
      lines.push(JSON.stringify(indexEntry));
    }

    // Write back
    await fs.writeFile(this.indexPath, lines.join('\n') + '\n');
  }
}

// Export singleton
export const sessionManager = new SessionManager(
  process.env.SESSION_DIR || './data'
);
