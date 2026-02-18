import { create } from 'zustand'
import { storage } from './storage'

const AUTH_KEY = 'fd_auth_v1'

const demoUsers = [
  { username: 'designer', password: 'designer123', name: 'Store Designer' }
]

export const useAuth = create((set) => ({
  // Keep auth state as plain fields so components reliably re-render on login/logout.
  user: storage.get(AUTH_KEY, null),
  isAuthed: !!storage.get(AUTH_KEY, null),
  login: ({ username, password }) => {
    const u = demoUsers.find(
      (x) => x.username === username.trim() && x.password === password
    )
    if (!u) return { ok: false, message: 'Invalid username or password' }
    const user = { username: u.username, name: u.name }
    storage.set(AUTH_KEY, user)
    set({ user, isAuthed: true })
    return { ok: true }
  },
  logout: () => {
    storage.remove(AUTH_KEY)
    set({ user: null, isAuthed: false })
  }
}))
