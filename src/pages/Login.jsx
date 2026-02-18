import React, { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'

export default function Login() {
  const nav = useNavigate()
  const { login, isAuthed } = useAuth()
  const [username, setUsername] = useState('designer')
  const [password, setPassword] = useState('designer123')
  const [error, setError] = useState('')

  const credsHint = useMemo(
    () =>
      `Demo credentials:\n- designer / designer123`,
    []
  )

  // Don't navigate during render; it can cause blank screens/loops.
  if (isAuthed) return <Navigate to="/" replace />

  return (
    <div className="authWrap">
      <div className="authCard">
        <div className="authHeader">
          <div className="brandMark">FD</div>
          <div>
            <div className="authTitle">Designer Login</div>
            <div className="authSub">
              Secure access for in-store designers.
            </div>
          </div>
        </div>

        <form
          className="authForm"
          onSubmit={(e) => {
            e.preventDefault()
            setError('')
            const res = login({ username, password })
            if (!res.ok) setError(res.message)
            else nav('/')
          }}
        >
          <label className="field">
            <span>Username</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {error ? <div className="alert">{error}</div> : null}

          <button className="btn btnPrimary" type="submit">
            Sign in
          </button>

          <pre className="authHint">{credsHint}</pre>
        </form>
      </div>
    </div>
  )
}
