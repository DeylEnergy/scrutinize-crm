/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    checkProductNumbers(value: {
      inStockCount: number
      soldCount: number
      currentMonth: {
        value: string
        soldCount: number
        acquiredCount: number
        returnedCount: number
        soldSum: number | string
        incomeSum: number | string
        spentSum: number | string
        returnedSum: number | string
      }
    }): Chainable<Element>
  }
}
