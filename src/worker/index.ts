import {handleAsync} from '../utilities'
import * as queries from './queries'
import _putRow from './putRow'
import _pushEvents from './pushEvents'
import _sendEvent from './events'

export function getRows(params: any) {
  let fetcher = queries.getFullIndexStore
  if (params.lastKey || params.limit) {
    fetcher = queries.getAllFromIndexStore
  }

  return fetcher(params)
}

export function getRow({storeName, key}: any) {
  return queries.getRowFromStore(storeName, key)
}

export async function search({storeName, ...params}: any) {
  const [searchFn, noSearchFn] = await handleAsync(
    import(`./${storeName}/search`),
  )

  if (noSearchFn) {
    return []
  }

  if (searchFn.default) {
    return searchFn.default(params)
  }
}

export async function perform({storeName, action}: any) {
  const [actionFn, noActionFn] = await handleAsync(
    import(`./${storeName}/actions/${action}`),
  )

  if (noActionFn) {
    return {}
  }

  if (actionFn.default) {
    return actionFn.default()
  }
}

export const putRow = _putRow
export const pushEvents = _pushEvents

export const sendEvent = _sendEvent
