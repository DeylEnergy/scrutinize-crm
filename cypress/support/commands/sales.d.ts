/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    checkSaleItemCount({
      shortProductId,
      salesperson,
      customerName,
      price,
      count,
      sum,
    }: {
      shortProductId: string
      salesperson: string
      customerName: string
      price: number | string
      count: number
      sum: number | string
    }): Chainable<Element>
  }
}
