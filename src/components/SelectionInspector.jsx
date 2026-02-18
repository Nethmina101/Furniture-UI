import React from 'react'

export default function SelectionInspector({ item, onChange, onRemove }) {
  if (!item) {
    return (
      <div className="card" style={{ padding: 12 }}>
        <div className="sectionTitle">Selected item</div>
        <div className="muted">Click a furniture item in 2D to edit it.</div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="rowBetween">
        <div className="sectionTitle">Selected: {item.type}</div>
        <button className="btn btnDanger" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="grid2" style={{ gap: 8 }}>
        <label className="field">
          <span>Rotation (°)</span>
          <input
            type="number"
            value={Math.round(item.rotation)}
            onChange={(e) => onChange({ rotation: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Scale</span>
          <input
            type="range"
            min={0.5}
            max={1.8}
            step={0.05}
            value={item.scale}
            onChange={(e) => onChange({ scale: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="grid2" style={{ gap: 8 }}>
        <label className="field">
          <span>Colour</span>
          <input
            type="color"
            value={item.color}
            onChange={(e) => onChange({ color: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Shade</span>
          <input
            type="range"
            min={0}
            max={0.8}
            step={0.05}
            value={item.shade}
            onChange={(e) => onChange({ shade: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="muted" style={{ fontSize: 12 }}>
        Shade affects the drop-shadow in 2D and ambient darkening in 3D.
      </div>
    </div>
  )
}
