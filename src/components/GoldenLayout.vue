<template>
  <div class="golden-layout" v-if="visible">
    <!-- Split screen container -->
    <div class="split-container" :class="splitMode">
      <!-- Left/Top pane -->
      <div class="split-pane" :style="paneStyle.left">
        <!-- Tab bar -->
        <div class="tab-bar">
          <div
            v-for="tab in leftTabs"
            :key="tab.id"
            class="tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
            draggable="true"
            @dragstart="onTabDragStart($event, tab)"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-title">{{ tab.title }}</span>
            <button class="tab-close" @click.stop="closeTab(tab.id)">✕</button>
          </div>
          <button class="tab-add" @click="showNewTabMenu = !showNewTabMenu">+</button>

          <!-- New tab menu -->
          <div class="new-tab-menu" v-if="showNewTabMenu">
            <div class="menu-section">Media</div>
            <button @click="addTab('browser'); showNewTabMenu = false">🌐 Browser</button>
            <button @click="addTab('video'); showNewTabMenu = false">🎬 Video</button>
            <button @click="addTab('image'); showNewTabMenu = false">🖼️ Image</button>
            <div class="menu-section">Editor</div>
            <button @click="addTab('markdown'); showNewTabMenu = false">📝 Markdown</button>
            <button @click="addTab('code'); showNewTabMenu = false">💻 Code</button>
            <button @click="addTab('notes'); showNewTabMenu = false">📒 Notes</button>
            <div class="menu-section">Tools</div>
            <button @click="addTab('files'); showNewTabMenu = false">📁 Files</button>
            <button @click="addTab('calendar'); showNewTabMenu = false">📅 Calendar</button>
            <button @click="addTab('calculator'); showNewTabMenu = false">🔢 Calculator</button>
            <button @click="addTab('canvas'); showNewTabMenu = false">🎨 Canvas</button>
            <div class="menu-section">Meeting</div>
            <button @click="addTab('zoom'); showNewTabMenu = false">📹 Zoom</button>
            <button @click="addTab('meet'); showNewTabMenu = false">🎥 Google Meet</button>
            <div class="menu-section">Social</div>
            <button @click="addTab('whatsapp'); showNewTabMenu = false">💬 WhatsApp</button>
            <button @click="addTab('facebook'); showNewTabMenu = false">📘 Facebook</button>
            <div class="menu-section">Agent</div>
            <button @click="addTab('inbox'); showNewTabMenu = false">📥 Activity Inbox</button>
            <div class="menu-section">Creative</div>
            <button @click="addTab('capcut'); showNewTabMenu = false">🎬 CapCut</button>
            <button @click="addTab('canva'); showNewTabMenu = false">🎨 Canva</button>
            <div class="menu-section">Location</div>
            <button @click="addTab('map'); showNewTabMenu = false">🗺️ Map</button>
          </div>

          <div class="tab-actions">
            <button class="action-btn" @click="toggleSplit" :title="splitMode === 'none' ? 'Split' : 'Unsplit'">
              {{ splitMode === 'none' ? '⊞' : '⊟' }}
            </button>
            <button class="action-btn" @click="saveLayout" title="Save Layout">💾</button>
            <button class="action-btn" @click="loadLayout" title="Load Layout">📂</button>
          </div>
        </div>

        <!-- Content area -->
        <div class="content-area"
          @dragover.prevent
          @drop="onDrop($event, 'left')"
        >
          <component :is="getContentView(currentTab)" :tab="currentTab" />
        </div>
      </div>

      <!-- Split divider -->
      <div
        v-if="splitMode !== 'none'"
        class="split-divider"
        :class="splitMode"
        @mousedown="startResizeSplit"
      />

      <!-- Right/Bottom pane -->
      <div v-if="splitMode !== 'none'" class="split-pane" :style="paneStyle.right">
        <div class="tab-bar">
          <div
            v-for="tab in rightTabs"
            :key="tab.id"
            class="tab"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-icon">{{ tab.icon }}</span>
            <span class="tab-title">{{ tab.title }}</span>
            <button class="tab-close" @click.stop="closeTab(tab.id)">✕</button>
          </div>
        </div>
        <div class="content-area"
          @dragover.prevent
          @drop="onDrop($event, 'right')"
        >
          <component :is="getContentView(getTabById(rightActiveTab))" :tab="getTabById(rightActiveTab)" />
        </div>
      </div>
    </div>

    <!-- Keyboard shortcuts hint -->
    <div class="shortcuts-hint" v-if="showShortcuts">
      <span>Ctrl+B: Split</span>
      <span>Ctrl+S: Save</span>
      <span>Ctrl+O: Load</span>
      <span>Ctrl+N: New Tab</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent, h } from 'vue'

const visible = ref(true)
const showNewTabMenu = ref(false)
const showShortcuts = ref(false)

// Tab interface
interface Tab {
  id: string
  type: 'browser' | 'video' | 'image' | 'markdown' | 'code' | 'files' | 'calendar' | 'notes' | 'calculator' | 'canvas' | 'zoom' | 'meet' | 'whatsapp' | 'facebook' | 'inbox' | 'capcut' | 'canva' | 'map'
  title: string
  icon: string
  pane: 'left' | 'right'
}
// State
const tabs = ref<Tab[]>([
  { id: 'home', type: 'browser', title: 'Home', icon: '🌐', pane: 'left' }
])
const activeTab = ref('home')
const rightActiveTab = ref('')
const splitMode = ref<'none' | 'horizontal' | 'vertical'>('none')
const splitPosition = ref(50)

// Computed
const leftTabs = computed(() => tabs.value.filter(t => t.pane === 'left'))
const rightTabs = computed(() => tabs.value.filter(t => t.pane === 'right'))
const currentTab = computed(() => tabs.value.find(t => t.id === activeTab.value))

const paneStyle = computed(() => ({
  left: splitMode.value === 'none'
    ? { flex: 1 }
    : splitMode.value === 'horizontal'
      ? { width: `${splitPosition.value}%` }
      : { height: `${splitPosition.value}%` },
  right: splitMode.value === 'none'
    ? { display: 'none' }
    : splitMode.value === 'horizontal'
      ? { width: `${100 - splitPosition.value}%` }
      : { height: `${100 - splitPosition.value}%` }
}))

// ============ Content Views ============

const BrowserView = defineComponent({
  props: ['tab'],
  setup() {
    const url = ref('https://99pages.uk')
    return () => h('div', { class: 'browser-view' }, [
      h('div', { class: 'browser-toolbar' }, [
        h('input', {
          class: 'browser-url',
          value: url.value,
          onInput: (e: Event) => url.value = (e.target as HTMLInputElement).value,
          onKeydown: (e: KeyboardEvent) => e.key === 'Enter' && navigate()
        })
      ]),
      url.value
        ? h('iframe', { src: url.value, class: 'browser-frame', sandbox: 'allow-scripts allow-same-origin' })
        : h('div', { class: 'browser-empty' }, 'Enter URL')
    ])
  }
})

const VideoView = defineComponent({
  props: ['tab'],
  setup() {
    const url = ref('')
    return () => h('div', { class: 'video-view' }, [
      url.value
        ? h('video', { src: url.value, controls: true, class: 'video-player' })
        : h('div', { class: 'video-empty' }, [
            h('span', { class: 'video-icon' }, '🎬'),
            h('input', {
              class: 'video-input',
              placeholder: 'Video URL...',
              value: url.value,
              onInput: (e: Event) => url.value = (e.target as HTMLInputElement).value
            })
          ])
    ])
  }
})

