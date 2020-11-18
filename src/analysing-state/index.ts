import { Traversed } from '../types'

export class AnalysingState {
  #stataStack: Array<'top' | 'function'>
  #localScope: { [name: string]: Traversed }

  constructor() {
    this.#stataStack = []
    this.#localScope = {}
  }

  getFromDeclarations(name: string) {
    if (name in this.#localScope) {
      return this.#localScope[name]
    } else {
      return null
    }
  }

  setToLocalScope(name: string, traversed: Traversed) {
    // 多重定義でエラーを出すようにする
    this.#localScope[name] = traversed
  }
}
