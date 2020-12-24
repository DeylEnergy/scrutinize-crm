/// <reference types="cypress" />

export function reImportDb() {
  // cy.wait(10000)
  cy.visit('/settings/backup')
    // .wait(10000)
    .get('select')
    .select('Import')
    .getByTestId('apply-backup-button')
    .click()
    .getByTestId('re-import-success-toaster')
    .should('exist')
}
