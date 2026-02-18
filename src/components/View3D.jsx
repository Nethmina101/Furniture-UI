import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'

function hexToThreeColor(hex) {
  try {
    return new THREE.Color(hex)
  } catch {
    return new THREE.Color('#cccccc')
  }
}

function Room({ room }) {
  // cm -> meters for 3D
  const w = room.width / 100
  const h = room.height / 100
  const wallH = 2.4
  const wallT = 0.08

  const floorColor = useMemo(() => hexToThreeColor(room.color), [room.color])
  const wallColor = useMemo(() => hexToThreeColor(room.wallColor), [room.wallColor])

  // L shape: we approximate by adding two floor panels. (keeps renderer simple & fast)
  const isL = room.shape === 'L'
  const cutW = w * 0.35
  const cutH = h * 0.35

  return (
    <group>
      {/* floor */}
      {isL ? (
        <group>
          <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[w - cutW, h]} />
            <meshStandardMaterial color={floorColor} />
          </mesh>
          <mesh
            rotation-x={-Math.PI / 2}
            position={[((w - cutW) / 2 + (w - (w - cutW)) / 2) / 2, 0, -(h / 2 - cutH / 2)]}
            receiveShadow
          >
            <planeGeometry args={[cutW, h - cutH]} />
            <meshStandardMaterial color={floorColor} />
          </mesh>
        </group>
      ) : (
        <mesh rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial color={floorColor} />
        </mesh>
      )}

      {/* walls (3 walls) — one wall removed for visibility/performance */}
      <mesh position={[0, wallH / 2, -h / 2]} receiveShadow castShadow>
        <boxGeometry args={[w, wallH, wallT]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[-w / 2, wallH / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallT, wallH, h]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[w / 2, wallH / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[wallT, wallH, h]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* subtle base */}
      <mesh position={[0, -0.02, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[w + 1, h + 1]} />
        <meshStandardMaterial color={new THREE.Color('#ffffff')} />
      </mesh>
    </group>
  )
}

function Furniture({ item }) {
  const x = item.x / 100
  const z = item.y / 100
  const rot = (item.rotation * Math.PI) / 180
  const scale = item.scale

  // 2D origin: top-left. 3D: center. We'll shift so room center is (0,0)
  // We will set positions in parent with offset.

  const baseColor = useMemo(() => hexToThreeColor(item.color), [item.color])
  const shade = item.shade
  const darker = useMemo(() => baseColor.clone().lerp(new THREE.Color('#000000'), shade * 0.35), [baseColor, shade])

  const dims = {
    w: (item.w / 100) * scale,
    d: (item.h / 100) * scale
  }

  return (
    <group rotation-y={-rot}>
      {item.type === 'chair' ? (
        <Chair color={baseColor} shade={darker} dims={dims} />
      ) : null}
      {item.type === 'table' ? (
        <Table color={baseColor} shade={darker} dims={dims} />
      ) : null}
      {item.type === 'bed' ? <Bed color={baseColor} shade={darker} dims={dims} /> : null}
      {item.type === 'sofa' ? (
        <Sofa color={baseColor} shade={darker} dims={dims} />
      ) : null}
      {item.type === 'wardrobe' ? (
        <Wardrobe color={baseColor} shade={darker} dims={dims} />
      ) : null}
    </group>
  )
}

function Chair({ color, shade, dims }) {
  const seatH = 0.45
  const seatT = 0.06
  const backH = 0.5
  const leg = 0.04
  const w = Math.max(0.4, dims.w)
  const d = Math.max(0.4, dims.d)

  return (
    <group>
      {/* seat */}
      <mesh position={[0, seatH, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, seatT, d]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* back */}
      <mesh position={[0, seatH + backH / 2, -d / 2 + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[w, backH, 0.08]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* legs */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (w / 2 - leg), seatH / 2, sz * (d / 2 - leg)]}
            castShadow
          >
            <cylinderGeometry args={[leg, leg, seatH, 10]} />
            <meshStandardMaterial color={shade} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Table({ color, shade, dims }) {
  const topY = 0.75
  const topT = 0.07
  const legR = 0.05
  const w = Math.max(0.8, dims.w)
  const d = Math.max(0.5, dims.d)

  return (
    <group>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, topT, d]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (w / 2 - 0.08), topY / 2, sz * (d / 2 - 0.08)]}
            castShadow
          >
            <cylinderGeometry args={[legR, legR, topY, 12]} />
            <meshStandardMaterial color={shade} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Bed({ color, shade, dims }) {
  const w = Math.max(1.2, dims.w)
  const d = Math.max(0.9, dims.d)
  return (
    <group>
      {/* frame */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.22, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* mattress */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.96, 0.18, d * 0.96]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* headboard */}
      <mesh position={[0, 0.55, -d / 2 + 0.05]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.7, 0.1]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* pillows */}
      <mesh position={[-w * 0.2, 0.45, -d * 0.25]} castShadow>
        <boxGeometry args={[w * 0.25, 0.12, d * 0.22]} />
        <meshStandardMaterial color={new THREE.Color('#f1f1f1')} />
      </mesh>
      <mesh position={[w * 0.2, 0.45, -d * 0.25]} castShadow>
        <boxGeometry args={[w * 0.25, 0.12, d * 0.22]} />
        <meshStandardMaterial color={new THREE.Color('#f1f1f1')} />
      </mesh>
    </group>
  )
}

