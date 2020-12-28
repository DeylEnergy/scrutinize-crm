export function checkCustomerStats({name, currentMonth}) {
  cy.getByTestId(`customer-name-cell_${name}`)
    .dblclick()
    .getByTestId(`customer-stats-sold-sum_${currentMonth.value}`)
    .contains(currentMonth.soldSum)
    .getByTestId(`customer-stats-income-sum_${currentMonth.value}`)
    .contains(currentMonth.incomeSum)
    .getByTestId(`customer-stats-returned-sum_${currentMonth.value}`)
    .contains(currentMonth.returnedSum)
    .getByTestId('update-customer-sidesheet')
    .parent()
    .get('[data-icon=cross]')
    .click()
}
