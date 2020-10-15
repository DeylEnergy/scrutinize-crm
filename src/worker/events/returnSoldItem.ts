import {handleAsync} from '../../utilities'
import {getRowFromStore, getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  PUT_SALE,
  PUT_STAT,
  DELETE_TO_BUY_ITEM,
} from '../../constants/events'
import {getPeriodOfDate} from '../../utilities'
import send from './index'
import pushEvents from '../pushEvents'

async function getProductShapeAfterReturn(
  soldItem: any,
  eventDatetime: number,
) {
  const [product] = await handleAsync(
    getRowFromStore(SN.PRODUCTS, soldItem._productId),
  )

  if (!product) {
    return Promise.reject('Cannot find product.')
  }

  return {
    ...product,
    inStockCount: product.inStockCount + soldItem.count,
    soldCount: product.soldCount - soldItem.count,
    lastChangeDatetime: eventDatetime,
  }
}

async function getStatsItemShapeAfterUpdate(
  soldItem: any,
  eventDatetime: number,
) {
  const soldDate = new Date(soldItem.datetime[0])
  const period = getPeriodOfDate(soldDate)

  const [statsItem] = await handleAsync(getRowFromStore(SN.STATS, period))

  if (!statsItem) {
    return Promise.reject('Cannot find period of sold item.')
  }

  return {
    ...statsItem,
    incomeSum: statsItem.incomeSum - soldItem.income,
    soldSum: statsItem.soldSum - soldItem.sum,
    lastChangeDatetime: eventDatetime,
  }
}

export default async function returnSoldItem({payload, emitEvent = true}: any) {
  const [soldItem] = await handleAsync(getRowFromStore(SN.SALES, payload.id))

  if (!soldItem) {
    return Promise.reject('Cannot find sold item.')
  }

  if (soldItem.returned) {
    return Promise.reject('Item is already returned.')
  }

  const eventDatetime = Date.now()

  if (emitEvent) {
    soldItem.lastChangeDatetime = eventDatetime
  }

  const [
    productShapeAfterReturn,
    errorProductShapeAfterReturn,
  ] = await handleAsync(getProductShapeAfterReturn(soldItem, eventDatetime))

  if (errorProductShapeAfterReturn) {
    return Promise.reject(errorProductShapeAfterReturn)
  }

  const [
    statsItemShapeAfterReturn,
    errorStatsItemShapeAfterUpdate,
  ] = await handleAsync(getStatsItemShapeAfterUpdate(soldItem, eventDatetime))

  if (errorStatsItemShapeAfterUpdate) {
    return Promise.reject(errorStatsItemShapeAfterUpdate)
  }

  // specify sold item returned
  const events = [
    {
      storeName: SN.PRODUCTS,
      cb: ({store}: any) =>
        send({
          type: PUT_PRODUCT,
          payload: productShapeAfterReturn,
          store,
          emitEvent: false,
        }),
    },
    {
      storeName: SN.SALES,
      cb: ({store}: any) =>
        send({
          type: PUT_SALE,
          payload: {...soldItem, returned: eventDatetime},
          store,
          emitEvent: false,
        }),
    },
    {
      storeName: SN.STATS,
      cb: ({store}: any) =>
        send({
          type: PUT_STAT,
          payload: statsItemShapeAfterReturn,
          store,
          emitEvent: false,
        }),
    },
  ]

  if (
    productShapeAfterReturn.inStockCount >
    productShapeAfterReturn.lowestBoundCount
  ) {
    const [theProductInBuyList] = await handleAsync(
      getFullIndexStore({
        storeName: SN.ACQUISITIONS,
        indexName: IN.NEEDED_SINCE_DATETIME,
        dataCollecting: false,
        matchProperties: {_productId: productShapeAfterReturn.id},
      }),
    )

    // schedule remove product from the buy list in case it's found
    if (theProductInBuyList.length) {
      events.push({
        storeName: SN.ACQUISITIONS,
        cb: ({store, tx}: any) =>
          send({
            type: DELETE_TO_BUY_ITEM,
            payload: {
              id: theProductInBuyList[0].id,
            },
            store,
            tx,
            emitEvent: false,
          }),
      })
    }
  }

  const [success] = await handleAsync(pushEvents(events))

  if (!success) {
    return Promise.reject('Error while saving events completion.')
  }

  return success
}
