export function checkStats({value, soldSum, incomeSum, spentSum}) {
  cy.getByTestId(`stats-sold-sum_${value}`)
    .contains(soldSum)
    .getByTestId(`stats-income-sum_${value}`)
    .contains(incomeSum)
    .getByTestId(`stats-spent-sum_${value}`)
    .contains(spentSum)
}
