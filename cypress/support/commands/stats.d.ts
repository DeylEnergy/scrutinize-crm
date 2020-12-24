/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    checkStats(params: {
      value: string
      soldSum: number | string
      incomeSum: number | string
      spentSum: number | string
    }): Chainable<Element>
  }
}
