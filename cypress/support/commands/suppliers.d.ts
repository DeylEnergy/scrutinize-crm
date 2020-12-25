/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    checkSupplierStats(params: {
      name: string
      currentMonth: {
        value: string
        soldSum: number | string
        incomeSum: number | string
        spentSum: number | string
      }
    }): Chainable<Element>
  }
}
