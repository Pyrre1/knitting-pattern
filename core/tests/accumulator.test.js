import { computeCellSizes } from '../accumulator.js'

describe('Compute pattern cell sizes', () => {

  test('returns ten 10px cells for 100px / 10 cells', () => {
    expect(computeCellSizes(100,10)).toEqual(new Array(10).fill(10))
  })

  test('returns evenly distributed sizes for 98px / 10 cells', () => {
    const result = computeCellSizes(98,10)
    expect(result).toEqual([10,10,10,10,9,10,10,10,10,9])
    expect(result.reduce((a,b)=>a+b,0)).toBe(98)
  })

  test('return evenly distributed differences for 3040px / 50 cells', () => {
    const result = computeCellSizes(3040,50)

    const min = Math.min(...result)
    const max = Math.max(...result)
    expect(max - min).toBeLessThanOrEqual(1)
  })

  test('returns 0px cells for 0px / 10 cells', () => {
    expect(computeCellSizes(0,10)).toEqual(new Array(10).fill(0))
  })

  test('returns only one 1px cell for 1px / 10 cells', () => {
    const result = computeCellSizes(1,10)
    expect(result.reduce((a,b)=>a+b,0)).toBe(1)
    expect(result.filter(v=>v===1).length).toBe(1)
    expect(result.filter(v=>v===0).length).toBe(9)
    expect(result).toEqual([1,0,0,0,0,0,0,0,0,0])
  })

  test('throws error for cellCount of 0', () => {
    expect(() => computeCellSizes(100,0)).toThrow('cellCount must be greater than 0')
  })
})