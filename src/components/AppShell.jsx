import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

const LinkItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      'navItem ' + (isActive ? 'navItemActive' : '')
    }
  >
    <span className="navIcon" aria-hidden>
      {icon}
    </span>
    <span>{label}</span>
  </NavLink>
)

export default function AppShell() {
  const { user, logout } = useAuth()
  const nav = useNavigate()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">FD</div>
          <div>
            <div className="brandTitle">Furniture Designer</div>
            <div className="brandSub">2D + 3D Room Planner</div>
          </div>
        </div>

        <nav className="nav">
          <LinkItem to="/" label="Home" icon="🏠" />
          <LinkItem to="/dashboard" label="Dashboard" icon="📊" />
          <LinkItem to="/designer" label="Designer" icon="🛋️" />
          <LinkItem to="/designs" label="Saved Designs" icon="💾" />
          <LinkItem to="/about" label="About" icon="ℹ️" />
        </nav>

        <div className="sidebarFooter">
          <div className="userCard">
            <div className="userAvatar" aria-hidden>
              {user?.name?.slice(0, 1) ?? 'U'}
            </div>
            <div>
              <div className="userName">{user?.name}</div>
              <div className="userMeta">{user?.username}</div>
            </div>
          </div>
          <button
            className="btn btnGhost"
            onClick={() => {
              logout()
              nav('/login')
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div className="topbarTitle">Design, Preview, Present</div>
          <div className="topbarHint">
            Create a room in 2D, then view it in 3D.
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