const ImageView = defineComponent({
  props: ['tab'],
  setup() {
    const url = ref('')
    return () => h('div', { class: 'image-view' }, [
      url.value
        ? h('img', { src: url.value, class: 'image-display' })
        : h('div', { class: 'image-empty' }, [
            h('span', { class: 'image-icon' }, '🖼️'),
            h('input', {
              class: 'image-input',
              placeholder: 'Image URL...',
              value: url.value,
              onInput: (e: Event) => url.value = (e.target as HTMLInputElement).value
            })
          ])
    ])
  }
})

const MarkdownView = defineComponent({
  props: ['tab'],
  setup() {
    const content = ref('# Welcome\n\nStart writing...')
    return () => h('div', { class: 'markdown-split' }, [
      h('textarea', {
        class: 'markdown-editor',
        value: content.value,
        onInput: (e: Event) => content.value = (e.target as HTMLTextAreaElement).value
      }),
      h('div', { class: 'markdown-preview', innerHTML: content.value })
    ])
  }
})

const CodeView = defineComponent({
  props: ['tab'],
  setup() {
    const code = ref('console.log("Hello!");')
    const output = ref('')
    return () => h('div', { class: 'code-view' }, [
      h('div', { class: 'code-toolbar' }, [
        h('button', {
          class: 'code-btn',
          onClick: () => { try { output.value = String(eval(code.value)) } catch(e: any) { output.value = e.message } }
        }, '▶ Run')
      ]),
      h('textarea', {
        class: 'code-editor',
        value: code.value,
        onInput: (e: Event) => code.value = (e.target as HTMLTextAreaElement).value
      }),
      output.value ? h('div', { class: 'code-output' }, [h('pre', output.value)]) : null
    ])
  }
})

// ============ NEW PANEL TYPES ============


const FilesView = defineComponent({
  props: ['tab'],
  setup() {
    const currentPath = ref('/home/user')
    const files = ref([
      { name: 'Documents', type: 'folder', icon: '📁' },
      { name: 'Downloads', type: 'folder', icon: '📁' },
      { name: 'Pictures', type: 'folder', icon: '📁' },
      { name: 'Music', type: 'folder', icon: '📁' },
      { name: 'Videos', type: 'folder', icon: '📁' },
      { name: 'Projects', type: 'folder', icon: '📁' },
      { name: 'readme.md', type: 'file', icon: '📄', size: '2.4 KB' },
      { name: 'config.json', type: 'file', icon: '⚙️', size: '1.1 KB' },
      { name: 'notes.txt', type: 'file', icon: '📝', size: '456 B' },
    ])
    
    return () => h('div', { class: 'files-view' }, [
      h('div', { class: 'files-toolbar' }, [
        h('button', { class: 'files-btn' }, '← Back'),
        h('span', { class: 'files-path' }, currentPath.value)
      ]),
      h('div', { class: 'files-list' }, 
        files.value.map((file, i) => h('div', { 
          key: i, 
          class: 'file-item',
          onDblclick: () => {
            if (file.type === 'folder') {
              currentPath.value += '/' + file.name
            }
          }
        }, [
          h('span', { class: 'file-icon' }, file.icon),
          h('span', { class: 'file-name' }, file.name),
          file.size ? h('span', { class: 'file-size' }, file.size) : null
        ]))
      )
    ])
  }
})

const CalendarView = defineComponent({
  props: ['tab'],
  setup() {
    const today = new Date()
    const currentMonth = ref(today.getMonth())
    const currentYear = ref(today.getFullYear())
    const selectedDate = ref(today.getDate())
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    const events = ref([
      { date: 15, title: 'Team Meeting', time: '10:00 AM' },
      { date: 15, title: 'Lunch with Client', time: '12:30 PM' },
      { date: 22, title: 'Project Deadline', time: 'All Day' },
      { date: 28, title: 'Review Session', time: '3:00 PM' },
    ])
    
    function getDaysInMonth(month: number, year: number) {
      return new Date(year, month + 1, 0).getDate()
    }
    
    function getFirstDayOfMonth(month: number, year: number) {
      return new Date(year, month, 1).getDay()
    }
    
    const days = computed(() => {
      const totalDays = getDaysInMonth(currentMonth.value, currentYear.value)
      const firstDay = getFirstDayOfMonth(currentMonth.value, currentYear.value)
      const result = []
      
      for (let i = 0; i < firstDay; i++) {
        result.push({ day: 0, events: [] })
      }
      
      for (let i = 1; i <= totalDays; i++) {
        result.push({
          day: i,
          events: events.value.filter(e => e.date === i)
        })
      }
      
      return result
    })
    
    return () => h('div', { class: 'calendar-view' }, [
      h('div', { class: 'calendar-header' }, [
        h('button', { 
          class: 'cal-nav',
          onClick: () => {
            if (currentMonth.value === 0) {
              currentMonth.value = 11
              currentYear.value--
            } else {
              currentMonth.value--
            }
          }
        }, '←'),
        h('span', { class: 'cal-title' }, `${monthNames[currentMonth.value]} ${currentYear.value}`),
        h('button', {
          class: 'cal-nav',
          onClick: () => {
            if (currentMonth.value === 11) {
              currentMonth.value = 0
              currentYear.value++
            } else {
              currentMonth.value++
            }
          }
        }, '→')
      ]),
      h('div', { class: 'calendar-days-header' },
        dayNames.map(d => h('div', { class: 'cal-day-name' }, d))
      ),
      h('div', { class: 'calendar-grid' },
        days.value.map((d) => h('div', {
          class: `cal-day ${d.day === selectedDate.value ? 'selected' : ''} ${d.events.length > 0 ? 'has-events' : ''}`,
          onClick: () => { if (d.day > 0) selectedDate.value = d.day }
        }, [
          d.day > 0 ? h('span', { class: 'cal-day-num' }, d.day) : null,
          d.events.length > 0 ? h('span', { class: 'cal-event-dot' }) : null
        ]))
      ),
      h('div', { class: 'calendar-events' }, [
        h('div', { class: 'events-title' }, `Events on ${monthNames[currentMonth.value]} ${selectedDate.value}`),
        ...events.value
          .filter(e => e.date === selectedDate.value)
          .map((e, i) => h('div', { key: i, class: 'event-item' }, [
            h('span', { class: 'event-time' }, e.time),
            h('span', { class: 'event-title' }, e.title)
          ]))
      ])
    ])
  }
})

