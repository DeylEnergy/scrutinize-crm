/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    getByTestId(query: string): Chainable<Element>
  }
}
