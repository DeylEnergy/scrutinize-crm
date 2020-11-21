import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import readCacheName from '../readCacheName'
import handleIdbRequest from '../handleIdbRequest'

export const storeNames = [SN.PRODUCTS, SN.USERS, SN.SUPPLIERS]

export default async function collectData(
  value: any,
  tx: IDBTransaction,
  cache: any,
) {
  const productsObjectStore = tx.objectStore(SN.PRODUCTS)
  const usersObjectStore = tx.objectStore(SN.USERS)
  const suppliersObjectStore = tx.objectStore(SN.SUPPLIERS)

  const productsCache = readCacheName(cache, SN.PRODUCTS)
  const usersCache = readCacheName(cache, SN.USERS)
  const suppliersCache = readCacheName(cache, SN.SUPPLIERS)

  let product = productsCache[value._productId]
  if (value._productId && !product) {
    product = await handleIdbRequest(productsObjectStore.get(value._productId))
    productsCache[value._productId] = product
  }
  value._product = product

  let user = usersCache[value._userId]
  if (value._userId && !user) {
    user = await handleIdbRequest(usersObjectStore.get(value._userId))
    usersCache[value._userId] = user
  }
  user && (value._user = user)

  let supplier = suppliersCache[value._supplierId]
  if (value._supplierId && !supplier) {
    supplier = await handleIdbRequest(
      suppliersObjectStore.get(value._supplierId),
    )
    suppliersCache[value._supplierId] = cache
  }
  supplier && (value._supplier = supplier)

  return value
}
