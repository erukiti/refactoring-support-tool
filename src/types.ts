import { Node } from '@babel/core'

export interface AnalysisBase {
  type: string
  code?: string
  value?: number | string
  node?: Node
  ast: Node
}

export interface AnalysisNumericValue extends AnalysisBase {
  type: 'NumericValue'
  value: number
  ast: Node
}

export interface AnalysisStringValue extends AnalysisBase {
  type: 'StringValue'
  value: string
  ast: Node
}

export interface AnalysisCode extends AnalysisBase {
  type: 'Code'
  code: string
  ast: Node
}

export interface AnalysisNode extends AnalysisBase {
  type: 'Node'
  node: Node
  ast: Node
}

export type Analysis =
  | AnalysisCode
  | AnalysisNumericValue
  | AnalysisStringValue
  | AnalysisNode
