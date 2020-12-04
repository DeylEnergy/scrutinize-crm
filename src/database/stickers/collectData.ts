import {STORE_NAME as SN} from '../../constants'
import readCacheName from '../readCacheName'
import handleIdbRequest from '../handleIdbRequest'

export const storeNames = [SN.PRODUCTS]

export default async function collectData(
  value: any,
  tx: IDBTransaction,
  cache: any,
) {
  const productsObjectStore = tx.objectStore(SN.PRODUCTS)

  const productsCache = readCacheName(cache, SN.PRODUCTS)

  let product = value._productId ? productsCache[value._productId] : {}
  if (!product) {
    product = await handleIdbRequest(productsObjectStore.get(value._productId))
    productsCache[value._productId] = product
  }
  value._product = product

  return value
}
