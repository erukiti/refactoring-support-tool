import { transformAsync, ParserOptions } from '@babel/core'

const parseSource = async (code: string) => {
  const plugins: ParserOptions['plugins'] = ['typescript', 'jsx']

  const ast = (
    await transformAsync(code, { ast: true, parserOpts: { plugins } })
  )?.ast
  return ast
}

parseSource('const a = 1 + 2; console.log(a)').then((ast) =>
  console.log(JSON.stringify(ast, null, '  ')),
)
