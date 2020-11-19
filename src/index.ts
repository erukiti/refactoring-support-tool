import { transform, ParserOptions, Node } from '@babel/core'
// import {File} from '@babel/types'

import { Analysis } from './types'
import { AnalysingState } from './analysing-state'

const resolveCall = (func: Analysis[], analysingState: AnalysingState) => {
  analysingState.runFunc()
  const res = func
    .map((fn) => {
      if (fn.type === 'Node') {
        return analyseNode(fn.node, analysingState)
      } else {
        return fn
      }
    })
    .flat()
  analysingState.stopRunningFunc()

  return res
}

const analyseNode = (
  ast: Node,
  analysingState: AnalysingState,
): Analysis[] => {
  switch (ast.type) {
    case 'Program':
    case 'BlockStatement': {
      return ast.body
        .map((node) => analyseNode(node, analysingState))
        .flat()
    }
    case 'ExpressionStatement': {
      // 一端素通しする？
      return analyseNode(ast.expression, analysingState)
    }
    case 'CallExpression': {
      if (ast.callee.type === 'Identifier') {
        const func = analysingState.getDecl(ast.callee.name)
        if (func) {
          return resolveCall(func, analysingState)
        } else {
          const args = ast.arguments
            .map((arg) => {
              const res = analyseNode(arg, analysingState)[0] // FIXME
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
          return [
            {
              type: 'Code',
              code: `${ast.callee.name}(${args})`,
              ast,
            },
          ]
        }
        // console.log(args)
      } else {
        break
      }
    }
    case 'NumericLiteral': {
      return [
        {
          type: 'NumericValue',
          value: ast.value,
          ast,
        },
      ]
    }
    case 'BinaryExpression': {
      const left = analyseNode(ast.left, analysingState)[0]
      const right = analyseNode(ast.right, analysingState)[0]
      if (left.type === 'NumericValue' && right.type === 'NumericValue') {
        switch (ast.operator) {
          case '+':
            return [
              {
                type: 'NumericValue',
                value: left.value + right.value,
                ast,
              },
            ]
          case '*':
            return [
              {
                type: 'NumericValue',
                value: left.value * right.value,
                ast,
              },
            ]
          case '-':
            return [
              {
                type: 'NumericValue',
                value: left.value - right.value,
                ast,
              },
            ]
          case '/':
            return [
              {
                type: 'NumericValue',
                value: left.value / right.value,
                ast,
              },
            ]
        }
      }
      break
    }
    case 'VariableDeclaration': {
      ast.declarations.map((decl) => analyseNode(decl, analysingState))
      return []
    }
    case 'VariableDeclarator': {
      if (ast.init === null) {
        return []
      }
      if (ast.id.type === 'Identifier') {
        analysingState.setLocal(
          ast.id.name,
          analyseNode(ast.init, analysingState),
        )
        return []
      }
      break
    }
    case 'Identifier': {
      const decl = analysingState.getDecl(ast.name)
      if (!decl) {
        throw new Error('NOT FOUND declarations')
      }
      return decl
    }
    case 'ArrowFunctionExpression': {
      analysingState.enterFunc()
      const res = analyseNode(ast.body, analysingState)
      analysingState.leaveFunc()
      return res
    }
    case 'ReturnStatement': {
      if (analysingState.isRunningFunction()) {
        if (ast.argument) {
          return analyseNode(ast.argument, analysingState)
        } else {
          // ast.argument が null の場合は、undefined literal を返す
          return []
        }
      } else {
        return [
          {
            type: 'Node',
            node: ast,
            ast,
          },
        ]
      }
    }
  }
  console.log(`UNKNOWN ${ast.type}`, ast)
  return [
    {
      type: 'Code',
      code: 'UNKNOWN\n',
      ast,
    },
  ]
}

export const analyseSource = (code: string) => {
  const plugins: ParserOptions['plugins'] = ['typescript', 'jsx']

  const ast = transform(code, {
    parserOpts: { plugins },
    ast: true,
  })?.ast

  if (!ast) {
    throw new Error('parsing ast failed.')
  } else {
    const code = analyseNode(ast.program, new AnalysingState())
      .flatMap((node) => {
        if (node.type === 'Code') {
          return node.code
        } else {
          console.log(node)
          return 'ERROR'
        }
      })
      .join('\n')

    return { code }
  }
}
