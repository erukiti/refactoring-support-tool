import { transform, ParserOptions, Node } from '@babel/core'
// import {File} from '@babel/types'

interface TraversedBase {
  type: string
  code?: string
  value?: number | string
  ast: Node
}

interface TraversedNumericValue extends TraversedBase {
  type: 'NumericValue'
  value: number
  ast: Node
}

interface TraversedStringValue extends TraversedBase {
  type: 'StringValue'
  value: string
  ast: Node
}

interface TraversedCode extends TraversedBase {
  type: 'Code'
  code: string
  ast: Node
}

type Traversed =
  | TraversedCode
  | TraversedNumericValue
  | TraversedStringValue

const traverse = (ast: Node): Traversed => {
  switch (ast.type) {
    case 'Program': {
      const code = ast.body
        .map((node) => traverse(node)?.code)
        .filter((code) => code)
        .join('\n')
      return { type: 'Code', code, ast }
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
        // console.log(args)
        return {
          type: 'Code',
          code: `${ast.callee.name}(${args})`,
          ast,
        }
      } else {
        break
      }
    }
    case 'NumericLiteral': {
      return {
        type: 'NumericValue',
        value: ast.value,
        ast,
      }
    }
    case 'BinaryExpression': {
      const left = traverse(ast.left)
      const right = traverse(ast.right)
      if (left.type === 'NumericValue' && right.type === 'NumericValue') {
        switch (ast.operator) {
          case '+':
            return {
              type: 'NumericValue',
              value: left.value + right.value,
              ast,
            }
          case '*':
            return {
              type: 'NumericValue',
              value: left.value * right.value,
              ast,
            }
          case '-':
            return {
              type: 'NumericValue',
              value: left.value - right.value,
              ast,
            }
          case '/':
            return {
              type: 'NumericValue',
              value: left.value / right.value,
              ast,
            }
        }
      }
      break
    }
  }
  console.log(`UNKNOWN ${ast.type}`, ast)
  return {
    type: 'Code',
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
