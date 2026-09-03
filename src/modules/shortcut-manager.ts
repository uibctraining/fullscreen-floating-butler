/**
 * 99Pages Agentic OS - Advanced Shortcuts System
 * ================================================
 * 
 * Keyboard shortcuts for power users and developers
 */

export interface Shortcut {
  id: string
  keys: string[]
  description: string
  category: string
  action: () => void
  enabled: boolean
}

export class ShortcutManager {
  private shortcuts: Map<string, Shortcut> = new Map()
  private pressedKeys: Set<string> = new Set()

  constructor() {
    this.init()
  }

  private init() {
    // Register default shortcuts
    this.registerDefaults()
    
    // Listen for keyboard events
    document.addEventListener('keydown', (e) => this.onKeyDown(e))
    document.addEventListener('keyup', (e) => this.onKeyUp(e))
  }

  private registerDefaults() {
    // Navigation shortcuts
    this.register({
      id: 'toggle-sidebar',
      keys: ['Ctrl', 'b'],
      description: 'Toggle sidebar',
      category: 'Navigation',
      action: () => this.emit('toggle-sidebar'),
      enabled: true
    })

    this.register({
      id: 'toggle-panel',
      keys: ['Ctrl', 'p'],
      description: 'Toggle panel',
      category: 'Navigation',
      action: () => this.emit('toggle-panel'),
      enabled: true
    })

    this.register({
      id: 'new-tab',
      keys: ['Ctrl', 't'],
      description: 'New tab',
      category: 'Navigation',
      action: () => this.emit('new-tab'),
      enabled: true
    })

    this.register({
      id: 'close-tab',
      keys: ['Ctrl', 'w'],
      description: 'Close tab',
      category: 'Navigation',
      action: () => this.emit('close-tab'),
      enabled: true
    })

    this.register({
      id: 'next-tab',
      keys: ['Ctrl', 'Tab'],
      description: 'Next tab',
      category: 'Navigation',
      action: () => this.emit('next-tab'),
      enabled: true
    })

    this.register({
      id: 'prev-tab',
      keys: ['Ctrl', 'Shift', 'Tab'],
      description: 'Previous tab',
      category: 'Navigation',
      action: () => this.emit('prev-tab'),
      enabled: true
    })

    // Panel shortcuts
    this.register({
      id: 'toggle-chat',
      keys: ['Ctrl', '1'],
      description: 'Toggle chat panel',
      category: 'Panels',
      action: () => this.emit('toggle-chat'),
      enabled: true
    })

    this.register({
      id: 'toggle-tasks',
      keys: ['Ctrl', '2'],
      description: 'Toggle tasks panel',
      category: 'Panels',
      action: () => this.emit('toggle-tasks'),
      enabled: true
    })

    this.register({
      id: 'toggle-notes',
      keys: ['Ctrl', '3'],
      description: 'Toggle notes panel',
      category: 'Panels',
      action: () => this.emit('toggle-notes'),
      enabled: true
    })

    this.register({
      id: 'toggle-terminal',
      keys: ['Ctrl', '`'],
      description: 'Toggle terminal',
      category: 'Panels',
      action: () => this.emit('toggle-terminal'),
      enabled: true
    })

    // Action shortcuts
    this.register({
      id: 'focus-input',
      keys: ['Ctrl', 'k'],
      description: 'Focus input',
      category: 'Actions',
      action: () => this.emit('focus-input'),
      enabled: true
    })

    this.register({
      id: 'toggle-voice',
      keys: ['Ctrl', 'm'],
      description: 'Toggle voice input',
      category: 'Actions',
      action: () => this.emit('toggle-voice'),
      enabled: true
    })

    this.register({
      id: 'save',
      keys: ['Ctrl', 's'],
      description: 'Save',
      category: 'Actions',
      action: () => this.emit('save'),
      enabled: true
    })

    this.register({
      id: 'search',
      keys: ['Ctrl', 'f'],
      description: 'Search',
      category: 'Actions',
      action: () => this.emit('search'),
      enabled: true
    })

    // Window shortcuts
    this.register({
      id: 'fullscreen',
      keys: ['F11'],
      description: 'Toggle fullscreen',
      category: 'Window',
      action: () => this.emit('fullscreen'),
      enabled: true
    })

    this.register({
      id: 'dev-tools',
      keys: ['F12'],
      description: 'Toggle developer tools',
      category: 'Window',
      action: () => this.emit('dev-tools'),
      enabled: true
    })

    this.register({
      id: 'reload',
      keys: ['Ctrl', 'r'],
      description: 'Reload',
      category: 'Window',
      action: () => this.emit('reload'),
      enabled: true
    })

    // Custom layout shortcuts
    this.register({
      id: 'customize-layout',
      keys: ['Ctrl', 'Shift', 'l'],
      description: 'Customize layout',
      category: 'Layout',
      action: () => this.emit('customize-layout'),
      enabled: true
    })

    this.register({
      id: 'reset-layout',
      keys: ['Ctrl', 'Shift', 'r'],
      description: 'Reset layout',
      category: 'Layout',
      action: () => this.emit('reset-layout'),
      enabled: true
    })
  }

  register(shortcut: Shortcut) {
    this.shortcuts.set(shortcut.id, shortcut)
  }

  unregister(id: string) {
    this.shortcuts.delete(id)
  }

  private onKeyDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key)

    // Check for matching shortcuts
    for (const shortcut of this.shortcuts.values()) {
      if (!shortcut.enabled) continue

      const matches = shortcut.keys.every(key => {
        if (key === 'Ctrl') return event.ctrlKey || event.metaKey
        if (key === 'Shift') return event.shiftKey
        if (key === 'Alt') return event.altKey
        return this.pressedKeys.has(key)
      })

      if (matches) {
        event.preventDefault()
        shortcut.action()
        break
      }
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key)
  }

  private emit(event: string) {
    window.dispatchEvent(new CustomEvent('shortcut', { detail: event }))
  }

  getShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values())
  }

  getShortcutsByCategory(): Record<string, Shortcut[]> {
    const categories: Record<string, Shortcut[]> = {}
    
    for (const shortcut of this.shortcuts.values()) {
      if (!categories[shortcut.category]) {
        categories[shortcut.category] = []
      }
      categories[shortcut.category].push(shortcut)
    }
    
    return categories
  }

  enable(id: string) {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) shortcut.enabled = true
  }

  disable(id: string) {
    const shortcut = this.shortcuts.get(id)
    if (shortcut) shortcut.enabled = false
  }
}

// Export singleton
export const shortcutManager = new ShortcutManager()
