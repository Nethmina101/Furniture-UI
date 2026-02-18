import React, { useEffect, useMemo, useState } from 'react'
import Canvas2D from '../components/Canvas2D'
import View3D from '../components/View3D'
import FurniturePalette from '../components/FurniturePalette'
import RoomForm from '../components/RoomForm'
import SelectionInspector from '../components/SelectionInspector'
import { useDesignStore } from '../store/useDesignStore'
import { makeItem } from '../utils/furniture'

export default function Designer() {
  const designs = useDesignStore((s) => s.designs)
  const activeId = useDesignStore((s) => s.activeId)
  const setActive = useDesignStore((s) => s.setActive)
  const createDesign = useDesignStore((s) => s.createDesign)
  const updateDesign = useDesignStore((s) => s.updateDesign)

  const active = useMemo(() => {
    const id = activeId ?? designs[0]?.id
    return designs.find((d) => d.id === id) ?? null
  }, [designs, activeId])

  const [tab, setTab] = useState('2D') // 2D | 3D
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    if (!designs.length) {
      const d = createDesign({})
      setActive(d.id)
    } else if (!activeId) {
      setActive(designs[0].id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSelectedId(null)
  }, [active?.id])

  if (!active) {
    return (
      <div className="card">
        <p className="muted">Loading...</p>
      </div>
    )
  }

  const room = active.room
  const items = active.items

  const selected = items.find((x) => x.id === selectedId) ?? null

  const saveRoomPatch = (patch) => {
    updateDesign(active.id, { room: { ...patch } })
  }

  const saveItems = (nextItems) => {
    updateDesign(active.id, { items: nextItems })
  }

  const addFurniture = (type) => {
    // place near room center (cm)
    const x = Math.max(10, room.width / 2 - 60)
    const y = Math.max(10, room.height / 2 - 40)
    const it = makeItem(type, x, y)
    saveItems([...items, it])
    setSelectedId(it.id)
  }

  const patchSelected = (patch) => {
    if (!selected) return
    saveItems(items.map((it) => (it.id === selected.id ? { ...it, ...patch } : it)))
  }

  const removeSelected = () => {
    if (!selected) return
    saveItems(items.filter((it) => it.id !== selected.id))
    setSelectedId(null)
  }

  return (
    <div className="designer">
      <div className="designerLeft">
        <div className="card" style={{ padding: 12 }}>
          <div className="rowBetween" style={{ marginBottom: 8 }}>
            <div>
              <div className="sectionTitle">Workspace</div>
              <div className="muted" style={{ fontSize: 12 }}>
                Active: <strong>{active.room?.name}</strong>
              </div>
            </div>
            <div className="rowEnd">
              <button className={tab === '2D' ? 'btn btnPrimary' : 'btn'} onClick={() => setTab('2D')}>
                2D
              </button>
              <button className={tab === '3D' ? 'btn btnPrimary' : 'btn'} onClick={() => setTab('3D')}>
                3D
              </button>
            </div>
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <button
              className="btn"
              onClick={() => {
                const d = createDesign({})
                setActive(d.id)
              }}
            >
              + New design
            </button>
            <select
              className="select"
              value={active.id}
              onChange={(e) => setActive(e.target.value)}
            >
              {designs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.room?.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <RoomForm room={room} onChange={saveRoomPatch} />

        <div className="card" style={{ padding: 12 }}>
          <div className="sectionTitle">Actions</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            <button className="btn" onClick={() => setSelectedId(null)}>
              Clear selection
            </button>
            <button
              className="btn"
              onClick={() => {
                // quick auto-fit: bring all items within room bounds
                const next = items.map((it) => {
                  const w = it.w * it.scale
                  const h = it.h * it.scale
                  return {
                    ...it,
                    x: Math.min(Math.max(0, it.x), Math.max(0, room.width - w)),
                    y: Math.min(Math.max(0, it.y), Math.max(0, room.height - h))
                  }
                })
                saveItems(next)
              }}
            >
              Fit items in room
            </button>
          </div>
          <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>
            Everything is saved automatically (LocalStorage) for fast demo.
          </div>
        </div>
      </div>

      <div className="designerCenter">
        {tab === '2D' ? (
          <Canvas2D
            room={room}
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChangeItems={saveItems}
          />
        ) : (
          <View3D room={room} items={items} />
        )}
      </div>

      <div className="designerTools">
        <FurniturePalette onAdd={addFurniture} />
        <SelectionInspector item={selected} onChange={patchSelected} onRemove={removeSelected} />
      </div>
    </div>
  )
}
