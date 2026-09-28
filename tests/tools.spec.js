import { describe, it, expect } from 'vitest'
import { applyOrder, getTools, createTool, updateTool, deleteTool, saveToolOrder } from '../src/services/tools.js'

const ids = (list) => list.map((t) => t.id)

describe('applyOrder', () => {
  const list = ['a', 'b', 'c', 'd'].map((id) => ({ id }))
  it('follows the saved order', () => {
    expect(ids(applyOrder(list, ['c', 'a', 'd', 'b']))).toEqual(['c', 'a', 'd', 'b'])
  })
  it('appends tools missing from the order in their natural order', () => {
    expect(ids(applyOrder(list, ['d', 'b']))).toEqual(['d', 'b', 'a', 'c'])
  })
  it('ignores ids that no longer exist', () => {
    expect(ids(applyOrder(list, ['x', 'b']))).toEqual(['b', 'a', 'c', 'd'])
  })
})

describe('tool library (mock backend)', () => {
  it('ships the built-in tools with only sampling implemented', async () => {
    const tools = await getTools()
    expect(tools.length).toBe(7)
    expect(tools.filter((t) => t.ready).map((t) => t.to)).toEqual(['/tools/sampling'])
    expect(tools.find((t) => t.id === 'benford').to).toBe('/tools/benford')
  })

  it('adds, edits, reorders and deletes a custom tool', async () => {
    const t = await createTool({ name: '  Хугацаа хэтрэлт ', description: 'Нэг мөр', category: 'analysis', icon: 'calendar' })
    expect(t).toMatchObject({ id: 'my-001', name: 'Хугацаа хэтрэлт', builtin: false, ready: false, to: '/tools/my-001' })

    const edited = await updateTool(t.id, { name: 'Шинэ нэр', description: 'Нэг мөр', category: 'bogus', icon: 'not-an-icon' })
    expect(edited).toMatchObject({ name: 'Шинэ нэр', category: 'sampling', icon: 'tools' })

    await saveToolOrder([t.id, 'sampling'])
    expect(ids(await getTools()).slice(0, 3)).toEqual([t.id, 'sampling', 'mus'])

    await deleteTool(t.id)
    const after = await getTools()
    expect(after.some((x) => x.id === t.id)).toBe(false)
    expect(after[0].id).toBe('sampling')
  })
})
