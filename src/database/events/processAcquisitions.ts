import {handleAsync} from '../../utilities'
import {getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  PUT_ACQUISITION,
  RECOMPUTE_BUDGET,
  PUT_STAT,
  PUT_PRODUCT_STATS,
  PUT_USER_STATS,
  PUT_SUPPLIER_STATS,
  PROCESS_ACQUISITIONS,
} from '../../constants/events'
import codePrefixes from '../../constants/codePrefixes'
import send from './index'

import pushEvents from '../pushEvents'

function getAcquisitionShape({bought, currentDatetime, currentOrder}: any) {
  const {
    /* eslint-disable */
    _product,
    _user,
    _supplier,
    toPrintStickersCount,
    neededSinceDatetime,
    name,
    model,
    /* eslint-enable */
    futureProductId,
    ...acquisition
  } = bought

  acquisition._productId = acquisition._productId ?? futureProductId
  acquisition.inStockCount = acquisition.count
  acquisition.datetime = [currentDatetime, currentOrder]
  acquisition.lastChangeDatetime.currentDatetime

  return acquisition
}

export default async function processAcquisitions() {
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
              acquisitionId: cur.id,
              productId: cur._productId || cur.futureProductId,
              code: `${codePrefixes[SN.ACQUISITIONS]}::${cur.id}`,
              nameModel: cur?._product?.nameModel || [cur.name, cur.model],
            },
          ]
        : total,
    [],
  )

  let currentOrder = 0

  const currentDate = new Date()
  const currentDatetime = currentDate.getTime()

  let events: any[] = []

  for (const bought of boughtProducts.reverse()) {
    const itemEvents = [
      {
        storeName: SN.PRODUCTS,
        cb: ({store}: any) =>
          send({type: PUT_PRODUCT, payload: bought, store, emitEvent: false}),
      },
      {
        storeName: SN.PRODUCTS_STATS,
        cb: ({store}: any) =>
          send({
            type: PUT_PRODUCT_STATS,
            payload: {
              ...bought,
              _productId: bought._productId || bought.futureProductId,
              currentDate,
            },
            parentEvent: PROCESS_ACQUISITIONS,
            store,
            emitEvent: false,
          }),
      },
      {
        storeName: SN.ACQUISITIONS,
        cb: ({store, eventsResults}: any) =>
          send({
            type: PUT_ACQUISITION,
            payload: getAcquisitionShape({
              bought,
              currentDatetime,
              currentOrder: currentOrder++,
            }),
            store,
            emitEvent: false,
            eventsResults,
          }),
      },
      {
        storeName: SN.BUDGET,
        cb: ({store}: any) =>
          send({
            type: RECOMPUTE_BUDGET,
            payload: bought,
            store,
            emitEvent: false,
          }),
      },
      {
        storeName: SN.STATS,
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

    if (bought._supplierId) {
      events.push({
        storeName: SN.SUPPLIERS_STATS,
        cb: ({store}: any) =>
          send({
            type: PUT_SUPPLIER_STATS,
            payload: {
              ...bought,
              _supplierId: bought._supplierId,
              currentDate,
            },
            parentEvent: PROCESS_ACQUISITIONS,
            store,
            emitEvent: false,
          }),
      })
    }

    events = [...events, ...itemEvents]
  }

  const [, error] = await handleAsync(pushEvents(events))

  if (error) {
    return Promise.reject(`Error on acquisitions processing. ${error}`)
  }

  return {stickersToPrint}
}
