import React, { useState } from 'react'
import { furnitureCategories } from '../utils/furniture'

export default function FurniturePalette({ onAdd }) {
  const [openCategory, setOpenCategory] = useState('Living Room')

  return (
    <div className="card" style={{ padding: 12, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="sectionTitle">Furniture</div>
      <div className="categories" style={{ overflowY: 'auto', flex: 1, paddingRight: 4 }}>
        {furnitureCategories.map((c) => (
          <div key={c.category} className="categoryGroup" style={{ marginBottom: 4 }}>
            <button
              className="btn"
              style={{
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: openCategory === c.category ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: openCategory === c.category ? 'bold' : 'normal',
                marginBottom: openCategory === c.category ? 8 : 4
              }}
              onClick={() => setOpenCategory(openCategory === c.category ? null : c.category)}
            >
              <span>{c.category}</span>
              <span>{openCategory === c.category ? '▼' : '▶'}</span>
            </button>
            {openCategory === c.category && (
              <div className="palette" style={{ paddingBottom: 8 }}>
                {c.items.map((f) => (
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
            )}
          </div>
        ))}
      </div>
      <div className="muted" style={{ marginTop: 10, fontSize: 12, flexShrink: 0 }}>
        Tip: Add items then drag, resize and rotate them in the 2D plan.
      </div>
    </div>
  )
}

function iconFor(type) {
  switch (type) {
    case 'chair':
    case 'accent_chair':
    case 'office_chair':
    case 'dining_chair':
    case 'bar_stool':
      return '🪑'
    case 'table':
    case 'dining_table':
    case 'desk':
    case 'console_table':
      return '🪵'
    case 'bed':
      return '🛏️'
    case 'sofa':
    case 'sectional_sofa':
    case 'chesterfield_sofa':
      return '🛋️'
    case 'wardrobe':
    case 'armoire':
    case 'sideboard':
    case 'dresser':
    case 'shoe_storage':
    case 'filing_cabinet':
    case 'nightstand':
      return '🗄️'
    case 'bookshelf':
    case 'bookcase':
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
    case 'ottoman':
    case 'bed_bench':
    case 'bench':
      return '🧘'
    case 'coat_rack':
      return '🧥'
    default:
      return '⬛'
  }
}
