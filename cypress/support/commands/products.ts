export function checkProductNumbers({
  shortProductId,
  inStockCount,
  soldCount,
  currentMonth,
}) {
  cy.getByTestId(`product-name-cell_${shortProductId}`)
    .dblclick({force: true})
    .get('input[name=inStockCount]')
    .should('has.value', inStockCount)
    .get('input[name=soldCount]')
    .should('has.value', soldCount)
    .getByTestId(`product-stats-sold-count_${currentMonth.value}`)
    .contains(currentMonth.soldCount)
    .getByTestId(`product-stats-acquired-count_${currentMonth.value}`)
    .contains(currentMonth.acquiredCount)
    .getByTestId(`product-stats-returned-count_${currentMonth.value}`)
    .contains(currentMonth.returnedCount)
    .get('[data-cy=update-product-sidesheet]')
    .within(() => {
      cy.getByTestId('sidesheet-scroll-area')
        .scrollTo('bottom')
        .get('.virtual-table-parent')
        .scrollTo('right')
    })
    .getByTestId(`product-stats-sold-sum_${currentMonth.value}`)
    .contains(currentMonth.soldSum)
    .getByTestId(`product-stats-income-sum_${currentMonth.value}`)
    .contains(currentMonth.incomeSum)
    .getByTestId(`product-stats-spent-sum_${currentMonth.value}`)
    .contains(currentMonth.spentSum)
    .getByTestId(`product-stats-returned-sum_${currentMonth.value}`)
    .contains(currentMonth.returnedSum)
    .getByTestId('update-product-sidesheet')
    .parent()
    .get('[data-icon=cross]')
    .click()
}
