import React from 'react'

export default function RoomForm({ room, onChange }) {
  return (
    <div className="card" style={{ padding: 12 }}>
      <div className="sectionTitle">Room</div>

      <label className="field">
        <span>Name</span>
        <input
          value={room.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>

      <div className="grid2" style={{ gap: 8 }}>
        <label className="field">
          <span>Width (cm)</span>
          <input
            type="number"
            min={200}
            max={1200}
            value={room.width}
            onChange={(e) => onChange({ width: Number(e.target.value) })}
          />
        </label>
        <label className="field">
          <span>Height (cm)</span>
          <input
            type="number"
            min={200}
            max={1200}
            value={room.height}
            onChange={(e) => onChange({ height: Number(e.target.value) })}
          />
        </label>
      </div>

      <div className="grid2" style={{ gap: 8 }}>
        <label className="field">
          <span>Shape</span>
          <select
            value={room.shape}
            onChange={(e) => onChange({ shape: e.target.value })}
          >
            <option value="RECT">Rectangle</option>
            <option value="L">L-Shape (Top-Right)</option>
            <option value="L_REV">L-Shape (Top-Left)</option>
            <option value="U">U-Shape</option>
            <option value="CIRCLE">Circle</option>
            <option value="OVAL">Oval</option>
            <option value="SEMICIRCLE">Semi-Circle</option>
          </select>
        </label>
        <label className="field">
          <span>Wall colour</span>
          <input
            type="color"
            value={room.wallColor}
            onChange={(e) => onChange({ wallColor: e.target.value })}
          />
        </label>
      </div>

      <label className="field">
        <span>Floor colour</span>
        <input
          type="color"
          value={room.color}
          onChange={(e) => onChange({ color: e.target.value })}
        />
      </label>

      <div className="callout" style={{ marginTop: 10 }}>
        Uses centimetres for realism, but the planner scales automatically.
      </div>
    </div>
  )
}