const NotesView = defineComponent({
  props: ['tab'],
  setup() {
    const notes = ref([
      { id: 1, title: 'Welcome Note', content: 'Welcome to 99Pages Notes!', date: 'Today' },
      { id: 2, title: 'Shopping List', content: '- Milk\n- Bread\n- Eggs', date: 'Yesterday' },
      { id: 3, title: 'Project Ideas', content: '1. Build MCP integration\n2. Create HUD interface', date: '2 days ago' },
    ])
    const activeNote = ref(notes.value[0])
    
    return () => h('div', { class: 'notes-view' }, [
      h('div', { class: 'notes-sidebar' }, [
        h('button', { 
          class: 'notes-new-btn',
          onClick: () => {
            const newNote = { id: Date.now(), title: 'New Note', content: '', date: 'Just now' }
            notes.value.unshift(newNote)
            activeNote.value = newNote
          }
        }, '+ New Note'),
        ...notes.value.map((note, i) => h('div', {
          key: i,
          class: `notes-item ${activeNote.value?.id === note.id ? 'active' : ''}`,
          onClick: () => activeNote.value = note
        }, [
          h('div', { class: 'notes-item-title' }, note.title),
          h('div', { class: 'notes-item-date' }, note.date)
        ]))
      ]),
      h('div', { class: 'notes-editor' }, [
        h('input', {
          class: 'notes-title-input',
          value: activeNote.value?.title || '',
          onInput: (e: Event) => {
            if (activeNote.value) activeNote.value.title = (e.target as HTMLInputElement).value
          }
        }),
        h('textarea', {
          class: 'notes-content-input',
          value: activeNote.value?.content || '',
          onInput: (e: Event) => {
            if (activeNote.value) activeNote.value.content = (e.target as HTMLTextAreaElement).value
          }
        })
      ])
    ])
  }
})

const CalculatorView = defineComponent({
  props: ['tab'],
  setup() {
    const display = ref('0')
    const previousValue = ref<number | null>(null)
    const operation = ref<string | null>(null)
    const resetNext = ref(false)
    
    function inputNumber(num: string) {
      if (resetNext.value) {
        display.value = num
        resetNext.value = false
      } else {
        display.value = display.value === '0' ? num : display.value + num
      }
    }
    
    function inputOperation(op: string) {
      const current = parseFloat(display.value)
      if (previousValue.value !== null && operation.value) {
        const result = calculate(previousValue.value, current, operation.value)
        display.value = String(result)
        previousValue.value = result
      } else {
        previousValue.value = current
      }
      operation.value = op
      resetNext.value = true
    }
    
    function calculate(a: number, b: number, op: string): number {
      switch (op) {
        case '+': return a + b
        case '-': return a - b
        case '×': return a * b
        case '÷': return b !== 0 ? a / b : 0
        default: return b
      }
    }
    
    function equals() {
      if (previousValue.value !== null && operation.value) {
        const current = parseFloat(display.value)
        const result = calculate(previousValue.value, current, operation.value)
        display.value = String(result)
        previousValue.value = null
        operation.value = null
        resetNext.value = true
      }
    }
    
    function clear() {
      display.value = '0'
      previousValue.value = null
      operation.value = null
      resetNext.value = false
    }
    
    const buttons = [
      ['C', '±', '%', '÷'],
      ['7', '8', '9', '×'],
      ['4', '5', '6', '-'],
      ['1', '2', '3', '+'],
      ['0', '.', '=']
    ]
    
    return () => h('div', { class: 'calculator-view' }, [
      h('div', { class: 'calc-display' }, display.value),
      h('div', { class: 'calc-buttons' },
        buttons.map((row, i) => h('div', { key: i, class: 'calc-row' },
          row.map((btn, j) => h('button', {
            key: j,
            class: `calc-btn ${['÷', '×', '-', '+', '='].includes(btn) ? 'operator' : ''} ${btn === '0' ? 'zero' : ''}`,
            onClick: () => {
              if (btn === 'C') clear()
              else if (btn === '=') equals()
              else if (['÷', '×', '-', '+'].includes(btn)) inputOperation(btn)
              else inputNumber(btn)
            }
          }, btn))
        ))
      )
    ])
  }
})

