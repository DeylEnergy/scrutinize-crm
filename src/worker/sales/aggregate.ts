import {getRowFromStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'

export default async function aggregateSales({rows, params}: any) {
  let sales = rows || []
  for (const sale of sales) {
    if (sale._productId) {
      const _product = await getRowFromStore(SN.PRODUCTS, sale._productId)
      sale._product = _product
    }

    if (sale._userId) {
      const _user = await getRowFromStore(SN.USERS, sale._userId)
      sale._user = _user
    }
  }

  // sort alphabetically
  if (!params.limit) {
    sales = sales.sort((a: any, b: any) => {
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

  if (params.format === 'cartIds') {
    const cartIds = sales.map((x: any) => x.__cartId__)
    // @ts-ignore
    return [...new Set(cartIds)]
  }

  return sales
}
