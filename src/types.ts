import { Node } from '@babel/core'

export interface AnalysisBase {
  type: string
  code?: string
  value?: number | string | boolean
  node?: Node
  ast: Node
}

export interface AnalysisLiteral extends AnalysisBase {
  type: 'Literal'
  value: string | number | boolean
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

export type Analysis = AnalysisCode | AnalysisLiteral | AnalysisNode
