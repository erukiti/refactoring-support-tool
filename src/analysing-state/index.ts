import { Analysis } from '../types'

export class AnalysingState {
  #stataStack: Array<'File' | 'function' | 'running'>
  #localScopes: Array<{ [name: string]: Analysis[] }>

  constructor() {
    this.#stataStack = ['File']
    this.#localScopes = [{}]
  }

  getDecl(name: string) {
    const localScope = this.#localScopes.find((scope) => name in scope)
    if (localScope) {
      return localScope[name]
    } else {
      return null
    }
  }

  setLocal(name: string, analysis: Analysis[]) {
    // 多重定義でエラーを出すようにする
    const localScope = this.#localScopes[this.#localScopes.length - 1]
    localScope[name] = analysis
  }

  enterFunc() {
    this.#stataStack.push('function')
    this.#localScopes.push({})
  }

  leaveFunc() {
    // assert
    this.#stataStack.pop()
    this.#localScopes.pop()
  }

  runFunc() {
    this.#stataStack.push('running')
  }

  stopRunningFunc() {
    // assert
    this.#stataStack.pop()
  }

  getState() {
    return this.#stataStack[this.#stataStack.length - 1]
  }

  isRunningFunction() {
    return this.getState() === 'running'
  }
}
