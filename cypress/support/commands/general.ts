/// <reference types="cypress" />

export function reImportDb() {
  cy.visit('/settings/backup')
    .get('select')
    .select('Import')
    .getByTestId('apply-backup-button')
    .click()
    .getByTestId('re-import-success-toaster')
    .should('exist')
}
