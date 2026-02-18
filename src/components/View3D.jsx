import React, { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { generateRoomPolygon } from '../utils/roomShape'

function hexToThreeColor(hex) {
  try {
    return new THREE.Color(hex)
  } catch {
    return new THREE.Color('#cccccc')
  }
}



function Room({ room }) {
  // cm -> meters for 3D
  // generateRoomPolygon returns points in same units as input.
  // We can pass w/h in meters directly.
  const w = room.width / 100
  const h = room.height / 100
  const wallH = 2.4
  const wallT = 0.08

  const floorColor = useMemo(() => hexToThreeColor(room.color), [room.color])
  const wallColor = useMemo(() => hexToThreeColor(room.wallColor), [room.wallColor])

  // Generate Geometric Shape
  const shape = useMemo(() => {
    const points = generateRoomPolygon(w, h, room.shape)
    const s = new THREE.Shape()
    if (points.length > 0) {
      s.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        s.lineTo(points[i].x, points[i].y)
      }
    }
    return s
  }, [w, h, room.shape])

  // Generate Wall Shape (contour)
  const wallSegments = useMemo(() => {
    const points = generateRoomPolygon(w, h, room.shape)
    const segments = []

    // Find "front" z threshold to hide front walls.
    // In 3D (x, z), the "front" is max Z (because in 2D it's max Y).
    // Let's find the bounding box of the shape.
    let maxZ = -Infinity
    for (const p of points) maxZ = Math.max(maxZ, p.y)

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % points.length]

      const dx = p2.x - p1.x
      const dy = p2.y - p1.y
      const len = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx)

      // Midpoint of segment
      const midZ = (p1.y + p2.y) / 2

      // Determine if this is a "front" wall.
      // If the segment is roughly horizontal (dy ~ 0) and at the very bottom (maxZ),
      // or if it's the segment closing the shape at the bottom.
      // Simple heuristic: if midZ is very close to maxZ, it's a front wall.
      // Also check if angle indicates it's facing "out"?
      // For rectangular/L shapes, the front wall is usually at the bottom.
      // Let's filter out segments that are within a small threshold of maxZ.

      const isFront = Math.abs(midZ - maxZ) < 0.1 // 10cm tolerance

      if (!isFront) {
        segments.push({
          x: p1.x + dx / 2,
          z: p1.y + dy / 2,
          rot: -angle,
          len: len
        })
      }
    }
    return segments
  }, [w, h, room.shape])

  return (
    <group position={[-w / 2, 0, -h / 2]}>
      {/* Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={floorColor} side={THREE.DoubleSide} />
      </mesh>

      {/* Walls */}
      {wallSegments.map((wg, i) => (
        <mesh
          key={i}
          position={[wg.x, wallH / 2, wg.z]}
          rotation-y={wg.rot}
          receiveShadow
          castShadow
        >
          {/* Wall thickness wallT. Height wallH. Length wg.len */}
          {/* Add a bit of length to close corners? *1.05? or wallT? */}
          <boxGeometry args={[wg.len + wallT, wallH, wallT]} />
          <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Base - white outline underneath */}
      <mesh position={[0, -0.05, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} side={THREE.DoubleSide} />
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
      {item.type === 'bookshelf' ? (
        <Bookshelf color={baseColor} shade={darker} dims={dims} />
      ) : null}
      {item.type === 'plant' ? (
        <Plant color={baseColor} shade={darker} dims={dims} />
      ) : null}
      {item.type === 'rug' ? <Rug color={baseColor} shade={darker} dims={dims} /> : null}
      {item.type === 'tv_unit' ? (
        <TVUnit color={baseColor} shade={darker} dims={dims} />
      ) : null}
      {item.type === 'window' ? (
        <WindowItem color={baseColor} shade={darker} dims={dims} />
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
      // We must account for rotation because x/y is the top-left of the group,
      // but the 3D model is placed at the center.
      // 2D Rotation is clockwise (y down).
      const rot = (it.rotation * Math.PI) / 180
      const wCm = it.w * it.scale
      const hCm = it.h * it.scale

      // Calculate center in 2D cm
      // The offset to center is (w/2, h/2) rotated by rot
      const ox = (wCm / 2)
      const oy = (hCm / 2)
      const rox = ox * Math.cos(rot) - oy * Math.sin(rot)
      const roy = ox * Math.sin(rot) + oy * Math.cos(rot)

      const cx = it.x + rox
      const cy = it.y + roy

      const x = cx / 100 - w / 2
      const z = cy / 100 - h / 2
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

function Bookshelf({ color, shade, dims }) {
  const w = Math.max(0.6, dims.w)
  const d = Math.max(0.3, dims.d)
  const H = 1.5

  return (
    <group>
      {/* Frame */}
      <mesh position={[0, H / 2, -d / 2 + 0.02]} castShadow receiveShadow>
        <boxGeometry args={[w, H, 0.04]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      <mesh position={[-w / 2 + 0.02, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, H, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      <mesh position={[w / 2 - 0.02, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.04, H, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* Shelves */}
      {[0.1, 0.5, 0.9, 1.3].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w - 0.08, 0.04, d - 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function Plant({ color, shade, dims }) {
  const w = Math.max(0.3, dims.w)

  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[w * 0.4, w * 0.3, 0.4, 16]} />
        <meshStandardMaterial color={new THREE.Color('#d2691e')} />
      </mesh>
      {/* Plant */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[w * 0.5, 0]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

function Rug({ color, shade, dims }) {
  const w = Math.max(0.5, dims.w)
  const d = Math.max(0.5, dims.d)

  return (
    <mesh position={[0, 0.01, 0]} receiveShadow rotation-x={-Math.PI / 2}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function TVUnit({ color, shade, dims }) {
  const w = Math.max(1.0, dims.w)
  const d = Math.max(0.4, dims.d)
  const H = 0.45

  return (
    <group>
      {/* Cabinet */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, H, d]} />
        <meshStandardMaterial color={shade} />
      </mesh>
      {/* TV Screen */}
      <mesh position={[0, H + 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.8, 0.6, 0.05]} />
        <meshStandardMaterial color={new THREE.Color('#111111')} roughness={0.2} />
      </mesh>
      {/* Stand */}
      <mesh position={[0, H, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.3, 0.1, 0.2]} />
        <meshStandardMaterial color={new THREE.Color('#222')} />
      </mesh>
    </group>
  )
}

function WindowItem({ color, shade, dims }) {
  const w = Math.max(0.5, dims.w)
  const H = 1.2
  const y = 1.0 + H / 2
  const t = 0.05 // frame thickness

  return (
    <group>
      {/* Frame Top */}
      <mesh position={[0, y + H / 2 - t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, t, 0.1]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} />
      </mesh>
      {/* Frame Bottom */}
      <mesh position={[0, y - H / 2 + t / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, t, 0.1]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} />
      </mesh>
      {/* Frame Left */}
      <mesh position={[-w / 2 + t / 2, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, H - 2 * t, 0.1]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} />
      </mesh>
      {/* Frame Right */}
      <mesh position={[w / 2 - t / 2, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[t, H - 2 * t, 0.1]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} />
      </mesh>

      {/* Cross Bars */}
      <mesh position={[0, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[w - 2 * t, t / 1.5, 0.04]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} />
      </mesh>
      <mesh position={[0, y, 0]} castShadow receiveShadow>
        <boxGeometry args={[t / 1.5, H - 2 * t, 0.04]} />
        <meshStandardMaterial color={new THREE.Color('#fff')} />
      </mesh>

      {/* Glass */}
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[w - 0.02, H - 0.02, 0.05]} />
        <meshStandardMaterial
          color={new THREE.Color('#aaddff')}
          transparent
          opacity={0.3}
          roughness={0}
        />
      </mesh>
    </group>
  )
}
