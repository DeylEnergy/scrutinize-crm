/// <reference types="cypress" />

export function checkSupplierStats({name, currentMonth}) {
  cy.getByTestId(`supplier-name-cell_${name}`)
    .dblclick()
    .getByTestId(`supplier-stats-sold-sum_${currentMonth.value}`)
    .contains(currentMonth.soldSum)
    .getByTestId(`supplier-stats-income-sum_${currentMonth.value}`)
    .contains(currentMonth.incomeSum)
    .getByTestId(`supplier-stats-spent-sum_${currentMonth.value}`)
    .contains(currentMonth.spentSum)
    .getByTestId('update-supplier-sidesheet')
    .parent()
    .get('[data-icon=cross]')
    .click()
}
