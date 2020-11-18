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

interface TraversedNop extends TraversedBase {
  type: 'Nop'
  ast: Node
}

type Traversed =
  | TraversedCode
  | TraversedNumericValue
  | TraversedStringValue
  | TraversedNop

type AnalysingState = {
  declarations: { [name: string]: Traversed }
}

const getFromDeclarations = (
  analysingState: AnalysingState,
  name: string,
) => {
  // name に該当する定義が見つからない時にエラーといいたいが、
  // CallExpression で見つからない場合の処理を入れたいので、Nullable にする
  if (name in analysingState.declarations) {
    return analysingState.declarations[name]
  } else {
    return null
  }
}

const setBlockDeclarations = (
  analysingState: AnalysingState,
  name: string,
  traversed: Traversed,
) => {
  // 多重定義でエラーを出すようにする
  analysingState.declarations[name] = traversed
}

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
        const func = getFromDeclarations(analysingState, ast.callee.name)
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
        setBlockDeclarations(
          analysingState,
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
      const decl = getFromDeclarations(analysingState, ast.name)
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
    return traverse(ast.program, { declarations: {} })
  }
}
