import {handleAsync} from '../../utilities'
import {getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  PUT_SALE,
  PUT_STAT,
  PROCESS_SALE,
  PUT_ACQUISITION,
} from '../../constants/events'
import send from './index'

import pushEvents from '../pushEvents'

function getProductShapeAfterSale(cartItem: any, saleDatetime: number) {
  const product = JSON.parse(JSON.stringify(cartItem._product))

  const {count} = cartItem
  product.inStockCount = product.inStockCount - count
  product.soldCount = product.soldCount + count
  product.lastSoldDatetime = saleDatetime

  return product
}

function getSaleShapeAfterSale(
  cartItem: any,
  saleDatetime: number,
  saleOrder: number,
) {
  const {__cartId__, _product, ...soldItem} = cartItem

  soldItem.cartId = __cartId__
  // saleOrder needed for ASC order within idb index store
  soldItem.datetime = [saleDatetime, saleOrder]

  return soldItem
}

export default async function processSale({payload}: any) {
  const cartProducts = await getFullIndexStore({
    storeName: SN.SALES,
    indexName: IN.__CART_ID__,
    direction: 'prev',
    matchProperties: {__cartId__: payload.cartId},
  })

  let successCount = 0

  const currentDate = new Date()
  const saleDatetime = currentDate.getTime()

  for (const cartItem of cartProducts.reverse()) {
    const productShapeAfterSale = getProductShapeAfterSale(
      cartItem,
      saleDatetime,
    )

    const events = [
      {
        storeName: SN.PRODUCTS,
        cb: ({store}: any) =>
          send({
            type: PUT_PRODUCT,
            payload: productShapeAfterSale,
            store,
            emitEvent: false,
          }),
      },
      {
        storeName: SN.SALES,
        cb: ({store}: any) =>
          send({
            type: PUT_SALE,
            payload: getSaleShapeAfterSale(
              cartItem,
              saleDatetime,
              successCount + 1,
            ),
            store,
            emitEvent: false,
          }),
      },
      {
        storeName: SN.STATS,
        cb: ({store}: any) =>
          send({
            type: PUT_STAT,
            payload: {...cartItem, currentDate},
            parentEvent: PROCESS_SALE,
            store,
            emitEvent: false,
          }),
      },
    ]

    if (
      productShapeAfterSale.inStockCount <=
      productShapeAfterSale.lowestBoundCount
    ) {
      const [theProductInBuyList] = await handleAsync(
        getFullIndexStore({
          storeName: SN.ACQUISITIONS,
          indexName: IN.NEEDED_SINCE_DATETIME,
          dataCollecting: false,
          matchProperties: {_productId: productShapeAfterSale.id},
        }),
      )

      // product already in the buy list, no need to schedule the event
      if (!theProductInBuyList.length) {
        events.push({
          storeName: SN.ACQUISITIONS,
          cb: ({store, tx}: any) =>
            send({
              type: PUT_ACQUISITION,
              payload: {
                neededSinceDatetime: saleDatetime,
                _productId: productShapeAfterSale.id,
              },
              store,
              tx,
              emitEvent: false,
            }),
        })
      }
    }

    const [wasProcessed] = await handleAsync(pushEvents(events))

    if (wasProcessed) {
      successCount += 1
    }
  }
  return {successCount}
}