const CanvasView = defineComponent({
  props: ['tab'],
  setup() {
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    const isDrawing = ref(false)
    const color = ref('#00d4ff')
    const lineWidth = ref(3)
    let lastX = 0
    let lastY = 0
    
    function startDraw(e: MouseEvent) {
      isDrawing.value = true
      const canvas = canvasRef.value
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      lastX = e.clientX - rect.left
      lastY = e.clientY - rect.top
    }
    
    function draw(e: MouseEvent) {
      if (!isDrawing.value) return
      const canvas = canvasRef.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = color.value
      ctx.lineWidth = lineWidth.value
      ctx.lineCap = 'round'
      ctx.stroke()
      
      lastX = x
      lastY = y
    }
    
    function stopDraw() {
      isDrawing.value = false
    }
    
    function clearCanvas() {
      const canvas = canvasRef.value
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    
    return () => h('div', { class: 'canvas-view' }, [
      h('div', { class: 'canvas-toolbar' }, [
        h('input', {
          type: 'color',
          value: color.value,
          onInput: (e: Event) => color.value = (e.target as HTMLInputElement).value,
          class: 'color-picker'
        }),
        h('input', {
          type: 'range',
          min: '1',
          max: '20',
          value: String(lineWidth.value),
          onInput: (e: Event) => lineWidth.value = parseInt((e.target as HTMLInputElement).value),
          class: 'line-width'
        }),
        h('button', { class: 'canvas-btn', onClick: clearCanvas }, '🗑️ Clear')
      ]),
      h('canvas', {
        ref: canvasRef,
        class: 'drawing-canvas',
        width: 800,
        height: 600,
        onMousedown: startDraw,
        onMousemove: draw,
        onMouseup: stopDraw,
        onMouseleave: stopDraw
      })
    ])
  }
})

// ============ View Registry ============

// ============ MEETING PANELS ============

const ZoomView = defineComponent({
  props: ["tab"],
  setup() {
    const meetingUrl = ref("")
    const meetingId = ref("")
    const isJoined = ref(false)
    
    function joinMeeting() {
      if (meetingId.value) {
        meetingUrl.value = `https://zoom.us/j/${meetingId.value}`
        isJoined.value = true
      }
    }
    
    return () => h("div", { class: "meeting-view" }, [
      !isJoined.value
        ? h("div", { class: "meeting-join" }, [
            h("div", { class: "meeting-icon" }, "📹"),
            h("h2", { class: "meeting-title" }, "Zoom Meeting"),
            h("input", {
              class: "meeting-input",
              placeholder: "Meeting ID (e.g. 123 456 7890)",
              value: meetingId.value,
              onInput: (e: Event) => meetingId.value = (e.target as HTMLInputElement).value,
              onKeydown: (e: KeyboardEvent) => e.key === "Enter" && joinMeeting()
            }),
            h("button", {
              class: "meeting-btn",
              onClick: joinMeeting
            }, "Join Meeting"),
            h("div", { class: "meeting-links" }, [
              h("a", { href: "https://zoom.us/start", target: "_blank" }, "Start a new meeting"),
              h("a", { href: "https://zoom.us/schedule", target: "_blank" }, "Schedule a meeting")
            ])
          ])
        : h("div", { class: "meeting-container" }, [
            h("div", { class: "meeting-toolbar" }, [
              h("span", { class: "meeting-status" }, "Meeting in progress"),
              h("button", {
                class: "meeting-leave",
                onClick: () => { isJoined.value = false; meetingUrl.value = "" }
              }, "Leave Meeting")
            ]),
            h("iframe", {
              src: meetingUrl.value,
              class: "meeting-frame",
              allow: "camera; microphone; fullscreen; display-capture"
            })
          ])
    ])
  }
})

const MeetView = defineComponent({
  props: ["tab"],
  setup() {
    const meetingUrl = ref("")
    const meetingCode = ref("")
    const isJoined = ref(false)
    
    function joinMeeting() {
      if (meetingCode.value) {
        meetingUrl.value = `https://meet.google.com/${meetingCode.value}`
        isJoined.value = true
      }
    }
    
    return () => h("div", { class: "meeting-view" }, [
      !isJoined.value
        ? h("div", { class: "meeting-join" }, [
            h("div", { class: "meeting-icon" }, "🎥"),
            h("h2", { class: "meeting-title" }, "Google Meet"),
            h("input", {
              class: "meeting-input",
              placeholder: "Meeting code (e.g. abc-defg-hij)",
              value: meetingCode.value,
              onInput: (e: Event) => meetingCode.value = (e.target as HTMLInputElement).value,
              onKeydown: (e: KeyboardEvent) => e.key === "Enter" && joinMeeting()
            }),
            h("button", {
              class: "meeting-btn google",
              onClick: joinMeeting
            }, "Join Meeting"),
            h("div", { class: "meeting-links" }, [
              h("a", { href: "https://meet.google.com/new", target: "_blank" }, "Start a new meeting"),
              h("a", { href: "https://calendar.google.com", target: "_blank" }, "Schedule in Calendar")
            ])
          ])
        : h("div", { class: "meeting-container" }, [
            h("div", { class: "meeting-toolbar" }, [
              h("span", { class: "meeting-status" }, "Meeting in progress"),
              h("button", {
                class: "meeting-leave",
                onClick: () => { isJoined.value = false; meetingUrl.value = "" }
              }, "Leave Meeting")
            ]),
            h("iframe", {
              src: meetingUrl.value,
              class: "meeting-frame",
              allow: "camera; microphone; fullscreen; display-capture"
            })
          ])
    ])
  }
})
// ============ SOCIAL & INBOX PANELS ============

const WhatsAppView = defineComponent({
  props: ["tab"],
  setup() {
    const isLoaded = ref(false)
    
    return () => h("div", { class: "social-view" }, [
      !isLoaded.value
        ? h("div", { class: "social-join" }, [
            h("div", { class: "social-icon" }, "💬"),
            h("h2", { class: "social-title" }, "WhatsApp Web"),
            h("p", { class: "social-desc" }, "Scan QR code with your phone to link WhatsApp"),
            h("button", {
              class: "social-btn whatsapp",
              onClick: () => isLoaded.value = true
            }, "Open WhatsApp Web"),
            h("div", { class: "social-note" }, [
              h("span", null, "Agent will monitor messages and can auto-reply based on your rules")
            ])
          ])
        : h("div", { class: "social-container" }, [
            h("div", { class: "social-toolbar" }, [
              h("span", { class: "social-status" }, "🟢 Connected"),
              h("span", { class: "social-agent" }, "🤖 Agent monitoring"),
              h("button", {
                class: "social-refresh",
                onClick: () => {}
              }, "↻ Refresh")
            ]),
            h("iframe", {
              src: "https://web.whatsapp.com",
              class: "social-frame",
              allow: "camera; microphone; clipboard-write"
            })
          ])
    ])
  }
})

const FacebookView = defineComponent({
  props: ["tab"],
  setup() {
    const isLoaded = ref(false)
    
    return () => h("div", { class: "social-view" }, [
      !isLoaded.value
        ? h("div", { class: "social-join" }, [
            h("div", { class: "social-icon" }, "📘"),
            h("h2", { class: "social-title" }, "Facebook Messenger"),
            h("p", { class: "social-desc" }, "Access your Facebook messages"),
            h("button", {
              class: "social-btn facebook",
              onClick: () => isLoaded.value = true
            }, "Open Messenger"),
            h("div", { class: "social-note" }, [
              h("span", null, "Agent can help manage messages and notifications")
            ])
          ])
        : h("div", { class: "social-container" }, [
            h("div", { class: "social-toolbar" }, [
              h("span", { class: "social-status" }, "🟢 Connected"),
              h("span", { class: "social-agent" }, "🤖 Agent monitoring"),
              h("button", {
                class: "social-refresh",
                onClick: () => {}
              }, "↻ Refresh")
            ]),
            h("iframe", {
              src: "https://www.messenger.com",
              class: "social-frame",
              allow: "camera; microphone; clipboard-write"
            })
          ])
    ])
  }
})

const InboxView = defineComponent({
  props: ["tab"],
  setup() {
    const filter = ref("all")
    const messages = ref([
      { id: 1, time: "10:30", type: "action", agent: "Friday", content: "Checked WhatsApp - 3 new messages", status: "done" },
      { id: 2, time: "10:32", type: "summary", agent: "Friday", content: "Daily email summary: 12 unread, 2 urgent", status: "done" },
      { id: 3, time: "10:35", type: "alert", agent: "System", content: "Calendar reminder: Team meeting at 11am", status: "pending" },
      { id: 4, time: "10:40", type: "action", agent: "Friday", content: "Auto-replied to John on WhatsApp: Will check and get back", status: "done" },
      { id: 5, time: "10:45", type: "report", agent: "Friday", content: "Facebook: 5 new notifications, 2 messages", status: "done" },
      { id: 6, time: "10:50", type: "task", agent: "Friday", content: "Scheduled: Send report to team at 2pm", status: "pending" },
    ])
    
    const filtered = computed(() => {
      if (filter.value === "all") return messages.value
      return messages.value.filter(m => m.type === filter.value)
    })
    return () => h("div", { class: "inbox-view" }, [
      h("div", { class: "inbox-header" }, [
        h("h2", { class: "inbox-title" }, [
          h("span", null, "📥 "),
          h("span", null, "Activity Inbox")
        ]),
        h("div", { class: "inbox-filters" }, [
          h("button", { 
            class: `inbox-filter ${filter.value === "all" ? "active" : ""}`,
            onClick: () => filter.value = "all"
          }, "All"),
          h("button", {
            class: `inbox-filter ${filter.value === "action" ? "active" : ""}`,
            onClick: () => filter.value = "action"
          }, "Actions"),
          h("button", {
            class: `inbox-filter ${filter.value === "summary" ? "active" : ""}`,
            onClick: () => filter.value = "summary"
          }, "Summaries"),
          h("button", {
            class: `inbox-filter ${filter.value === "alert" ? "active" : ""}`,
            onClick: () => filter.value = "alert"
          }, "Alerts"),
          h("button", {
            class: `inbox-filter ${filter.value === "report" ? "active" : ""}`,
            onClick: () => filter.value = "report"
          }, "Reports")
        ])
      ]),
      h("div", { class: "inbox-list" },
        filtered.value.map((msg) => h("div", { 
          key: msg.id, 
          class: `inbox-item ${msg.type} ${msg.status}`
        }, [
          h("div", { class: "inbox-item-header" }, [
            h("span", { class: "inbox-time" }, msg.time),
            h("span", { class: "inbox-type" }, msg.type.toUpperCase()),
            h("span", { class: "inbox-agent" }, `🤖 ${msg.agent}`),
            h("span", { class: `inbox-status ${msg.status}` }, msg.status === "done" ? "✓" : "⏳")
          ]),
          h("div", { class: "inbox-content" }, msg.content),
          h("div", { class: "inbox-actions" }, [
            h("button", { class: "inbox-btn" }, "View Details"),
            h("button", { class: "inbox-btn" }, "Dismiss")
          ])
        ]))
      ),
      h("div", { class: "inbox-footer" }, [
        h("span", { class: "inbox-count" }, `${filtered.value.length} items`),
        h("button", { class: "inbox-clear" }, "Clear All")
      ])
    ])
  }
})
// ============ CREATIVE & MAP PANELS ============

const CapCutView = defineComponent({
  props: ["tab"],
  setup() {
    const isLoaded = ref(false)
    
    return () => h("div", { class: "creative-view" }, [
      !isLoaded.value
        ? h("div", { class: "creative-join" }, [
            h("div", { class: "creative-icon" }, "🎬"),
            h("h2", { class: "creative-title" }, "CapCut Video Editor"),
            h("p", { class: "creative-desc" }, "Professional video editing in your browser"),
            h("button", {
              class: "creative-btn capcut",
              onClick: () => isLoaded.value = true
            }, "Open CapCut"),
            h("div", { class: "creative-features" }, [
              h("span", null, "✂️ Trim & Split"),
              h("span", null, "🎵 Audio Effects"),
              h("span", null, "✨ AI Effects"),
              h("span", null, "📝 Auto Captions")
            ])
          ])
        : h("div", { class: "creative-container" }, [
            h("div", { class: "creative-toolbar" }, [
              h("span", { class: "creative-status" }, "🟢 CapCut Active"),
              h("span", { class: "creative-agent" }, "🤖 Agent can assist"),
              h("button", {
                class: "creative-refresh",
                onClick: () => {}
              }, "↻ Refresh")
            ]),
            h("iframe", {
              src: "https://www.capcut.com/editor",
              class: "creative-frame"
            })
          ])
    ])
  }
})

const CanvaView = defineComponent({
  props: ["tab"],
  setup() {
    const isLoaded = ref(false)
    
    return () => h("div", { class: "creative-view" }, [
      !isLoaded.value
        ? h("div", { class: "creative-join" }, [
            h("div", { class: "creative-icon" }, "🎨"),
            h("h2", { class: "creative-title" }, "Canva Design"),
            h("p", { class: "creative-desc" }, "Create stunning designs easily"),
            h("button", {
              class: "creative-btn canva",
              onClick: () => isLoaded.value = true
            }, "Open Canva"),
            h("div", { class: "creative-features" }, [
              h("span", null, "📱 Social Media"),
              h("span", null, "📄 Documents"),
              h("span", null, "🎥 Videos"),
              h("span", null, "🌐 Websites")
            ])
          ])
        : h("div", { class: "creative-container" }, [
            h("div", { class: "creative-toolbar" }, [
              h("span", { class: "creative-status" }, "🟢 Canva Active"),
              h("span", { class: "creative-agent" }, "🤖 Agent can assist"),
              h("button", {
                class: "creative-refresh",
                onClick: () => {}
              }, "↻ Refresh")
            ]),
            h("iframe", {
              src: "https://www.canva.com",
              class: "creative-frame"
            })
          ])
    ])
  }
})

const MapView = defineComponent({
  props: ["tab"],
  setup() {
    const searchQuery = ref("")
    const mapType = ref("standard")
    
    return () => h("div", { class: "map-view" }, [
      h("div", { class: "map-toolbar" }, [
        h("input", {
          class: "map-search",
          placeholder: "Search location...",
          value: searchQuery.value,
          onInput: (e: Event) => searchQuery.value = (e.target as HTMLInputElement).value
        }),
        h("div", { class: "map-controls" }, [
          h("button", {
            class: `map-btn ${mapType.value === "standard" ? "active" : ""}`,
            onClick: () => mapType.value = "standard"
          }, "🗺️ Standard"),
          h("button", {
            class: `map-btn ${mapType.value === "satellite" ? "active" : ""}`,
            onClick: () => mapType.value = "satellite"
          }, "🛰️ Satellite"),
          h("button", {
            class: `map-btn ${mapType.value === "traffic" ? "active" : ""}`,
            onClick: () => mapType.value = "traffic"
          }, "🚗 Traffic")
        ])
      ]),
      h("iframe", {
        src: mapType.value === "satellite"
          ? "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2s"
          : "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1000000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
        class: "map-frame",
        allow: "geolocation"
      }),
      h("div", { class: "map-info" }, [
        h("div", { class: "map-legend" }, [
          h("span", { class: "legend-item" }, [
            h("span", { class: "legend-dot", style: "background: #34c759" }),
            h("span", null, "Your Location")
          ]),
          h("span", { class: "legend-item" }, [
            h("span", { class: "legend-dot", style: "background: #ff9500" }),
            h("span", null, "Saved Places")
          ]),
          h("span", { class: "legend-item" }, [
            h("span", { class: "legend-dot", style: "background: #00d4ff" }),
            h("span", null, "Agent Suggestions")
          ])
        ])
      ])
    ])
  }
})
function getTabById(id: string): Tab | undefined {
  return tabs.value.find(t => t.id === id)
}

function getContentView(tab: Tab | undefined) {
  if (!tab) return null
  const views: Record<string, any> = {
    browser: BrowserView,
    video: VideoView,
    image: ImageView,
    markdown: MarkdownView,
    code: CodeView,
    files: FilesView,
    calendar: CalendarView,
    notes: NotesView,
    calculator: CalculatorView,
    canvas: CanvasView,
    zoom: ZoomView,
    meet: MeetView,
    whatsapp: WhatsAppView,
    facebook: FacebookView,
    inbox: InboxView,
    capcut: CapCutView,
    canva: CanvaView,
    map: MapView
  }
  return views[tab.type] || BrowserView
}

// ============ Tab Management ============

function addTab(type: Tab['type'], pane: 'left' | 'right' = 'left') {
  const id = `${type}-${Date.now()}`
  const icons: Record<string, string> = {
    browser: '🌐', video: '🎬', image: '🖼️', markdown: '📝', code: '💻',
  }
  tabs.value.push({
    id, type,
    title: type.charAt(0).toUpperCase() + type.slice(1),
    icon: icons[type], pane
  })
  if (pane === 'left') activeTab.value = id
  else rightActiveTab.value = id
}

function closeTab(id: string) {
  const index = tabs.value.findIndex(t => t.id === id)
  if (index > -1) {
    tabs.value.splice(index, 1)
    if (activeTab.value === id) {
      activeTab.value = leftTabs.value[0]?.id || rightTabs.value[0]?.id || ''
    }
    if (rightActiveTab.value === id) {
      rightActiveTab.value = rightTabs.value[0]?.id || ''
    }
  }
}

// Split screen
function toggleSplit() {
  if (splitMode.value === 'none') {
    splitMode.value = 'horizontal'
    if (rightTabs.value.length === 0) {
      addTab('browser', 'right')
    }
  } else {
    splitMode.value = 'none'
  }
}

// Drag and drop
function onTabDragStart(event: DragEvent, tab: Tab) {
  event.dataTransfer?.setData('text/plain', tab.id)
}

function onDrop(event: DragEvent, pane: 'left' | 'right') {
  const tabId = event.dataTransfer?.getData('text/plain')
  if (tabId) {
    const tab = tabs.value.find(t => t.id === tabId)
    if (tab) {
      tab.pane = pane
      if (pane === 'right') rightActiveTab.value = tabId
      else activeTab.value = tabId
    }
  }
}

// Split resize
let isResizing = false

function startResizeSplit() {
  isResizing = true
  document.addEventListener('mousemove', onSplitResize)
  document.addEventListener('mouseup', stopResizeSplit)
}

function onSplitResize(event: MouseEvent) {
  if (!isResizing) return
  const container = document.querySelector('.split-container')
  if (!container) return

  const rect = container.getBoundingClientRect()
  if (splitMode.value === 'horizontal') {
    splitPosition.value = ((event.clientX - rect.left) / rect.width) * 100
  } else {
    splitPosition.value = ((event.clientY - rect.top) / rect.height) * 100
  }
  splitPosition.value = Math.max(20, Math.min(80, splitPosition.value))
}

function stopResizeSplit() {
  isResizing = false
  document.removeEventListener('mousemove', onSplitResize)
  document.removeEventListener('mouseup', stopResizeSplit)
}

// Layout persistence
function saveLayout() {
  const layout = {
    tabs: tabs.value,
    splitMode: splitMode.value,
    splitPosition: splitPosition.value,
    activeTab: activeTab.value,
    rightActiveTab: rightActiveTab.value
  }
  localStorage.setItem('golden-layout', JSON.stringify(layout))
}

function loadLayout() {
  const saved = localStorage.getItem('golden-layout')
  if (saved) {
    const layout = JSON.parse(saved)
    tabs.value = layout.tabs
    splitMode.value = layout.splitMode
    splitPosition.value = layout.splitPosition
    activeTab.value = layout.activeTab
    rightActiveTab.value = layout.rightActiveTab
  }
}

// Keyboard shortcuts
function onKeyDown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        toggleSplit()
        break
      case 's':
        event.preventDefault()
        saveLayout()
        break
      case 'o':
        event.preventDefault()
        loadLayout()
        break
      case 'n':
        event.preventDefault()
        addTab('browser')
        break
    }
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
  loadLayout()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})

