/// <reference types="cypress" />

function invokeTimes(count, cb) {
  return Array(count)
    .fill('')
    .forEach(cb)
}

export function openCartsDialog() {
  cy.getByTestId('cart-icon').click()
}

export function closeCartsDialog() {
  cy.getByTestId('carts-dialog').within(() => {
    cy.get('[data-icon=cross]').click()
  })
}

export function addNewCart() {
  cy.getByTestId('add-new-cart').click()
}

export function setCartSalesperson(userName) {
  cy.getByTestId('select-cart-salesperson')
    .click()
    .getByTestId('select-menu-search-input')
    .type(userName)
    .getByTestId('select-menu-options-list')
    .contains(userName)
    .click()
    .getByTestId('select-cart-salesperson')
    .contains(userName)
}

export function setCartCustomer(customerName) {
  cy.getByTestId('select-cart-customer')
    .click()
    // .wait(2000)
    .getByTestId('select-menu-search-input')
    .type(customerName)
    .getByTestId('select-menu-options-list')
    .contains(customerName)
    .click()
    .getByTestId('select-cart-customer')
    .contains(customerName)
}

export function addItemToCart({shortProductId, shortAcquisitionId, count = 1}) {
  cy.getByTestId(`name-model-cell_${shortProductId}`)
    .should('be.visible')
    .click()

  invokeTimes(count, () => {
    cy.getByTestId(`acquisition-short-id-cell_${shortAcquisitionId}`)
      .should('be.visible')
      .click()
  })

  cy.getByTestId('return-back-btn').click()
}

export function scrollCartProductSelect(
  position: Cypress.PositionType = 'bottom',
) {
  cy.getByTestId('select-cart-product-popover').within(() => {
    cy.get('.virtual-table-parent').scrollTo(position)
  })
}

export function changeCartItemCount({shortProductId, count}) {
  cy.wait(2000)
    .getByTestId(`count-dropdown_${shortProductId}`)
    .should('be.visible')
    .click()
    .getByTestId('acquisition-count-cell')
    .dblclick({force: true})
    .getByTestId('popover-input')
    .type(`{backspace}${count}{enter}`)
    .getByTestId('acquisition-count-cell')
    .contains(count)
    .getByTestId('close-product-count-popover')
    .click()
}

export function checkCartItemCount({shortProductId, price, count, sum}) {
  cy.getByTestId(`cart-item-price_${shortProductId}`)
    .contains(price)
    .getByTestId(`count-dropdown_${shortProductId}`)
    .contains(count)
    .getByTestId(`cart-item-sum_${shortProductId}`)
    .contains(sum)
}

export function openCartCheckoutDialog() {
  cy.getByTestId('cart-confirm-btn').click()
}
