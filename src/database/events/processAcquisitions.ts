import {handleAsync} from '../../utilities'
import {getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  COMPLETE_ACQUISITION,
  RECOMPUTE_BUDGET,
  PUT_STAT,
  PUT_USER_STATS,
  PROCESS_ACQUISITIONS,
} from '../../constants/events'
import codePrefixes from '../../constants/codePrefixes'
import send from './index'

import pushEvents from '../pushEvents'

export default async function process() {
  const boughtProducts = await getFullIndexStore({
    storeName: SN.ACQUISITIONS,
    indexName: IN.NEEDED_SINCE_DATETIME,
    filterBy: 'bought',
    sort: 'asc',
  })

  const stickersToPrint = boughtProducts.reduce(
    (total: any[], cur: any) =>
      cur.toPrintStickersCount
        ? [
            ...total,
            {
              count: cur.toPrintStickersCount,
              id: cur._productId,
              code: `${codePrefixes[SN.ACQUISITIONS]}::${cur.id}`,
              nameModel: cur?._product?.nameModel,
            },
          ]
        : total,
    [],
  )

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

    if (bought._userId) {
      events.push({
        storeName: SN.USERS_STATS,
        cb: ({store}: any) =>
          send({
            type: PUT_USER_STATS,
            payload: {
              ...bought,
              _userId: bought._userId,
              currentDate,
            },
            parentEvent: PROCESS_ACQUISITIONS,
            store,
            emitEvent: false,
          }),
      })
    }

    const [wasProcessed] = await handleAsync(pushEvents(events))

    if (wasProcessed) {
      successCount += 1
    }
  }

  return {successCount, stickersToPrint}
}
