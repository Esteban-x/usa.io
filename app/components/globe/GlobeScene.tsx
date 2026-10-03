'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Line, OrbitControls, Stars } from '@react-three/drei'
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  QuadraticBezierCurve3,
  Texture,
  Vector3,
} from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { StateLite, StateShape } from '@/app/lib/types'
import { buildStateGeometry, GLOBE_RADIUS as R, toVec3, type StateGeometry } from './geometry'
import { coverTexture, loadFlag } from './flags'

export type CameraCommand = { type: 'zoomIn' | 'zoomOut' | 'reset' | 'focus'; id?: string; n: number }

interface Props {
  states: StateLite[]
  hovered: string | null
  onHover: (id: string | null) => void
  onSelect: (id: string, pointerType: string) => void
  command: CameraCommand | null
  onReady?: () => void
}

/** Where the camera rests: above the contiguous United States */
const HOME = { lat: 30, lon: -97 }
const homeDistance = (aspect: number) => (aspect < 0.8 ? 360 : aspect < 1.2 ? 300 : 250)

export default function GlobeScene(props: Props) {
  return (
    <Canvas
      camera={{ fov: 40, near: 1, far: 3000, position: toVec3(10, -40, 520).toArray() }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      onPointerMissed={() => props.onHover(null)}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={toVec3(50, -70, 400).toArray()} intensity={2.2} color="#dbe7ff" />
      <directionalLight position={toVec3(-10, -150, 400).toArray()} intensity={0.6} color="#ff8fa3" />
      <Stars radius={900} depth={200} count={4000} factor={6} saturation={0} fade speed={0.4} />
      <group onPointerMove={(e) => e.object.userData.globe && props.onHover(null)}>
        <GlobeBase />
        <Atmosphere />
        <LandDots />
        <StatesLayer {...props} />
        <Arcs states={props.states} />
      </group>
      <CameraRig command={props.command} states={props.states} />
    </Canvas>
  )
}

/* ------------------------------------------------------------------ Globe */

function GlobeBase() {
  return (
    <mesh userData={{ globe: true }}>
      <sphereGeometry args={[R - 0.05, 96, 96]} />
      <meshStandardMaterial color="#0b1430" roughness={0.85} metalness={0.15} emissive="#060b1d" />
    </mesh>
  )
}

const atmosphereShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      gl_FragColor = vec4(0.35, 0.55, 1.0, 1.0) * intensity;
    }`,
}

function Atmosphere() {
  return (
    <mesh scale={1.16} raycast={() => null}>
      <sphereGeometry args={[R, 64, 64]} />
      <shaderMaterial
        args={[atmosphereShader]}
        side={BackSide}
        blending={AdditiveBlending}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}

const dotsShader = {
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */ `
    uniform float uTime;
    attribute float aSeed;
    varying float vAlpha;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 480.0 / -mv.z;
      vAlpha = 0.7 + 0.3 * sin(uTime * 0.8 + aSeed * 6.2831);
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    varying float vAlpha;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(0.5, 0.66, 1.0, vAlpha * smoothstep(0.5, 0.15, d));
    }`,
}

function LandDots() {
  const [geo, setGeo] = useState<BufferGeometry | null>(null)
  const mat = useRef<{ uniforms: { uTime: { value: number } } }>(null)

  useEffect(() => {
    let alive = true
    fetch('/data/dots.json')
      .then((r) => r.json())
      .then((flat: number[]) => {
        if (!alive) return
        const pos = new Float32Array((flat.length / 2) * 3)
        const seed = new Float32Array(flat.length / 2)
        const v = new Vector3()
        for (let i = 0; i < flat.length; i += 2) {
          toVec3(flat[i], flat[i + 1], R + 0.2, v)
          pos.set([v.x, v.y, v.z], (i / 2) * 3)
          seed[i / 2] = Math.random()
        }
        const g = new BufferGeometry()
        g.setAttribute('position', new Float32BufferAttribute(pos, 3))
        g.setAttribute('aSeed', new Float32BufferAttribute(seed, 1))
        setGeo(g)
      })
    return () => {
      alive = false
    }
  }, [])

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt
  })

  if (!geo) return null
  return (
    <points geometry={geo} raycast={() => null}>
      <shaderMaterial ref={mat as never} args={[dotsShader]} transparent depthWrite={false} />
    </points>
  )
}

/* ----------------------------------------------------------------- States */

function StatesLayer({ states, hovered, onHover, onSelect, onReady }: Props) {
  const [shapes, setShapes] = useState<{ shape: StateShape; geo: StateGeometry }[]>([])

  useEffect(() => {
    let alive = true
    fetch('/data/states.json')
      .then((r) => r.json())
      .then((data: StateShape[]) => {
        if (!alive) return
        setShapes(data.map((shape) => ({ shape, geo: buildStateGeometry(shape) })))
        onReady?.()
        // Warm the flag cache once the scene is up, so hovers are instant
        setTimeout(() => data.forEach((s, i) => setTimeout(() => loadFlag(s.id), i * 40)), 2500)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const known = useMemo(() => new Set(states.map((s) => s.id)), [states])

  return (
    <>
      {shapes
        .filter(({ shape }) => known.has(shape.id))
        .map(({ shape, geo }) => (
          <StateTile
            key={shape.id}
            id={shape.id}
            geo={geo}
            active={hovered === shape.id}
            onOver={() => onHover(shape.id)}
            onOut={() => onHover(null)}
            onSelect={onSelect}
          />
        ))}
    </>
  )
}

const BASE_TOP = new Color('#22356a')
const ACTIVE_TOP = new Color('#3d63c9')
const WALL_IDLE = new Color('#3b6cff')
const WALL_ACTIVE = new Color('#ff2d55')
const LINE_IDLE = new Color('#8fb0ff')
const LINE_ACTIVE = new Color('#ffffff')

type TileMaterials = ReturnType<typeof createTileMaterials>

function createTileMaterials(id: string) {
  // Slight tint variation so neighbouring states read as distinct tiles
  let h = 0
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997
  const top = BASE_TOP.clone().offsetHSL(((h % 7) - 3) * 0.006, 0, ((h % 5) - 2) * 0.012)
  return {
    baseTop: top,
    top: new MeshStandardMaterial({ color: top.clone(), roughness: 0.55, metalness: 0.25, side: DoubleSide }),
    flag: new MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      side: DoubleSide,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      depthWrite: false,
    }),
    walls: new MeshStandardMaterial({
      color: '#1d3a8f',
      emissive: WALL_IDLE.clone(),
      emissiveIntensity: 0.25,
      roughness: 0.4,
      metalness: 0.4,
      side: DoubleSide,
    }),
    line: new LineBasicMaterial({ color: LINE_IDLE.clone(), transparent: true, opacity: 0.35 }),
  }
}

function applyFlag(m: TileMaterials, texture: Texture, aspect: number) {
  coverTexture(texture, aspect)
  m.flag.map = texture
  m.flag.needsUpdate = true
}

/** Eases the tile towards its hovered / idle look */
function animateTile(m: TileMaterials, g: Group, active: boolean, showFlag: boolean, dt: number) {
  const k = 1 - Math.exp(-dt * 12)
  g.scale.setScalar(g.scale.x + ((active ? 1.03 : 1) - g.scale.x) * k)
  m.flag.opacity += ((showFlag ? 1 : 0) - m.flag.opacity) * k
  m.top.color.lerp(active ? ACTIVE_TOP : m.baseTop, k)
  m.walls.emissive.lerp(active ? WALL_ACTIVE : WALL_IDLE, k)
  m.walls.emissiveIntensity += ((active ? 1.4 : 0.25) - m.walls.emissiveIntensity) * k
  m.line.color.lerp(active ? LINE_ACTIVE : LINE_IDLE, k)
  m.line.opacity += ((active ? 1 : 0.35) - m.line.opacity) * k
}

function StateTile({
  id,
  geo,
  active,
  onOver,
  onOut,
  onSelect,
}: {
  id: string
  geo: StateGeometry
  active: boolean
  onOver: () => void
  onOut: () => void
  onSelect: (id: string, pointerType: string) => void
}) {
  const group = useRef<Group>(null)
  const [texture, setTexture] = useState<Texture | null>(null)
  const mats = useMemo(() => createTileMaterials(id), [id])

  // Flags are revealed only on hover: load the texture the first time it is needed
  useEffect(() => {
    if (!active || texture) return
    let alive = true
    loadFlag(id).then((t) => {
      if (!alive) return
      applyFlag(mats, t, geo.aspect)
      setTexture(t)
    })
    return () => {
      alive = false
    }
  }, [active, texture, id, geo.aspect, mats])

  useFrame((_, dt) => {
    if (group.current) animateTile(mats, group.current, active, active && !!texture, dt)
  })

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.delta > 6) return // it was a drag, not a click
    onSelect(id, (e.nativeEvent as PointerEvent).pointerType || 'mouse')
  }

  return (
    <group
      ref={group}
      onPointerOver={(e) => {
        e.stopPropagation()
        onOver()
      }}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerOut={(e) => {
        e.stopPropagation()
        onOut()
      }}
      onClick={handleClick}
    >
      <mesh geometry={geo.top} material={mats.top} />
      <mesh geometry={geo.top} material={mats.flag} raycast={() => null} renderOrder={2} />
      <mesh geometry={geo.walls} material={mats.walls} />
      <lineSegments geometry={geo.outline} material={mats.line} raycast={() => null} />
    </group>
  )
}

/* ------------------------------------------------------------------- Arcs */

const ARCS: [string, string][] = [
  ['ny', 'ca'],
  ['dc', 'tx'],
  ['il', 'wa'],
  ['fl', 'co'],
  ['ma', 'ga'],
  ['tx', 'mn'],
  ['az', 'ny'],
  ['hi', 'ca'],
  ['ak', 'wa'],
  ['tn', 'nv'],
]

function Arcs({ states }: { states: StateLite[] }) {
  const curves = useMemo(() => {
    const byId = new Map(states.map((s) => [s.id, s]))
    return ARCS.flatMap(([a, b]) => {
      const sa = byId.get(a)
      const sb = byId.get(b)
      if (!sa || !sb) return []
      const va = toVec3(sa.center[0], sa.center[1], R + 1.2)
      const vb = toVec3(sb.center[0], sb.center[1], R + 1.2)
      const mid = va.clone().add(vb).multiplyScalar(0.5)
      mid.setLength(R + 4 + va.distanceTo(vb) * 0.28)
      return [new QuadraticBezierCurve3(va, mid, vb).getPoints(64)]
    })
  }, [states])

  return (
    <group>
      {curves.map((pts, i) => (
        <Arc key={i} points={pts} delay={i * 0.7} />
      ))}
    </group>
  )
}

function Arc({ points, delay }: { points: Vector3[]; delay: number }) {
  const ref = useRef<{ material: { dashOffset: number } }>(null)
  const colors = useMemo(
    () => points.map((_, i) => new Color('#5b8cff').lerp(new Color('#ff2d55'), i / (points.length - 1))),
    [points],
  )
  useFrame(({ clock }) => {
    if (ref.current) ref.current.material.dashOffset = -((clock.elapsedTime * 0.25 + delay) % 2)
  })
  return (
    <Line
      ref={ref as never}
      points={points}
      vertexColors={colors}
      lineWidth={1.4}
      dashed
      dashScale={1}
      dashSize={0.35}
      gapSize={1.65}
      transparent
      opacity={0.85}
      raycast={() => null}
    />
  )
}

/* ----------------------------------------------------------------- Camera */

function CameraRig({ command, states }: { command: CameraCommand | null; states: StateLite[] }) {
  const { camera, size } = useThree()
  const controls = useRef<OrbitControlsImpl>(null)
  const anim = useRef<{ from: Vector3; to: Vector3; t: number; duration: number } | null>(null)

  const flyTo = (lat: number, lon: number, distance: number, duration = 1.4) => {
    anim.current = { from: camera.position.clone(), to: toVec3(lat, lon, distance), t: 0, duration }
  }

  // On wide screens, shift the globe to the right so the title column stays clear
  useEffect(() => {
    const cam = camera as PerspectiveCamera
    if (size.width >= 1024) cam.setViewOffset(size.width, size.height, -size.width * 0.1, -size.height * 0.04, size.width, size.height)
    else cam.clearViewOffset()
  }, [camera, size.width, size.height])

  // Intro: swoop from space onto the United States
  useEffect(() => {
    flyTo(HOME.lat, HOME.lon, homeDistance(size.width / size.height), 2.6)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!command) return
    const dist = camera.position.length()
    const dir = camera.position.clone().normalize()
    const lat = 90 - (Math.acos(dir.y) * 180) / Math.PI
    const lon = ((Math.atan2(dir.z, -dir.x) * 180) / Math.PI) - 180
    if (command.type === 'zoomIn') flyTo(lat, lon, Math.max(135, dist * 0.75), 0.6)
    if (command.type === 'zoomOut') flyTo(lat, lon, Math.min(600, dist * 1.33), 0.6)
    if (command.type === 'reset') flyTo(HOME.lat, HOME.lon, homeDistance(size.width / size.height), 1.4)
    if (command.type === 'focus' && command.id) {
      const s = states.find((x) => x.id === command.id)
      if (s) flyTo(s.center[0], s.center[1], 170, 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [command])

  useFrame((_, dt) => {
    const a = anim.current
    if (a) {
      a.t = Math.min(1, a.t + dt / a.duration)
      const e = a.t < 0.5 ? 4 * a.t ** 3 : 1 - (-2 * a.t + 2) ** 3 / 2 // easeInOutCubic
      const dir = a.from.clone().normalize().lerp(a.to.clone().normalize(), e).normalize()
      const len = a.from.length() + (a.to.length() - a.from.length()) * e
      camera.position.copy(dir.multiplyScalar(len))
      camera.lookAt(0, 0, 0)
      if (a.t >= 1) anim.current = null
    }
    // Slower rotation when close to the surface
    if (controls.current) controls.current.rotateSpeed = Math.min(0.6, (camera.position.length() - R) / 350)
    controls.current?.update()
  })

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={130}
      maxDistance={650}
      zoomSpeed={0.6}
      onStart={() => (anim.current = null)}
    />
  )
}