function Sofa({ color, shade, dims }) {
  const w = Math.max(1.2, dims.w)
  const d = Math.max(0.6, dims.d)

  return (
    <group>
      {/* base */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.25, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* seat cushion */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.95, 0.18, d * 0.9]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* back */}
      <mesh position={[0, 0.62, -d / 2 + 0.08]} castShadow receiveShadow>
        <boxGeometry args={[w, 0.5, 0.16]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* arms */}
      <mesh position={[-w / 2 + 0.1, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.4, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      <mesh position={[w / 2 - 0.1, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.4, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* legs */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh
            key={`${sx}${sz}`}
            position={[sx * (w / 2 - 0.12), 0.1, sz * (d / 2 - 0.12)]}
            castShadow
          >
            <cylinderGeometry args={[0.04, 0.04, 0.2, 10]} />
            <meshStandardMaterial color={new THREE.Color('#333333')} />
          </mesh>
        ))
      )}
    </group>
  )
}

function Wardrobe({ color, shade, dims }) {
  const w = Math.max(0.8, dims.w)
  const d = Math.max(0.45, dims.d)
  const H = 2.0

  return (
    <group>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, H, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* doors */}
      <mesh position={[-w * 0.25, H / 2, d / 2 + 0.01]} castShadow>
        <boxGeometry args={[w * 0.48, H * 0.95, 0.03]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[w * 0.25, H / 2, d / 2 + 0.01]} castShadow>
        <boxGeometry args={[w * 0.48, H * 0.95, 0.03]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* handles */}
      <mesh position={[-0.02, H / 2, d / 2 + 0.04]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
        <meshStandardMaterial color={new THREE.Color('#666666')} />
      </mesh>
      <mesh position={[0.02, H / 2, d / 2 + 0.04]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
        <meshStandardMaterial color={new THREE.Color('#666666')} />
      </mesh>
    </group>
  )
}

export default function View3D({ room, items }) {
  const w = room.width / 100
  const h = room.height / 100

  // Convert 2D item coordinates (px in planner) into 3D meters within room:
  // In 2D we store in pixels directly; however we set x/y in 2D as pixels.
  // For 3D we interpret x/y as "planner units" scaled to cm by reverse mapping.
  // To keep consistent, Designer page stores items in cm positions instead of px.
  // (See Designer.jsx) so here x/y are cm. Great.

  const centeredItems = useMemo(() => {
    return items.map((it) => {
      // convert from cm (top-left) to meters (centered)
      const x = it.x / 100 - w / 2 + (it.w * it.scale) / 200
      const z = it.y / 100 - h / 2 + (it.h * it.scale) / 200
      return { ...it, _pos: [x, 0, z] }
    })
  }, [items, w, h])

  return (
    <div className="canvas3dWrap">
      <Canvas shadows camera={{ position: [2.8, 2.2, 2.8], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 3]} intensity={1.0} castShadow />

        <Room room={room} />

        {centeredItems.map((it) => (
          <group key={it.id} position={it._pos}>
            <Furniture item={it} />
          </group>
        ))}

        <ContactShadows position={[0, 0.01, 0]} scale={10} blur={2.5} opacity={0.35} />
        <Environment preset="city" />
        <OrbitControls makeDefault />
      </Canvas>

      <div className="canvasLegend">
        <span className="chip">3D Preview</span>
        <span className="muted">One wall removed for clear view (faster + easier).</span>
      </div>
    </div>
  )
}
