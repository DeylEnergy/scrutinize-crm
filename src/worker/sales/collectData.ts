import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'

export const storeNames = [SN.PRODUCTS, SN.USERS, SN.CUSTOMERS]

function handleIdbRequest(req: IDBRequest) {
  return new Promise(
    resolve => (req.onsuccess = (res: any) => resolve(res.target.result)),
  )
}

export default async function collectData(
  value: any,
  tx: IDBTransaction,
  cache: any,
) {
  const productsObjectStore = tx.objectStore(SN.PRODUCTS)
  const cartParticipants = tx.objectStore(SN.SALES).index(IN.CART_PARTICIPANTS)
  const usersObjectStore = tx.objectStore(SN.USERS)
  const customersObjectStore = tx.objectStore(SN.CUSTOMERS)

  const productsCache = cache[SN.PRODUCTS] ?? (cache[SN.PRODUCTS] = {})
  const cartParticipantsCache =
    cache[IN.CART_PARTICIPANTS] ?? (cache[IN.CART_PARTICIPANTS] = {})
  const usersCache = cache[SN.USERS] ?? (cache[SN.USERS] = {})
  const customersCache = cache[SN.CUSTOMERS] ?? (cache[SN.CUSTOMERS] = {})

  let product = productsCache[value._productId]
  if (!product) {
    product = await handleIdbRequest(productsObjectStore.get(value._productId))
    productsCache[value._productId] = product
  }
  value._product = product

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

  let customer = usersCache[participants._customerId]
  if (participants._customerId && !customer) {
    customer = await handleIdbRequest(
      customersObjectStore.get(participants._customerId),
    )
    customersCache[participants._customerId] = cache
  }
  customer && (value._customer = customer)

  return value
}
