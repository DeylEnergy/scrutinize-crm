/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    reImportDb(): Chainable<Element>
  }
}
