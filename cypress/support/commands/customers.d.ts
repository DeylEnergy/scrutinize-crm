/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    checkCustomerStats(params: {
      name: string
      currentMonth: {
        value: string
        soldSum: number | string
        incomeSum: number | string
        returnedSum: number | string
      }
    }): Chainable<Element>
  }
}
