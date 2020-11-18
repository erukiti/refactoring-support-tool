import { transform, ParserOptions, Node } from '@babel/core'
// import {File} from '@babel/types'

type Traversed = {
  code?: string
  value?: number
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
          .map((arg) => {
            const res = traverse(arg)
            if (res.code) {
              return res.code
            } else if (res.value !== undefined) {
              return `${res.value}`
            } else {
              return 'UNKNOWN arguments'
            }
          })
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
        value: ast.value,
        ast,
      }
    }
    case 'BinaryExpression': {
      if (ast.operator === '+') {
        const left = traverse(ast.left)
        const right = traverse(ast.right)
        if (left.value !== undefined && right.value !== undefined) {
          return {
            value: left.value + right.value,
            ast,
          }
        }
      }
      break
    }
  }
  console.log(`UNKNOWN ${ast.type}`, ast)
  return {
    code: 'UNKNOWN\n',
    ast,
  }
}

export const parseSource = (code: string) => {
  const plugins: ParserOptions['plugins'] = ['typescript', 'jsx']

  const ast = transform(code, {
    parserOpts: { plugins },
    ast: true,
  })?.ast

  if (!ast) {
    throw new Error('parsing ast failed.')
  } else {
    return traverse(ast.program)
  }
}
