/**
 * 99Pages Agentic OS - Offline Support
 * =====================================
 * 
 * Handles offline detection, caching, and sync
 */

export interface OfflineState {
  isOnline: boolean
  lastOnline: Date | null
  pendingActions: OfflineAction[]
  cachedData: Map<string, any>
}

export interface OfflineAction {
  id: string
  type: string
  data: any
  timestamp: Date
  retries: number
}

export class OfflineManager {
  private state: OfflineState = {
    isOnline: navigator.onLine,
    lastOnline: navigator.onLine ? new Date() : null,
    pendingActions: [],
    cachedData: new Map()
  }

  private listeners: Set<(state: OfflineState) => void> = new Set()

  constructor() {
    this.init()
  }

  private init() {
    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())

    // Load pending actions from storage
    this.loadPendingActions()
  }

  private handleOnline() {
    this.state.isOnline = true
    this.state.lastOnline = new Date()
    this.notifyListeners()
    
    // Process pending actions
    this.processPendingActions()
  }

  private handleOffline() {
    this.state.isOnline = false
    this.notifyListeners()
  }

  /**
   * Check if currently online
   */
  isOnline(): boolean {
    return this.state.isOnline
  }

  /**
   * Get current state
   */
  getState(): OfflineState {
    return { ...this.state }
  }

  /**
   * Add listener for state changes
   */
  onStateChange(listener: (state: OfflineState) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
  }

  /**
   * Queue action for when back online
   */
  queueAction(type: string, data: any): string {
    const action: OfflineAction = {
      id: `action_${Date.now()}`,
      type,
      data,
      timestamp: new Date(),
      retries: 0
    }

    this.state.pendingActions.push(action)
    this.savePendingActions()
    
    return action.id
  }

  /**
   * Process pending actions
   */
  private async processPendingActions() {
    const actions = [...this.state.pendingActions]
    
    for (const action of actions) {
      try {
        await this.executeAction(action)
        this.removeAction(action.id)
      } catch (error) {
        action.retries++
        if (action.retries >= 3) {
          this.removeAction(action.id)
        }
      }
    }
  }

  /**
   * Execute a pending action
   */
  private async executeAction(action: OfflineAction): Promise<void> {
    // In production, this would call the appropriate API
    console.log('Executing offline action:', action.type, action.data)
  }

  /**
   * Remove action from queue
   */
  private removeAction(actionId: string) {
    this.state.pendingActions = this.state.pendingActions.filter(a => a.id !== actionId)
    this.savePendingActions()
  }

  /**
   * Save pending actions to localStorage
   */
  private savePendingActions() {
    try {
      localStorage.setItem('offline_actions', JSON.stringify(this.state.pendingActions))
    } catch (error) {
      console.error('Failed to save pending actions:', error)
    }
  }

  /**
   * Load pending actions from localStorage
   */
  private loadPendingActions() {
    try {
      const saved = localStorage.getItem('offline_actions')
      if (saved) {
        this.state.pendingActions = JSON.parse(saved)
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error)
    }
  }

  /**
   * Cache data for offline use
   */
  cacheData(key: string, data: any): void {
    this.state.cachedData.set(key, data)
    
    try {
      const cache = Object.fromEntries(this.state.cachedData)
      localStorage.setItem('offline_cache', JSON.stringify(cache))
    } catch (error) {
      console.error('Failed to cache data:', error)
    }
  }

  /**
   * Get cached data
   */
  getCachedData(key: string): any {
    return this.state.cachedData.get(key)
  }

  /**
   * Load cached data from storage
   */
  loadCachedData(): void {
    try {
      const saved = localStorage.getItem('offline_cache')
      if (saved) {
        const cache = JSON.parse(saved)
        this.state.cachedData = new Map(Object.entries(cache))
      }
    } catch (error) {
      console.error('Failed to load cached data:', error)
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.state.cachedData.clear()
    localStorage.removeItem('offline_cache')
  }

  /**
   * Get offline status message
   */
  getStatusMessage(): string {
    if (this.state.isOnline) {
      return 'Online'
    }

    if (this.state.lastOnline) {
      const diff = Date.now() - this.state.lastOnline.getTime()
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'Offline - just now'
      if (minutes < 60) return `Offline - ${minutes}m ago`
      
      const hours = Math.floor(minutes / 60)
      return `Offline - ${hours}h ago`
    }

    return 'Offline'
  }
}

// Export singleton
export const offlineManager = new OfflineManager()
