import {getRowFromStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'

export default async function aggregateAcquisitions({rows, params}: any) {
  let acquisitions = rows || []
  for (const acquisition of acquisitions) {
    if (acquisition._productId) {
      const _product = await getRowFromStore(
        SN.PRODUCTS,
        acquisition._productId,
      )
      acquisition._product = _product
    }

    if (acquisition._supplierId) {
      const _supplier = await getRowFromStore(
        SN.SUPPLIERS,
        acquisition._supplierId,
      )
      acquisition._supplier = _supplier
    }

    if (acquisition._userId) {
      const _user = await getRowFromStore(SN.USERS, acquisition._userId)
      acquisition._user = _user
    }
  }

  // sort alphabetically
  if (!params.limit) {
    acquisitions = acquisitions.sort((a: any, b: any) => {
      const nameFirst = a.name || a._product.nameModel[0]
      const modelFirst = a.model || a._product.nameModel[1]

      const nameSecond = b.name || b._product.nameModel[0]
      const modelSecond = b.model || b._product.nameModel[1]

      const first = [nameFirst.toLowerCase(), modelFirst.toLowerCase()]
      const second = [nameSecond.toLowerCase(), modelSecond.toLowerCase()]

      if (first < second) {
        return -1
      }

      if (first > second) {
        return 1
      }

      return 0
    })
  }

  if (params.format === 'print') {
    acquisitions = acquisitions.map((product: any) => {
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

  if (params.format === 'process') {
    let stickersTotal = 0

    for (const product of acquisitions) {
      console.log(product.id, '->', product.toPrintStickersCount)
      stickersTotal += Number(product.toPrintStickersCount) || 0
    }

    acquisitions = {productsTotal: acquisitions.length, stickersTotal}
  }

  return acquisitions
}
