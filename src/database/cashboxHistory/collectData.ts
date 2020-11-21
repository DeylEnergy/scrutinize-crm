import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import readCacheName from '../readCacheName'
import handleIdbRequest from '../handleIdbRequest'

export const storeNames = [SN.USERS]

export default async function collectData(
  value: any,
  tx: IDBTransaction,
  cache: any,
) {
  const usersObjectStore = tx.objectStore(SN.USERS)

  const usersCache = readCacheName(cache, SN.USERS)

  let user = usersCache[value._userId]
  if (value._userId && !user) {
    user = await handleIdbRequest(usersObjectStore.get(value._userId))
    usersCache[value._userId] = user
  }
  user && (value._user = user)

  return value
}
