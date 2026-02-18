export const furnitureCatalog = [
  {
    type: 'chair',
    label: 'Chair',
    footprint: { w: 60, h: 60 },
    color: '#c9a27e'
  },
  {
    type: 'table',
    label: 'Table',
    footprint: { w: 120, h: 80 },
    color: '#b08d57'
  },
  {
    type: 'bed',
    label: 'Bed',
    footprint: { w: 180, h: 130 },
    color: '#d7d7d7'
  },
  {
    type: 'sofa',
    label: 'Sofa',
    footprint: { w: 180, h: 80 },
    color: '#9bb3c7'
  },
  {
    type: 'wardrobe',
    label: 'Wardrobe',
    footprint: { w: 140, h: 60 },
    color: '#c2b59b'
  },
  {
    type: 'bookshelf',
    label: 'Bookshelf',
    footprint: { w: 100, h: 40 },
    color: '#8b5a2b'
  },
  {
    type: 'plant',
    label: 'Plant',
    footprint: { w: 40, h: 40 },
    color: '#4a7023'
  },
  {
    type: 'rug',
    label: 'Rug',
    footprint: { w: 200, h: 140 },
    color: '#d66e53'
  },
  {
    type: 'tv_unit',
    label: 'TV Unit',
    footprint: { w: 160, h: 40 },
    color: '#333333'
  },
  {
    type: 'window',
    label: 'Window',
    footprint: { w: 100, h: 15 },
    color: '#aaddff'
  }
]

export const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36)

export function makeItem(type, x, y) {
  const def = furnitureCatalog.find((f) => f.type === type)
  if (!def) throw new Error('Unknown furniture type')
  return {
    id: uid(),
    type: def.type,
    x,
    y,
    w: def.footprint.w,
    h: def.footprint.h,
    rotation: 0,
    color: def.color,
    shade: 0.15, // 0..0.8
    scale: 1
  }
}
