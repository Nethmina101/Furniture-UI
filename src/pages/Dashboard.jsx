import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { useDesignStore } from '../store/useDesignStore'

export default function Dashboard() {
  const designs = useDesignStore((s) => s.designs)

  const stats = useMemo(() => {
    const total = designs.length
    const totalItems = designs.reduce((acc, d) => acc + (d.items?.length || 0), 0)
    const avgItems = total ? Math.round((totalItems / total) * 10) / 10 : 0
    const recent = designs.slice(0, 5)

    // Activity over last 7 days
    const now = new Date()
    const activityMap = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      activityMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0
    }
    for (const d of designs) {
      const day = new Date(d.updatedAt).toLocaleDateString('en-US', { weekday: 'short' })
      if (activityMap[day] != null) activityMap[day] += 1
    }
    const activityChart = Object.entries(activityMap).map(([day, count]) => ({ day, count }))

    // Room shape distribution
    const shapeCounts = { RECT: 0, L: 0 }
    for (const d of designs) {
      const shape = d.room?.shape || 'RECT'
      if (shapeCounts[shape] != null) shapeCounts[shape] += 1
    }

    // Items per design progression (for growth chart)
    const growth = designs
      .slice()
      .reverse()
      .map((d, i) => ({ design: i + 1, items: d.items?.length || 0 }))

    // Most recent design
    const latestDesign = designs[0] || null

    // Unique room names
    const roomNames = [...new Set(designs.map((d) => d.room?.name).filter(Boolean))]

    return {
      total,
      totalItems,
      avgItems,
      recent,
      activityChart,
      shapeCounts,
      growth,
      latestDesign,
      roomNames
    }
  }, [designs])

  const completionRate = stats.total > 0
    ? Math.min(100, Math.round((stats.totalItems / (stats.total * 5)) * 100))
    : 0

  return (
    <div className="stack">
      {/* KPI Row */}
      <div className="grid3">
        <div className="card">
          <div className="kpiLabel">Saved Designs</div>
          <div className="kpiValue">{stats.total}</div>
          <div className="kpiHint">rooms created</div>
        </div>
        <div className="card">
          <div className="kpiLabel">Furniture Pieces</div>
          <div className="kpiValue">{stats.totalItems}</div>
          <div className="kpiHint">items placed total</div>
        </div>
        <div className="card">
          <div className="kpiLabel">Avg / Design</div>
          <div className="kpiValue">{stats.avgItems}</div>
          <div className="kpiHint">furniture per room</div>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid2">
        {/* Activity chart */}
        <div className="card">
          <h2>Design Activity (Last 7 Days)</h2>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            How many designs you edited each day
          </div>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={stats.activityChart} margin={{ top: 6, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="day" tick={{ fill: 'rgba(233,238,246,0.7)', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'rgba(233,238,246,0.7)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0f1e36',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#6ee7b7"
                  strokeWidth={2.5}
                  dot={{ fill: '#6ee7b7', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance metrics */}
        <div className="card">
          <h2>Your Performance</h2>
          <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
            Personal design metrics & insights
          </div>
          <div className="perfMetrics">
            <div className="perfMetricItem">
              <div className="perfMetricLabel">Design Completion Rate</div>
              <div className="perfProgressBar">
                <div
                  className="perfProgressFill"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="perfMetricValue">{completionRate}%</div>
            </div>

            <div className="perfMetricItem">
              <div className="perfMetricLabel">Room Types</div>
              <div className="perfRoomTypes">
                <div className="perfRoomBadge">
                  <span>▭ Rectangular</span>
                  <span className="perfRoomCount">{stats.shapeCounts.RECT}</span>
                </div>
                <div className="perfRoomBadge">
                  <span>⌐ L-Shaped</span>
                  <span className="perfRoomCount">{stats.shapeCounts.L}</span>
                </div>
              </div>
            </div>

            <div className="perfMetricItem">
              <div className="perfMetricLabel">Latest Design</div>
              <div className="perfLatest">
                {stats.latestDesign ? (
                  <>
                    <span className="perfLatestName">{stats.latestDesign.room?.name}</span>
                    <span className="perfLatestMeta">
                      {stats.latestDesign.items?.length || 0} pieces ·{' '}
                      {new Date(stats.latestDesign.updatedAt).toLocaleDateString()}
                    </span>
                  </>
                ) : (
                  <span className="muted">No designs yet</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Growth chart */}
      {stats.growth.length > 1 && (
        <div className="card">
          <h2>Furniture Count per Design</h2>
          <div className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
            How complex each of your designs is (oldest → newest)
          </div>
          <div style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer>
              <BarChart data={stats.growth} margin={{ top: 6, right: 16, left: 0, bottom: 0 }} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="design" label={{ value: 'Design #', position: 'insideBottom', offset: -2, fill: 'rgba(233,238,246,0.5)', fontSize: 11 }} tick={{ fill: 'rgba(233,238,246,0.7)', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: 'rgba(233,238,246,0.7)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#0f1e36',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10
                  }}
                />
                <Bar dataKey="items" fill="rgba(110,231,183,0.55)" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Designs */}
      <div className="card">
        <div className="rowBetween" style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0 }}>Recent Designs</h2>
          <Link className="btn btnPrimary" to="/designer">
            + New Design
          </Link>
        </div>
        {stats.recent.length ? (
          <div className="table">
            <div className="tableRow tableHead" style={{ gridTemplateColumns: '2fr 1fr 2fr' }}>
              <div>Room Name</div>
              <div>Items</div>
              <div>Last Updated</div>
            </div>
            {stats.recent.map((d) => (
              <div
                className="tableRow"
                key={d.id}
                style={{ gridTemplateColumns: '2fr 1fr 2fr' }}
              >
                <div>{d.room?.name}</div>
                <div>{d.items?.length || 0}</div>
                <div className="muted">{new Date(d.updatedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No designs yet. Create one in the Designer.</p>
        )}
      </div>
    </div>
  )
}
