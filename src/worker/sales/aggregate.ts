import {getRowFromStore, getRowFromIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {handleAsync} from '../../utilities'

export default async function aggregateSales({rows, params}: any) {
  let sales = rows || []

  if (params.format === 'cartIds') {
    const cartIds = sales.map((x: any) => x.__cartId__)
    // @ts-ignore
    return [...new Set(cartIds)]
  }

  const cartParticipantsCache: any = {}
  const usersCache: any = {}
  const customersCache: any = {}
  // we have to fetch additional data for our sales
  for (const sale of sales) {
    if (sale._productId) {
      const _product = await getRowFromStore(SN.PRODUCTS, sale._productId)
      sale._product = _product
    }

    // we don't need additional data for unsold items; so let's skip
    if (sale.__cartId__) {
      continue
    }

    let saleParticipants = cartParticipantsCache[sale.cartId]
    if (!saleParticipants) {
      const [fetchedCartParticipants] = await handleAsync(
        getRowFromIndexStore({
          storeName: SN.SALES,
          indexName: IN.CART_PARTICIPANTS,
          key: sale.cartId,
        }),
      )

      if (fetchedCartParticipants) {
        saleParticipants = fetchedCartParticipants
        cartParticipantsCache[sale.cartId] = saleParticipants
      }
    }

    sale._userId = saleParticipants?._userId
    sale._customerId = saleParticipants?._customerId

    if (sale._userId && !usersCache[sale._userId]) {
      const [_user] = await handleAsync(getRowFromStore(SN.USERS, sale._userId))
      usersCache[sale._userId] = _user
    }

    sale._user = usersCache[sale._userId]

    if (sale._customerId && !customersCache[sale._customerId]) {
      const [_customer] = await handleAsync(
        getRowFromStore(SN.CUSTOMERS, sale._customerId),
      )
      customersCache[sale._customerId] = _customer
    }

    sale._customer = customersCache[sale._customerId]
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

  return sales
}
