import { transformAsync, ParserOptions, Node } from '@babel/core'
// import {File} from '@babel/types'

type Traversed = {
  code: string | undefined
  ast: Node
}

const traverse = (ast: Node): Traversed => {
  switch (ast.type) {
    case 'Program': {
      const code = ast.body.map((node) => traverse(node).code).join('\n')
      return { code, ast }
    }
    case 'ExpressionStatement': {
      // 一端素通しする？
      return traverse(ast.expression)
    }
    case 'CallExpression': {
      if (ast.callee.type === 'Identifier') {
        // いったん、Identifier なら全部未知の物として扱う
        const args = ast.arguments
          .map((arg) => traverse(arg).code)
          .join(', ')
        console.log(args)
        return {
          code: `${ast.callee.name}(${args})`,
          ast,
        }
      } else {
        break
      }
    }
    case 'NumericLiteral': {
      return {
        code: `${ast.value}`,
        ast,
      }
    }
  }
  console.log(`UNKNOWN ${ast.type}`, ast)
  return {
    code: 'UNKNOWN\n',
    ast,
  }
}

const parseSource = async (code: string) => {
  const plugins: ParserOptions['plugins'] = ['typescript', 'jsx']

  const ast = (
    await transformAsync(code, {
      parserOpts: { plugins },
      ast: true,
    })
  )?.ast

  if (!ast) {
    throw new Error('parsing ast failed.')
  } else {
    const analyzed = traverse(ast.program)
    console.log(analyzed.code)
  }
}

parseSource('alert(3)')
// parseSource('const a = 1 + 2; console.log(a)')
