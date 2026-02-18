import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { useDesignStore } from '../store/useDesignStore'

const typeLabel = {
  chair: 'Chair',
  table: 'Table',
  bed: 'Bed',
  sofa: 'Sofa',
  wardrobe: 'Wardrobe'
}

export default function Dashboard() {
  const designs = useDesignStore((s) => s.designs)

  const stats = useMemo(() => {
    const total = designs.length
    const totalItems = designs.reduce((acc, d) => acc + (d.items?.length || 0), 0)
    const avgItems = total ? Math.round((totalItems / total) * 10) / 10 : 0
    const recent = designs.slice(0, 5)

    const counts = { chair: 0, table: 0, bed: 0, sofa: 0, wardrobe: 0 }
    for (const d of designs) {
      for (const it of d.items || []) {
        if (counts[it.type] != null) counts[it.type] += 1
      }
    }
    const chart = Object.keys(counts).map((k) => ({
      type: typeLabel[k],
      count: counts[k]
    }))

    return { total, totalItems, avgItems, recent, chart }
  }, [designs])

  return (
    <div className="stack">
      <div className="grid3">
        <div className="card">
          <div className="kpiLabel">Saved designs</div>
          <div className="kpiValue">{stats.total}</div>
        </div>
        <div className="card">
          <div className="kpiLabel">Furniture items placed</div>
          <div className="kpiValue">{stats.totalItems}</div>
        </div>
        <div className="card">
          <div className="kpiLabel">Avg items / design</div>
          <div className="kpiValue">{stats.avgItems}</div>
        </div>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="rowBetween">
            <h2>Furniture usage</h2>
            <Link className="btn" to="/designer">
              New design
            </Link>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={stats.chart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="muted">
            Useful for store teams to see what customers request most.
          </p>
        </div>

        <div className="card">
          <h2>Recent designs</h2>
          {stats.recent.length ? (
            <div className="table">
              <div className="tableRow tableHead">
                <div>Name</div>
                <div>Items</div>
                <div>Updated</div>
              </div>
              {stats.recent.map((d) => (
                <div className="tableRow" key={d.id}>
                  <div>{d.room?.name}</div>
                  <div>{d.items?.length || 0}</div>
                  <div className="muted">
                    {new Date(d.updatedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="muted">No designs yet. Create one in the Designer.</p>
          )}
        </div>
      </div>
    </div>
  )
}
