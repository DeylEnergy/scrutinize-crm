// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

export default function injectCommands(path) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const module = require(`${path}`)
  Object.keys(module).forEach(fnName =>
    Cypress.Commands.add(fnName, module[fnName]),
  )
}

Cypress.Commands.add('getByTestId', query => {
  return cy.get(`[data-cy="${query}"]`)
})

injectCommands('./general')
injectCommands('./carts')
injectCommands('./products')
injectCommands('./sales')
injectCommands('./stats')
injectCommands('./users')
injectCommands('./customers')
injectCommands('./suppliers')
injectCommands('./toBuyList')
