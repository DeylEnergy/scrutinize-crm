/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    openCartsDialog(): Chainable<Element>

    closeCartsDialog(): Chainable<Element>

    addNewCart(): Chainable<Element>

    setCartSalesperson(userName: string): Chainable<Element>

    setCartCustomer(customerName: string): Chainable<Element>

    addItemToCart({
      shortProductId,
      shortAcquisitionId,
      count,
    }: {
      shortProductId: string
      shortAcquisitionId: string
      count?: number
    }): Chainable<Element>

    scrollCartProductSelect(params: {
      x?: number
      y?: number
      position?: Cypress.PositionType
    }): Chainable<Element>

    changeCartItemCount({
      shortProductId,
      count,
    }: {
      shortProductId: string
      count: number
    }): Chainable<Element>

    checkCartItemCount({
      shortProductId,
      price,
      count,
      sum,
    }: {
      shortProductId: string
      price: number | string
      count: number
      sum: number | string
    }): Chainable<Element>

    openCartCheckoutDialog(): Chainable<Element>
  }
}
