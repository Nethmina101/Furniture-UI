import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useDesignStore } from '../store/useDesignStore'

export default function Designs() {
  const nav = useNavigate()
  const designs = useDesignStore((s) => s.designs)
  const setActive = useDesignStore((s) => s.setActive)
  const del = useDesignStore((s) => s.deleteDesign)
  const dup = useDesignStore((s) => s.duplicateDesign)

  return (
    <div className="card">
      <div className="rowBetween">
        <h1>Saved Designs</h1>
        <button
          className="btn btnPrimary"
          onClick={() => {
            nav('/designer')
          }}
        >
          Create new
        </button>
      </div>

      {designs.length ? (
        <div className="table">
          <div className="tableRow tableHead">
            <div>Room</div>
            <div>Shape</div>
            <div>Items</div>
            <div>Updated</div>
            <div></div>
          </div>
          {designs.map((d) => (
            <div className="tableRow" key={d.id}>
              <div>{d.room?.name}</div>
              <div className="muted">{d.room?.shape}</div>
              <div>{d.items?.length || 0}</div>
              <div className="muted">{new Date(d.updatedAt).toLocaleString()}</div>
              <div className="rowEnd">
                <button
                  className="btn"
                  onClick={() => {
                    setActive(d.id)
                    nav('/designer')
                  }}
                >
                  Open
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    const nd = dup(d.id)
                    if (nd) {
                      setActive(nd.id)
                      nav('/designer')
                    }
                  }}
                >
                  Duplicate
                </button>
                <button
                  className="btn btnDanger"
                  onClick={() => {
                    if (confirm('Delete this design?')) del(d.id)
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">No saved designs.</p>
      )}
    </div>
  )
}
