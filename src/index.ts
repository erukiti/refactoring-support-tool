import { transform, ParserOptions, Node } from '@babel/core'
// import {File} from '@babel/types'

import { Traversed } from './types'
import { AnalysingState } from './analysing-state'

const resolveBody = (body: Traversed[], ast: Node): Traversed => {
  const code = body
    .map((node) => node.code)
    .filter((code) => code)
    .join('\n')
  return { type: 'Code', code, ast }
}

const traverse = (ast: Node, analysingState: AnalysingState): Traversed => {
  switch (ast.type) {
    case 'Program': {
      return resolveBody(
        ast.body.map((node) => traverse(node, analysingState)),
        ast,
      )
    }
    case 'ExpressionStatement': {
      // 一端素通しする？
      return traverse(ast.expression, analysingState)
    }
    case 'CallExpression': {
      if (ast.callee.type === 'Identifier') {
        const func = analysingState.getFromDeclarations(ast.callee.name)
        if (func) {
          return func
        } else {
          const args = ast.arguments
            .map((arg) => {
              const res = traverse(arg, analysingState)
              if (res.code) {
                return res.code
              } else if (res.value !== undefined) {
                return `${res.value}`
              } else {
                console.log('UNKNOWN arguments')
                console.log(res)
                return 'UNKNOWN arguments'
              }
            })
            .join(', ')
          return {
            type: 'Code',
            code: `${ast.callee.name}(${args})`,
            ast,
          }
        }
        // console.log(args)
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
      const left = traverse(ast.left, analysingState)
      const right = traverse(ast.right, analysingState)
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
    case 'VariableDeclaration': {
      ast.declarations.map((decl) => traverse(decl, analysingState))
      return {
        type: 'Nop',
        ast,
      }
    }
    case 'VariableDeclarator': {
      if (ast.init === null) {
        return {
          type: 'Nop',
          ast,
        }
      }
      if (ast.id.type === 'Identifier') {
        analysingState.setToLocalScope(
          ast.id.name,
          traverse(ast.init, analysingState),
        )
        return {
          type: 'Nop',
          ast,
        }
      }
      break
    }
    case 'Identifier': {
      const decl = analysingState.getFromDeclarations(ast.name)
      if (!decl) {
        throw new Error('NOT FOUND declarations')
      }
      return decl
    }
    case 'ArrowFunctionExpression': {
      return traverse(ast.body, analysingState)
    }
    case 'BlockStatement': {
      return resolveBody(
        ast.body.map((node) => traverse(node, analysingState)),
        ast,
      )
    }
    case 'ReturnStatement': {
      if (ast.argument) {
        return traverse(ast.argument, analysingState)
      } else {
        return { type: 'Nop', ast }
      }
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
    return traverse(ast.program, new AnalysingState())
  }
}
