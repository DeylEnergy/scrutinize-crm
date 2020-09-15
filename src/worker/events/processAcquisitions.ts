import {handleAsync} from '../../utilities'
import {getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  COMPLETE_ACQUISITION,
  RECOMPUTE_BUDGET,
  PUT_STAT,
  PROCESS_ACQUISITIONS,
} from '../../constants/events'
import send from './index'

import pushEvents from '../pushEvents'

export default async function process() {
  const boughtProducts = await getFullIndexStore({
    storeName: SN.ACQUISITIONS,
    indexName: IN.NEEDED_SINCE_DATETIME,
    filterBy: 'bought',
  })

  let successCount = 0

  const currentDate = new Date()

  for (const bought of boughtProducts.reverse()) {
    const events = [
      {
        storeName: 'products',
        cb: ({store}: any) =>
          send({type: PUT_PRODUCT, payload: bought, store, emitEvent: false}),
      },
      {
        storeName: 'acquisitions',
        cb: ({store, eventsResults}: any) =>
          send({
            type: COMPLETE_ACQUISITION,
            payload: bought,
            store,
            emitEvent: false,
            eventsResults,
          }),
      },
      {
        storeName: 'budget',
        cb: ({store}: any) =>
          send({
            type: RECOMPUTE_BUDGET,
            payload: bought,
            store,
            emitEvent: false,
          }),
      },
      {
        storeName: 'stats',
        cb: ({store}: any) =>
          send({
            type: PUT_STAT,
            payload: {...bought, currentDate},
            parentEvent: PROCESS_ACQUISITIONS,
            store,
            emitEvent: false,
          }),
      },
    ]

    const [wasProcessed] = await handleAsync(pushEvents(events))

    if (wasProcessed) {
      successCount += 1
    }
  }
  return {successCount}
}
