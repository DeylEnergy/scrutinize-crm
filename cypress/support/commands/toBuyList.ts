/// <reference types="cypress" />
import {TEST_DATA_ATTR} from '../../../src/constants'

export function selectAcquiringProduct(label) {
  cy.getByTestId('to-buy-add-product-btn')
    .click()
    .getByTestId('select-menu-options-list')
    .should('be.visible')
    .within(() => cy.contains('div', label).click())
}

export function selectAcquiringProductParticipant({
  role,
  shortProductId,
  name,
}) {
  cy.get(`[${TEST_DATA_ATTR}*=to-buy-item-select-${role}_${shortProductId}]`)
    .click()
    .getByTestId('select-menu-options-list')
    .should('be.visible')
    .within(() => cy.contains('div', name).click())
}

export function changeAcquiringProductCount({shortProductId, count}) {
  const CELL_NAME = 'to-buy-item'
  cy.getByTestId(`${CELL_NAME}-count_${shortProductId}`)
    .dblclick({force: true})
    .getByTestId('popover-input')
    .type(`{backspace}${count}{enter}`)
    .getByTestId(`${CELL_NAME}-count_${shortProductId}`)
}
