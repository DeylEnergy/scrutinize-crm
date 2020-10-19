import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import readCacheName from '../readCacheName'
import handleIdbRequest from '../handleIdbRequest'

export const storeNames = [SN.GROUPS]

export default async function collectData(
  value: any,
  tx: IDBTransaction,
  cache: any,
) {
  const groupsObjectStore = tx.objectStore(SN.GROUPS)

  const groupsCache = readCacheName(cache, SN.GROUPS)

  let group = groupsCache[value._groupId]
  if (value._groupId) {
    group = await handleIdbRequest(groupsObjectStore.get(value._groupId))
    groupsCache[value._groupId] = group
  }
  value._group = group

  return value
}
