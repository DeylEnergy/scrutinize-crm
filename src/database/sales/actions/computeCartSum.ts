import {getFullStore} from '../../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'

export default async function computeCartSum({
  __cartId__,
}: {
  __cartId__: string
}) {
  const rows = await getFullStore({
    storeName: SN.SALES,
    indexName: IN.__CART_ID__,
  })

  const items = rows.filter((x: any) => x.__cartId__ === __cartId__)

  let sum = 0

  for (const item of items) {
    sum += item.sum
  }

  return sum
}
