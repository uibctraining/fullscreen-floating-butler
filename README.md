# 🖥️ Fullscreen Floating Butler

> A multi-layer HUD interface system with draggable panels, split screen, and real-time data visualization.

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Electron](https://img.shields.io/badge/electron-44.x-47848F)
![Vue](https://img.shields.io/badge/vue-3.x-4FC08D)
![Three.js](https://img.shields.io/badge/three.js-r160-049EF4)

## ✨ Features

### 6-Layer Architecture

```
┌─────────────────────────────────────────────────┐
│  Layer 1: Three.js HUD Background               │
│  - 3D particle systems                          │
│  - Radar sweep animations                       │
│  - Energy ring effects                          │
│  - Mouse-reactive camera                        │
├─────────────────────────────────────────────────┤
│  Layer 2: Dear ImGui Agent Panels               │
│  - Draggable floating panels                    │
│  - Resizable by corner handle                   │
│  - Collapse/expand support                      │
│  - Real-time data updates                       │
├─────────────────────────────────────────────────┤
│  Layer 3: Golden Layout Rich Media              │
│  - Split screen (horizontal/vertical)           │
│  - Tabbed interface                             │
│  - Browser, Video, Image, Markdown, Code        │
│  - Layout persistence                           │
├─────────────────────────────────────────────────┤
│  Layer 4: Vue Business UI                       │
│  - Chat interface                               │
│  - Agent avatar                                 │
│  - Quick actions                                │
├─────────────────────────────────────────────────┤
│  Layer 5: Composer (Persistent)                 │
│  - Always visible at bottom                     │
│  - Voice input                                  │
│  - Text input                                   │
├─────────────────────────────────────────────────┤
│  Layer 6: Electron Shell                        │
│  - Native window management                     │
│  - Custom title bar                             │
│  - System tray                                  │
└─────────────────────────────────────────────────┘
```

### Key Features

- 🎨 **HUD Background** - Three.js powered 3D holographic effects
- 🖱️ **Draggable Panels** - Move any panel by dragging the header
- 📏 **Resizable Panels** - Resize by dragging the corner handle
- 📌 **Collapse/Expand** - Minimize panels to save space
- 🔀 **Split Screen** - Horizontal or vertical split with draggable divider
- 💾 **Layout Persistence** - Save and restore panel layouts
- ⌨️ **Keyboard Shortcuts** - Quick access to common actions
- 🌐 **Rich Media** - Browser, Video, Image, Markdown, Code editors
- 🎤 **Voice Control** - Built-in speech recognition
- 📊 **Real-time Data** - Live system metrics and agent status

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/uibctraining/fullscreen-floating-butler.git
cd fullscreen-floating-butler

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Build Electron app (Windows)
npm run build:win

# Build Electron app (Linux)
npm run build:linux
```

## 📖 Usage

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Toggle split screen |
| `Ctrl+S` | Save layout |
| `Ctrl+O` | Load layout |
| `Ctrl+N` | New browser tab |
| `Ctrl+1-9` | Switch to tab N |

### Panel Operations

- **Move Panel**: Drag the header bar
- **Resize Panel**: Drag the bottom-right corner
- **Collapse Panel**: Click the `−` button
- **Close Panel**: Click the `✕` button
- **Bring to Front**: Click anywhere on the panel

### Split Screen

1. Click the `⊞` button in the tab bar
2. Drag the divider to resize panes
3. Drag tabs between panes
4. Click `⊟` to unsplit

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| 1 | Three.js | 3D HUD background effects |
| 2 | Vue 3 + CSS | Floating agent panels |
| 3 | Vue 3 + Dynamic Components | Rich media tabs |
| 4 | Vue 3 | Business UI components |
| 5 | Vue 3 | Persistent composer |
| 6 | Electron | Native desktop shell |

### Component Structure

```
src/
├── components/
│   ├── JarvisHUD.vue        # Three.js HUD background
│   ├── ImGuiPanel.vue       # Draggable agent panels
│   ├── GoldenLayout.vue     # Tabbed rich media layout
│   ├── TitleBar.vue         # Electron title bar
│   ├── FridayAvatar.vue     # Agent avatar
│   ├── ChatArea.vue         # Chat messages
│   ├── Composer.vue         # Input composer
│   ├── QuickActions.vue     # Quick action buttons
│   └── StatusBar.vue        # Bottom status bar
├── App.vue                  # Main application
├── main.ts                  # Entry point
└── style.css                # Global styles
```

## 🎨 Customization

### Adding New Panel Types

```typescript
// In GoldenLayout.vue
const MyCustomView = defineComponent({
  props: ['tab'],
  setup() {
    return () => h('div', { class: 'custom-view' }, [
      h('h1', 'My Custom Content')
    ])
  }
})

// Add to getContentView()
const views: Record<string, any> = {
  browser: BrowserView,
  video: VideoView,
  // ... add your custom view
  custom: MyCustomView
}
```

### Customizing HUD Effects

```typescript
// In JarvisHUD.vue
function createParticles() {
  // Modify particle count, colors, behavior
  const count = 5000  // More particles
  // ...
}
```

## 📦 Building

### Electron Builds

```bash
# Windows
npm run build:win

# Linux
npm run build:linux

# macOS
npm run build:mac
```

### Web Build

```bash
npm run build
# Output in dist/
```

## 🔧 Configuration

### Environment Variables

```env
# .env
VITE_API_URL=https://api.example.com
VITE_WS_URL=wss://ws.example.com
```

### Electron Configuration

```json
// package.json
{
  "build": {
    "appId": "com.yourapp.floating-butler",
    "productName": "Floating Butler",
    "mac": { "target": "dmg" },
    "win": { "target": "nsis" },
    "linux": { "target": "AppImage" }
  }
}
```

## 🤝 Integration

### With Cloud OS

```typescript
// Connect to Cloud OS backend
const cloudOS = new CloudOSClient({
  endpoint: 'https://opc.99pages.uk',
  apiKey: 'your-api-key'
})

// Send agent status to ImGui panel
cloudOS.on('agentStatus', (status) => {
  imguiPanel.value?.addLog('INFO', `Agent: ${status.message}`)
})
```

### With MCP Servers

```typescript
// Register MCP tools
const mcp = new MCPHub()
mcp.register('canva', { /* config */ })
mcp.register('capcut', { /* config */ })

// Open tool in Golden Layout
function openTool(toolId: string) {
  addTab('browser', 'left')
  browserUrl.value = mcp.getToolUrl(toolId)
}
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 👨‍💻 Developer

**Ng Tick Kee**
- GitHub: [@uibctraining](https://github.com/uibctraining)
- Website: [99pages.uk](https://99pages.uk)

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) - 3D graphics library
- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [Electron](https://www.electronjs.org/) - Desktop application framework
- [Dear ImGui](https://github.com/ocornut/imgui) - Immediate mode GUI inspiration

---

**Part of the [99Pages Agentic OS](https://99pages.uk) ecosystem**
