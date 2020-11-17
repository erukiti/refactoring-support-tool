import {
  transformAsync,
  ParserOptions,
  Visitor,
  traverse,
} from '@babel/core'

const parseSource = async (code: string) => {
  const plugins: ParserOptions['plugins'] = ['typescript', 'jsx']

  const visitor: Visitor = {
    enter(nodePath) {
      console.log('enter', nodePath.type)
    },
    exit(nodePath) {
      console.log('leave', nodePath.type)
    },
  }

  const ast = (
    await transformAsync(code, {
      parserOpts: { plugins },
      ast: true,
    })
  )?.ast

  if (ast) {
    traverse(ast, visitor)
  }
}

parseSource('const a = 1 + 2; console.log(a)').then((ast) =>
  console.log(JSON.stringify(ast, null, '  ')),
)
