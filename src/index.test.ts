import { parseSource } from '.'

describe('alert(3)', () => {
  test('alert(3)', () => {
    expect(parseSource('alert(3)').code).toBe('alert(3)')
  })

  test('alert(1 + 2)', () => {
    expect(parseSource('alert(1 + 2)').code).toBe('alert(3)')
  })

  test('alert(1 + 1 + 1)', () => {
    expect(parseSource('alert(1 + 1 + 1)').code).toBe('alert(3)')
  })

  test('alert(1 + 1 * 2)', () => {
    expect(parseSource('alert(1 + 1 * 2)').code).toBe('alert(3)')
  })

  test('alert(4 - 1)', () => {
    expect(parseSource('alert(4 - 1)').code).toBe('alert(3)')
  })

  test('alert(9 / 3)', () => {
    expect(parseSource('alert(9 / 3)').code).toBe('alert(3)')
  })

  test('const a = 3; alert(a)', () => {
    expect(parseSource('const a = 3; alert(a)').code).toBe('alert(3)')
  })
  // test('const a = () => 3; alert(a())', () => {
  //   expect(parseSource('const a = () => 3; alert(a())').code).toBe(
  //     'alert(3)',
  //   )
  // })
})
