export function printToBuyList(acquisitions: any[]) {
  return acquisitions.map((product: any) => {
    const name = product.name || product._product.nameModel[0]
    const model = product.model || product._product.nameModel[1]
    const nameModel = `${name} ${model}`
    const productId = product._productId
      ? ` (#${product._productId.split('-')[0]})`
      : ''

    const supplierName = product?._supplier?.name || ''

    const {price, count, sum} = product

    return [
      '',
      `${nameModel}${productId}`,
      {value: price.toLocaleString(), type: 'number'},
      {value: count.toLocaleString(), type: 'number'},
      {value: sum.toLocaleString(), type: 'number'},
      supplierName,
      '',
    ]
  })
}

export function processToBuyList(acquisitions: any[]) {
  let stickersTotal = 0

  for (const product of acquisitions) {
    console.log(product.id, '->', product.toPrintStickersCount)
    stickersTotal += Number(product.toPrintStickersCount) || 0
  }

  return {productsTotal: acquisitions.length, stickersTotal}
}
