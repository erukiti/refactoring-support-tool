import { analyseSource } from '.'

describe('alert(3)', () => {
  test('alert(3)', () => {
    expect(analyseSource('alert(3)').code).toBe('alert(3)')
  })

  test('alert(1 + 2)', () => {
    expect(analyseSource('alert(1 + 2)').code).toBe('alert(3)')
  })

  test('alert(1 + 1 + 1)', () => {
    expect(analyseSource('alert(1 + 1 + 1)').code).toBe('alert(3)')
  })

  test('alert(1 + 1 * 2)', () => {
    expect(analyseSource('alert(1 + 1 * 2)').code).toBe('alert(3)')
  })

  test('alert(4 - 1)', () => {
    expect(analyseSource('alert(4 - 1)').code).toBe('alert(3)')
  })

  test('alert(9 / 3)', () => {
    expect(analyseSource('alert(9 / 3)').code).toBe('alert(3)')
  })

  test('alert(11 % 4', () => {
    expect(analyseSource('alert(11 % 4)').code).toBe('alert(3)')
  })

  test('const a = 3; alert(a)', () => {
    expect(analyseSource('const a = 3; alert(a)').code).toBe('alert(3)')
  })

  test('const a = () => 3; alert(a())', () => {
    expect(analyseSource('const a = () => 3; alert(a())').code).toBe(
      'alert(3)',
    )
  })

  test('const a = () => {return 3}; alert(a())', () => {
    expect(
      analyseSource('const a = () => {return 3}; alert(a())').code,
    ).toBe('alert(3)')
  })
})
