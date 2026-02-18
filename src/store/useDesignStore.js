import { create } from 'zustand'
import { storage } from './storage'

const KEY = 'fd_designs_v1'

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

const defaultRoom = {
  name: 'New Room',
  width: 450,
  height: 320,
  shape: 'RECT', // RECT | L
  color: '#f5f5f5',
  wallColor: '#d9d9d9'
}

export const useDesignStore = create((set, get) => ({
  designs: storage.get(KEY, []),
  activeId: null,
  createDesign: (partial) => {
    const d = {
      id: uid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      room: { ...defaultRoom, ...(partial?.room || {}) },
      items: partial?.items || [],
      notes: partial?.notes || ''
    }
    const designs = [d, ...get().designs]
    storage.set(KEY, designs)
    set({ designs, activeId: d.id })
    return d
  },
  setActive: (id) => set({ activeId: id }),
  updateDesign: (id, patch) => {
    const designs = get().designs.map((d) =>
      d.id === id
        ? {
            ...d,
            ...patch,
            updatedAt: new Date().toISOString(),
            room: patch.room ? { ...d.room, ...patch.room } : d.room,
            items: patch.items ?? d.items
          }
        : d
    )
    storage.set(KEY, designs)
    set({ designs })
  },
  deleteDesign: (id) => {
    const designs = get().designs.filter((d) => d.id !== id)
    storage.set(KEY, designs)
    set({ designs, activeId: designs[0]?.id ?? null })
  },
  duplicateDesign: (id) => {
    const d = get().designs.find((x) => x.id === id)
    if (!d) return null
    return get().createDesign({
      room: { ...d.room, name: d.room.name + ' (Copy)' },
      items: d.items.map((it) => ({ ...it, id: uid() })),
      notes: d.notes
    })
  }
}))
