export function checkUserStats({name, currentMonth}) {
  cy.getByTestId(`user-name-cell_${name}`)
    .dblclick()
    .getByTestId(`user-stats-sold-sum_${currentMonth.value}`)
    .contains(currentMonth.soldSum)
    .getByTestId(`user-stats-income-sum_${currentMonth.value}`)
    .contains(currentMonth.incomeSum)
    .getByTestId(`user-stats-spent-sum_${currentMonth.value}`)
    .contains(currentMonth.spentSum)
    .getByTestId('update-user-sidesheet')
    .parent()
    .get('[data-icon=cross]')
    .click()
}
