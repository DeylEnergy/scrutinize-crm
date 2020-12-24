export function checkSaleItemCount({
  shortProductId,
  price,
  count,
  sum,
  salespersonName,
  customerName,
}) {
  cy.getByTestId(`sale-item-price_${shortProductId}`)
    .contains(price)
    .getByTestId(`sale-item-count_${shortProductId}`)
    .contains(count)
    .getByTestId(`sale-item-sum_${shortProductId}`)
    .contains(sum)
    .getByTestId(`sale-item-salesperson_${shortProductId}`)
    .contains(salespersonName)
    .getByTestId(`sale-item-customer_${shortProductId}`)
    .contains(customerName)
}
