<template>
  <div ref="containerRef" class="three-hud"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const containerRef = ref<HTMLDivElement | null>(null)

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let animationId: number
let time = 0
let mouseX = 0
let mouseY = 0

// Objects
let particleSystem: THREE.Points
let radarGroup: THREE.Group
let energyRings: THREE.Mesh[] = []
let hexagons: THREE.Group[] = []
let dataStreams: THREE.Points[] = []

function init() {
  const container = containerRef.value
  if (!container) return

  // Scene
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.0008)

  // Camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
  )
  camera.position.set(0, 50, 200)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)

  // Create scene objects
  createParticles()
  createGrid()
  createRadar()
  createEnergyRings()
  createHexagons()
  createDataStreams()
  createAmbientLight()
}

function createParticles() {
  const count = 3000
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * 500
    positions[i3 + 1] = (Math.random() - 0.5) * 300
    positions[i3 + 2] = (Math.random() - 0.5) * 500

    colors[i3] = 0
    colors[i3 + 1] = 0.6 + Math.random() * 0.4
    colors[i3 + 2] = 0.8 + Math.random() * 0.2
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 2,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })

  particleSystem = new THREE.Points(geometry, material)
  scene.add(particleSystem)
}

function createGrid() {
  const gridGeometry = new THREE.BufferGeometry()
  const gridPositions: number[] = []
  const gridSize = 400
  const divisions = 20

  for (let i = -gridSize / 2; i <= gridSize / 2; i += gridSize / divisions) {
    gridPositions.push(-gridSize / 2, 0, i, gridSize / 2, 0, i)
    gridPositions.push(i, 0, -gridSize / 2, i, 0, gridSize / 2)
  }

  gridGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(gridPositions, 3)
  )

  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x0066ff,
    transparent: true,
    opacity: 0.08
  })

  const grid = new THREE.LineSegments(gridGeometry, gridMaterial)
  grid.position.y = -50
  scene.add(grid)
}

function createRadar() {
  radarGroup = new THREE.Group()

  // Radar rings
  for (let i = 0; i < 4; i++) {
    const radius = 40 + i * 30
    const ringGeometry = new THREE.RingGeometry(radius - 0.5, radius + 0.5, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.15 - i * 0.03,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = -Math.PI / 2
    radarGroup.add(ring)
  }

  // Radar sweep
  const sweepGeometry = new THREE.CircleGeometry(130, 32, 0, 0.5)
  const sweepMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  })
  const sweep = new THREE.Mesh(sweepGeometry, sweepMaterial)
  sweep.rotation.x = -Math.PI / 2
  sweep.name = 'sweep'
  radarGroup.add(sweep)

  // Center dot
  const centerGeometry = new THREE.SphereGeometry(3, 16, 16)
  const centerMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.8
  })
  const center = new THREE.Mesh(centerGeometry, centerMaterial)
  radarGroup.add(center)

  radarGroup.position.y = -45
  scene.add(radarGroup)
}

function createEnergyRings() {
  for (let i = 0; i < 3; i++) {
    const radius = 80 + i * 40
    const geometry = new THREE.TorusGeometry(radius, 0.5, 8, 64)
    const material = new THREE.MeshBasicMaterial({
      color: i === 0 ? 0x00ffff : i === 1 ? 0x0088ff : 0x00ffaa,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending
    })
    const ring = new THREE.Mesh(geometry, material)
    ring.rotation.x = Math.PI / 2 + (i * 0.2)
    scene.add(ring)
    energyRings.push(ring)
  }
}

function createHexagons() {
  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group()

    const shape = new THREE.Shape()
    const size = 10 + Math.random() * 15
    for (let j = 0; j < 6; j++) {
      const angle = (Math.PI / 3) * j
      const x = size * Math.cos(angle)
      const y = size * Math.sin(angle)
      if (j === 0) shape.moveTo(x, y)
      else shape.lineTo(x, y)
    }
    shape.closePath()

    const geometry = new THREE.ShapeGeometry(shape)
    const edges = new THREE.EdgesGeometry(geometry)
    const material = new THREE.LineBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.15
    })

    const hex = new THREE.LineSegments(edges, material)
    group.add(hex)

    group.position.set(
      (Math.random() - 0.5) * 300,
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 300
    )
    group.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )

    scene.add(group)
    hexagons.push(group)
  }
}

function createDataStreams() {
  for (let i = 0; i < 5; i++) {
    const count = 50
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    const x = (Math.random() - 0.5) * 200
    const z = (Math.random() - 0.5) * 200

    for (let j = 0; j < count; j++) {
      const j3 = j * 3
      positions[j3] = x
      positions[j3 + 1] = 150 - j * 6
      positions[j3 + 2] = z

      const alpha = 1 - j / count
      colors[j3] = 0
      colors[j3 + 1] = 0.8 * alpha
      colors[j3 + 2] = 1 * alpha
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 3,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    })

    const stream = new THREE.Points(geometry, material)
    scene.add(stream)
    dataStreams.push(stream)
  }
}

function createAmbientLight() {
  const ambientLight = new THREE.AmbientLight(0x001122, 0.5)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x00aaff, 1, 500)
  pointLight.position.set(0, 100, 0)
  scene.add(pointLight)
}

function update() {
  time += 0.016

  // Rotate particles
  if (particleSystem) {
    particleSystem.rotation.y += 0.0005

    const positions = particleSystem.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += Math.sin(time + positions[i] * 0.01) * 0.05
    }
    particleSystem.geometry.attributes.position.needsUpdate = true
  }

  // Rotate radar sweep
  if (radarGroup) {
    const sweep = radarGroup.getObjectByName('sweep')
    if (sweep) {
      sweep.rotation.z += 0.02
    }
  }

  // Animate energy rings
  energyRings.forEach((ring, i) => {
    ring.rotation.z += 0.005 * (i + 1)
    ring.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.05)
  })

  // Animate hexagons
  hexagons.forEach((hex, i) => {
    hex.rotation.x += 0.002
    hex.rotation.y += 0.003
    hex.position.y += Math.sin(time + i) * 0.05
  })

  // Animate data streams
  dataStreams.forEach((stream) => {
    const positions = stream.geometry.attributes.position.array as Float32Array
    for (let j = 0; j < positions.length; j += 3) {
      positions[j + 1] -= 0.5
      if (positions[j + 1] < -150) {
        positions[j + 1] = 150
      }
    }
    stream.geometry.attributes.position.needsUpdate = true
  })

  // Camera subtle movement
  camera.position.x += (mouseX * 20 - camera.position.x) * 0.02
  camera.position.y += (-mouseY * 10 + 50 - camera.position.y) * 0.02
  camera.lookAt(0, 0, 0)
}

function animate() {
  update()
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

function handleResize() {
  if (!containerRef.value) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function handleMouseMove(event: MouseEvent) {
  mouseX = (event.clientX / window.innerWidth) * 2 - 1
  mouseY = (event.clientY / window.innerHeight) * 2 - 1
}

onMounted(() => {
  init()
  animate()
  window.addEventListener('resize', handleResize)
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('mousemove', handleMouseMove)
  renderer.dispose()
})
</script>

<style scoped>
.three-hud {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.three-hud :deep(canvas) {
  display: block;
}
</style>
