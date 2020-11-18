import { Node } from '@babel/core'

export interface TraversedBase {
  type: string
  code?: string
  value?: number | string
  ast: Node
}

export interface TraversedNumericValue extends TraversedBase {
  type: 'NumericValue'
  value: number
  ast: Node
}

export interface TraversedStringValue extends TraversedBase {
  type: 'StringValue'
  value: string
  ast: Node
}

export interface TraversedCode extends TraversedBase {
  type: 'Code'
  code: string
  ast: Node
}

export interface TraversedNop extends TraversedBase {
  type: 'Nop'
  ast: Node
}

export type Traversed =
  | TraversedCode
  | TraversedNumericValue
  | TraversedStringValue
  | TraversedNop
