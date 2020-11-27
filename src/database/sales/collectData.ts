import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import readCacheName from '../readCacheName'
import handleIdbRequest from '../handleIdbRequest'

export const storeNames = [SN.PRODUCTS, SN.USERS, SN.CUSTOMERS]

export default async function collectData(
  value: any,
  tx: IDBTransaction,
  cache: any,
) {
  const productsObjectStore = tx.objectStore(SN.PRODUCTS)
  const cartParticipants = tx.objectStore(SN.SALES).index(IN.CART_PARTICIPANTS)
  const usersObjectStore = tx.objectStore(SN.USERS)
  const customersObjectStore = tx.objectStore(SN.CUSTOMERS)

  const productsCache = readCacheName(cache, SN.PRODUCTS)
  const cartParticipantsCache = readCacheName(cache, IN.CART_PARTICIPANTS)
  const usersCache = readCacheName(cache, SN.USERS)
  const customersCache = readCacheName(cache, SN.CUSTOMERS)

  let product = value._productId ? productsCache[value._productId] : {}
  if (!product) {
    product = await handleIdbRequest(productsObjectStore.get(value._productId))
    productsCache[value._productId] = product
  }
  value._product = product

  // we don't need additional data for unsold items; so let's return earlier
  if (value.__cartId__) {
    return value
  }

  // no cartId means no participants
  if (!value.cartId) {
    return value
  }

  let participants = cartParticipantsCache[value.cartId]
  if (!participants) {
    participants =
      (await handleIdbRequest(cartParticipants.get(value.cartId))) ?? {}
    cartParticipantsCache[value.cartId] = participants
  }

  let user = usersCache[participants._userId]
  if (participants._userId && !user) {
    user = await handleIdbRequest(usersObjectStore.get(participants._userId))
    usersCache[participants._userId] = user
  }
  user && (value._user = user)

  let customer = customersCache[participants._customerId]
  if (participants._customerId && !customer) {
    customer = await handleIdbRequest(
      customersObjectStore.get(participants._customerId),
    )
    customersCache[participants._customerId] = customer
  }
  customer && (value._customer = customer)

  return value
}