function navigate() {
  // Navigate to URL
}
</script>

<style scoped>
.golden-layout {
  position: fixed;
  top: 32px;
  left: 60px;
  right: 0;
  bottom: 40px;
  z-index: 5;
  pointer-events: auto;
}

.split-container {
  display: flex;
  width: 100%;
  height: 100%;
  background: rgba(10, 15, 25, 0.95);
  border: 1px solid rgba(0, 200, 255, 0.1);
}

.split-container.vertical { flex-direction: column; }

.split-pane {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.split-divider {
  background: rgba(0, 200, 255, 0.15);
  cursor: col-resize;
  flex-shrink: 0;
}

.split-divider.horizontal { width: 4px; }
.split-divider.vertical { height: 4px; cursor: row-resize; }
.split-divider:hover { background: rgba(0, 200, 255, 0.4); }

.tab-bar {
  display: flex;
  align-items: center;
  background: rgba(5, 10, 20, 0.98);
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
  padding: 0 8px;
  min-height: 36px;
  overflow-x: auto;
  position: relative;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-family: 'SF Mono', monospace;
  color: rgba(150, 170, 200, 0.6);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab:hover { color: rgba(200, 220, 255, 0.8); background: rgba(255, 255, 255, 0.03); }
.tab.active { color: #00d4ff; border-bottom-color: #00d4ff; background: rgba(0, 200, 255, 0.05); }
.tab-icon { font-size: 14px; }

.tab-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  font-size: 10px;
  padding: 2px;
}

.tab-close:hover { color: #ff3b30; }

.tab-add {
  background: none;
  border: 1px dashed rgba(0, 200, 255, 0.2);
  color: rgba(0, 200, 255, 0.5);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 10px;
  border-radius: 4px;
  margin-left: 4px;
}

.tab-add:hover { background: rgba(0, 200, 255, 0.1); color: #00d4ff; }

.tab-actions {
  margin-left: auto;
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: rgba(150, 170, 200, 0.5);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
}

.action-btn:hover { background: rgba(0, 200, 255, 0.1); color: #00d4ff; }

.new-tab-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: rgba(10, 15, 25, 0.98);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 6px;
  padding: 8px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 180px;
}

.menu-section {
  font-size: 10px;
  color: rgba(0, 200, 255, 0.5);
  padding: 8px 12px 4px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.new-tab-menu button {
  background: none;
  border: none;
  color: rgba(200, 220, 255, 0.8);
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  text-align: left;
}

.new-tab-menu button:hover { background: rgba(0, 200, 255, 0.1); }

.content-area { flex: 1; overflow: hidden; }

.shortcuts-hint {
  position: fixed;
  bottom: 50px;
  right: 20px;
  display: flex;
  gap: 12px;
  font-size: 10px;
  font-family: 'SF Mono', monospace;
  color: rgba(150, 170, 200, 0.3);
}

/* Browser */
.browser-view { display: flex; flex-direction: column; height: 100%; }
.browser-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.browser-url { flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 6px 12px; border-radius: 4px; font-size: 12px; font-family: 'SF Mono', monospace; }
.browser-frame { flex: 1; border: none; background: #fff; }
.browser-empty { flex: 1; display: flex; align-items: center; justify-content: center; color: rgba(150, 170, 200, 0.5); }

/* Video */
.video-view { display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; }
.video-player { max-width: 100%; max-height: 100%; }
.video-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(150, 170, 200, 0.5); }
.video-icon { font-size: 48px; }
.video-input { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 8px 16px; border-radius: 4px; font-size: 13px; width: 300px; }

/* Image */
.image-view { display: flex; flex-direction: column; height: 100%; align-items: center; justify-content: center; }
.image-display { max-width: 100%; max-height: 100%; object-fit: contain; }
.image-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; color: rgba(150, 170, 200, 0.5); }
.image-icon { font-size: 48px; }
.image-input { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 8px 16px; border-radius: 4px; font-size: 13px; width: 300px; }

/* Markdown */
.markdown-split { display: flex; height: 100%; }
.markdown-editor { flex: 1; background: rgba(0, 0, 0, 0.3); border: none; border-right: 1px solid rgba(0, 200, 255, 0.1); color: rgba(200, 220, 255, 0.9); padding: 16px; font-family: 'SF Mono', monospace; font-size: 13px; resize: none; outline: none; }
.markdown-preview { flex: 1; padding: 16px; color: rgba(200, 220, 255, 0.9); font-size: 14px; line-height: 1.6; overflow-y: auto; }

/* Code */
.code-view { display: flex; flex-direction: column; height: 100%; }
.code-toolbar { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.code-btn { background: rgba(0, 200, 255, 0.15); border: 1px solid rgba(0, 200, 255, 0.3); color: #00d4ff; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
.code-btn:hover { background: rgba(0, 200, 255, 0.25); }
.code-editor { flex: 1; background: rgba(0, 0, 0, 0.3); border: none; color: rgba(200, 220, 255, 0.9); padding: 16px; font-family: 'SF Mono', monospace; font-size: 13px; resize: none; outline: none; tab-size: 2; }
.code-output { height: 100px; background: rgba(0, 0, 0, 0.5); border-top: 1px solid rgba(0, 200, 255, 0.1); padding: 12px; overflow-y: auto; }
.code-output pre { font-family: 'SF Mono', monospace; font-size: 12px; color: #34c759; margin: 0; }

/* Files */
.files-view { display: flex; flex-direction: column; height: 100%; }
.files-toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.files-btn { background: rgba(0, 200, 255, 0.1); border: 1px solid rgba(0, 200, 255, 0.2); color: #00d4ff; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
.files-path { color: rgba(200, 220, 255, 0.7); font-family: 'SF Mono', monospace; font-size: 12px; }
.files-list { flex: 1; overflow-y: auto; padding: 8px; }
.file-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
.file-item:hover { background: rgba(0, 200, 255, 0.05); }
.file-icon { font-size: 18px; }
.file-name { flex: 1; color: rgba(200, 220, 255, 0.9); font-size: 13px; }
.file-size { color: rgba(150, 170, 200, 0.5); font-size: 11px; }

/* Calendar */
.calendar-view { display: flex; flex-direction: column; height: 100%; padding: 16px; }
.calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-nav { background: none; border: 1px solid rgba(0, 200, 255, 0.2); color: #00d4ff; cursor: pointer; padding: 6px 12px; border-radius: 4px; font-size: 14px; }
.cal-nav:hover { background: rgba(0, 200, 255, 0.1); }
.cal-title { color: rgba(200, 220, 255, 0.9); font-size: 16px; font-weight: 600; }
.calendar-days-header { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px; }
.cal-day-name { text-align: center; color: rgba(0, 200, 255, 0.5); font-size: 11px; font-family: 'SF Mono', monospace; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; transition: all 0.2s; position: relative; }
.cal-day:hover { background: rgba(0, 200, 255, 0.1); }
.cal-day.selected { background: rgba(0, 200, 255, 0.2); border: 1px solid #00d4ff; }
.cal-day.has-events::after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: #00d4ff; }
.cal-day-num { color: rgba(200, 220, 255, 0.8); font-size: 13px; }
.calendar-events { margin-top: 16px; flex: 1; overflow-y: auto; }
.events-title { color: rgba(0, 200, 255, 0.7); font-size: 12px; margin-bottom: 8px; }
.event-item { display: flex; gap: 12px; padding: 8px; background: rgba(0, 200, 255, 0.05); border-radius: 6px; margin-bottom: 4px; }
.event-time { color: rgba(150, 170, 200, 0.6); font-size: 12px; font-family: 'SF Mono', monospace; min-width: 80px; }
.event-title { color: rgba(200, 220, 255, 0.9); font-size: 13px; }

/* Notes */
.notes-view { display: flex; height: 100%; }
.notes-sidebar { width: 200px; border-right: 1px solid rgba(0, 200, 255, 0.1); display: flex; flex-direction: column; }
.notes-new-btn { margin: 8px; padding: 8px; background: rgba(0, 200, 255, 0.15); border: 1px solid rgba(0, 200, 255, 0.3); color: #00d4ff; cursor: pointer; border-radius: 6px; font-size: 12px; }
.notes-new-btn:hover { background: rgba(0, 200, 255, 0.25); }
.notes-item { padding: 12px; cursor: pointer; border-bottom: 1px solid rgba(0, 200, 255, 0.05); }
.notes-item:hover { background: rgba(0, 200, 255, 0.05); }
.notes-item.active { background: rgba(0, 200, 255, 0.1); }
.notes-item-title { color: rgba(200, 220, 255, 0.9); font-size: 13px; margin-bottom: 4px; }
.notes-item-date { color: rgba(150, 170, 200, 0.5); font-size: 11px; }
.notes-editor { flex: 1; display: flex; flex-direction: column; }
.notes-title-input { background: transparent; border: none; border-bottom: 1px solid rgba(0, 200, 255, 0.1); color: rgba(200, 220, 255, 0.9); padding: 16px; font-size: 18px; font-weight: 600; outline: none; }
.notes-content-input { flex: 1; background: transparent; border: none; color: rgba(200, 220, 255, 0.8); padding: 16px; font-size: 14px; line-height: 1.6; resize: none; outline: none; }

/* Calculator */
.calculator-view { display: flex; flex-direction: column; height: 100%; background: #1a1a2e; }
.calc-display { padding: 24px; text-align: right; font-size: 36px; font-family: 'SF Mono', monospace; color: #fff; background: rgba(0, 0, 0, 0.3); }
.calc-buttons { flex: 1; display: flex; flex-direction: column; padding: 8px; gap: 8px; }
.calc-row { display: flex; gap: 8px; flex: 1; }
.calc-btn { flex: 1; border: none; border-radius: 8px; font-size: 20px; cursor: pointer; background: rgba(255, 255, 255, 0.1); color: #fff; transition: all 0.2s; }
.calc-btn:hover { background: rgba(255, 255, 255, 0.2); }
.calc-btn:active { transform: scale(0.95); }
.calc-btn.operator { background: rgba(0, 200, 255, 0.3); color: #00d4ff; }
.calc-btn.operator:hover { background: rgba(0, 200, 255, 0.4); }
.calc-btn.zero { flex: 2; }

/* Canvas */
.canvas-view { display: flex; flex-direction: column; height: 100%; }
.canvas-toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.color-picker { width: 32px; height: 32px; border: none; cursor: pointer; background: none; }
.line-width { width: 100px; }
.canvas-btn { background: rgba(255, 59, 48, 0.15); border: 1px solid rgba(255, 59, 48, 0.3); color: #ff3b30; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
.canvas-btn:hover { background: rgba(255, 59, 48, 0.25); }
.drawing-canvas { flex: 1; background: #fff; cursor: crosshair; }
</style>

/* Meeting panels */
.meeting-view { display: flex; flex-direction: column; height: 100%; }
.meeting-join { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.meeting-icon { font-size: 64px; }
.meeting-title { color: rgba(200, 220, 255, 0.9); font-size: 24px; font-weight: 600; }
.meeting-input { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 12px 20px; border-radius: 8px; font-size: 16px; width: 300px; text-align: center; }
.meeting-input:focus { border-color: #00d4ff; outline: none; }
.meeting-btn { background: #00d4ff; border: none; color: #000; cursor: pointer; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: all 0.2s; }
.meeting-btn:hover { background: #00b8d9; transform: scale(1.02); }
.meeting-btn.google { background: #4285f4; color: #fff; }
.meeting-btn.google:hover { background: #3367d6; }
.meeting-links { display: flex; gap: 24px; margin-top: 16px; }
.meeting-links a { color: rgba(0, 200, 255, 0.7); font-size: 13px; text-decoration: none; }
.meeting-links a:hover { color: #00d4ff; text-decoration: underline; }
.meeting-container { display: flex; flex-direction: column; height: 100%; }
.meeting-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.meeting-status { color: #34c759; font-size: 12px; font-family: 'SF Mono', monospace; }
.meeting-leave { background: rgba(255, 59, 48, 0.15); border: 1px solid rgba(255, 59, 48, 0.3); color: #ff3b30; cursor: pointer; padding: 6px 16px; border-radius: 6px; font-size: 12px; }
.meeting-leave:hover { background: rgba(255, 59, 48, 0.25); }
.meeting-frame { flex: 1; border: none; }

/* Social panels */
.social-view { display: flex; flex-direction: column; height: 100%; }
.social-join { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.social-icon { font-size: 64px; }
.social-title { color: rgba(200, 220, 255, 0.9); font-size: 24px; font-weight: 600; }
.social-desc { color: rgba(150, 170, 200, 0.6); font-size: 14px; }
.social-btn { border: none; color: #fff; cursor: pointer; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: all 0.2s; }
.social-btn:hover { transform: scale(1.02); }
.social-btn.whatsapp { background: #25d366; }
.social-btn.facebook { background: #1877f2; }
.social-note { margin-top: 16px; padding: 12px 16px; background: rgba(0, 200, 255, 0.05); border-radius: 8px; border: 1px solid rgba(0, 200, 255, 0.1); }
.social-note span { color: rgba(0, 200, 255, 0.7); font-size: 12px; }
.social-container { display: flex; flex-direction: column; height: 100%; }
.social-toolbar { display: flex; align-items: center; gap: 16px; padding: 8px 16px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.social-status { color: #34c759; font-size: 12px; font-family: 'SF Mono', monospace; }
.social-agent { color: rgba(0, 200, 255, 0.7); font-size: 12px; font-family: 'SF Mono', monospace; }
.social-refresh { margin-left: auto; background: none; border: 1px solid rgba(0, 200, 255, 0.2); color: #00d4ff; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
.social-refresh:hover { background: rgba(0, 200, 255, 0.1); }
.social-frame { flex: 1; border: none; }

/* Inbox panel */
.inbox-view { display: flex; flex-direction: column; height: 100%; }
.inbox-header { padding: 16px; border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.inbox-title { display: flex; align-items: center; gap: 8px; color: rgba(200, 220, 255, 0.9); font-size: 18px; margin-bottom: 12px; }
.inbox-filters { display: flex; gap: 8px; }
.inbox-filter { background: rgba(0, 200, 255, 0.05); border: 1px solid rgba(0, 200, 255, 0.1); color: rgba(150, 170, 200, 0.7); cursor: pointer; padding: 6px 12px; border-radius: 20px; font-size: 11px; transition: all 0.2s; }
.inbox-filter:hover { background: rgba(0, 200, 255, 0.1); color: #00d4ff; }
.inbox-filter.active { background: rgba(0, 200, 255, 0.2); border-color: #00d4ff; color: #00d4ff; }
.inbox-list { flex: 1; overflow-y: auto; padding: 8px; }
.inbox-item { padding: 12px; background: rgba(0, 200, 255, 0.03); border-radius: 8px; margin-bottom: 8px; border-left: 3px solid transparent; transition: all 0.2s; }
.inbox-item:hover { background: rgba(0, 200, 255, 0.06); }
.inbox-item.action { border-left-color: #00d4ff; }
.inbox-item.summary { border-left-color: #34c759; }
.inbox-item.alert { border-left-color: #ff9500; }
.inbox-item.report { border-left-color: #af52de; }
.inbox-item.task { border-left-color: #5ac8fa; }
.inbox-item-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.inbox-time { color: rgba(150, 170, 200, 0.5); font-size: 11px; font-family: 'SF Mono', monospace; }
.inbox-type { color: rgba(0, 200, 255, 0.7); font-size: 10px; font-family: 'SF Mono', monospace; padding: 2px 6px; background: rgba(0, 200, 255, 0.1); border-radius: 4px; }
.inbox-agent { color: rgba(150, 170, 200, 0.5); font-size: 11px; margin-left: auto; }
.inbox-status { font-size: 14px; }
.inbox-status.done { color: #34c759; }
.inbox-status.pending { color: #ff9500; }
.inbox-content { color: rgba(200, 220, 255, 0.8); font-size: 13px; line-height: 1.5; }
.inbox-actions { display: flex; gap: 8px; margin-top: 8px; }
.inbox-btn { background: none; border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(0, 200, 255, 0.7); cursor: pointer; padding: 4px 10px; border-radius: 4px; font-size: 11px; }
.inbox-btn:hover { background: rgba(0, 200, 255, 0.1); }
.inbox-footer { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid rgba(0, 200, 255, 0.1); }
.inbox-count { color: rgba(150, 170, 200, 0.5); font-size: 12px; }
.inbox-clear { background: none; border: 1px solid rgba(255, 59, 48, 0.2); color: rgba(255, 59, 48, 0.7); cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 11px; }
.inbox-clear:hover { background: rgba(255, 59, 48, 0.1); }

/* Creative panels */
.creative-view { display: flex; flex-direction: column; height: 100%; }
.creative-join { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; }
.creative-icon { font-size: 64px; }
.creative-title { color: rgba(200, 220, 255, 0.9); font-size: 24px; font-weight: 600; }
.creative-desc { color: rgba(150, 170, 200, 0.6); font-size: 14px; }
.creative-btn { border: none; color: #fff; cursor: pointer; padding: 12px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; transition: all 0.2s; }
.creative-btn:hover { transform: scale(1.02); }
.creative-btn.capcut { background: #000; }
.creative-btn.canva { background: #7b2ff7; }
.creative-features { display: flex; gap: 16px; margin-top: 16px; }
.creative-features span { padding: 8px 12px; background: rgba(0, 200, 255, 0.05); border-radius: 20px; font-size: 12px; color: rgba(150, 170, 200, 0.7); }
.creative-container { display: flex; flex-direction: column; height: 100%; }
.creative-toolbar { display: flex; align-items: center; gap: 16px; padding: 8px 16px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.creative-status { color: #34c759; font-size: 12px; font-family: 'SF Mono', monospace; }
.creative-agent { color: rgba(0, 200, 255, 0.7); font-size: 12px; font-family: 'SF Mono', monospace; }
.creative-refresh { margin-left: auto; background: none; border: 1px solid rgba(0, 200, 255, 0.2); color: #00d4ff; cursor: pointer; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
.creative-refresh:hover { background: rgba(0, 200, 255, 0.1); }
.creative-frame { flex: 1; border: none; }

/* Map panel */
.map-view { display: flex; flex-direction: column; height: 100%; }
.map-toolbar { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-bottom: 1px solid rgba(0, 200, 255, 0.1); }
.map-search { flex: 1; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(0, 200, 255, 0.15); color: rgba(200, 220, 255, 0.9); padding: 8px 12px; border-radius: 6px; font-size: 13px; }
.map-search:focus { border-color: #00d4ff; outline: none; }
.map-controls { display: flex; gap: 4px; }
.map-btn { background: rgba(0, 200, 255, 0.05); border: 1px solid rgba(0, 200, 255, 0.1); color: rgba(150, 170, 200, 0.7); cursor: pointer; padding: 6px 10px; border-radius: 4px; font-size: 11px; }
.map-btn:hover { background: rgba(0, 200, 255, 0.1); }
.map-btn.active { background: rgba(0, 200, 255, 0.2); border-color: #00d4ff; color: #00d4ff; }
.map-frame { flex: 1; border: none; }
.map-info { padding: 8px 12px; background: rgba(5, 10, 20, 0.98); border-top: 1px solid rgba(0, 200, 255, 0.1); }
.map-legend { display: flex; gap: 16px; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(150, 170, 200, 0.6); }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; }
