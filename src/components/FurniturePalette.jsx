import React from 'react'
import { furnitureCatalog } from '../utils/furniture'

export default function FurniturePalette({ onAdd }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="sectionTitle">Furniture</div>
      <div className="palette">
        {furnitureCatalog.map((f) => (
          <button
            key={f.type}
            className="paletteItem"
            style={{ color: 'white' }}
            onClick={() => onAdd(f.type)}
            title={`Add ${f.label}`}
          >
            <div className="paletteIcon" aria-hidden>
              {iconFor(f.type)}
            </div>
            <div className="paletteLabel">{f.label}</div>
          </button>
        ))}
      </div>
      <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>
        Tip: Add items then drag, resize and rotate them in the 2D plan.
      </div>
    </div>
  )
}

function iconFor(type) {
  switch (type) {
    case 'chair':
      return '🪑'
    case 'table':
      return '🪵'
    case 'bed':
      return '🛏️'
    case 'sofa':
      return '🛋️'
    case 'wardrobe':
      return '🚪'
    case 'bookshelf':
      return '📚'
    case 'plant':
      return '🪴'
    case 'rug':
      return '🧶'
    case 'tv_unit':
      return '📺'
    case 'window':
      return '🪟'
    case 'lamp':
      return '💡'
    case 'coffee_table':
      return '☕'
    case 'ac':
      return '❄️'
    case 'pouf':
      return '🧘'
    default:
      return '⬛'
  }
}
