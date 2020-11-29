import {handleAsync} from '../../utilities'
import {getFullIndexStore, getRowFromIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  PUT_SALE,
  PUT_STAT,
  PUT_PRODUCT_STATS,
  PUT_USER_STATS,
  PUT_CUSTOMER_STATS,
  PUT_SUPPLIER_STATS,
  PROCESS_SALE,
  PUT_ACQUISITION,
  SELL_ACQUISITIONS,
  DELETE_SALE_ITEM,
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
    sort: 'asc',
    matchProperties: {__cartId__: payload.cartId},
  })

  let orderCounter = 0

  const events = []

  const currentDate = new Date()
  const saleDatetime = currentDate.getTime()

  for (const cartItem of cartProducts.reverse()) {
    const productShapeAfterSale = getProductShapeAfterSale(
      cartItem,
      saleDatetime,
    )

    events.push({
      storeName: SN.PRODUCTS,
      cb: ({store}: any) =>
        send({
          type: PUT_PRODUCT,
          payload: productShapeAfterSale,
          store,
          emitEvent: false,
        }),
    })

    events.push({
      storeName: SN.PRODUCTS_STATS,
      cb: ({store}: any) =>
        send({
          type: PUT_PRODUCT_STATS,
          payload: {
            ...cartItem,
            currentDate,
          },
          parentEvent: PROCESS_SALE,
          store,
          emitEvent: false,
        }),
    })

    events.push({
      storeName: SN.ACQUISITIONS,
      cb: ({store, tx}: any) =>
        send({
          type: SELL_ACQUISITIONS,
          payload: {selectedAcquisitions: cartItem.selectedAcquisitions},
          store,
          tx,
          emitEvent: false,
        }),
    })

    events.push({
      storeName: SN.SALES,
      cb: ({store}: any) =>
        send({
          type: PUT_SALE,
          payload: getSaleShapeAfterSale(
            cartItem,
            saleDatetime,
            (orderCounter += 1),
          ),
          store,
          emitEvent: false,
        }),
    })

    events.push({
      storeName: SN.STATS,
      cb: ({store}: any) =>
        send({
          type: PUT_STAT,
          payload: {...cartItem, currentDate},
          parentEvent: PROCESS_SALE,
          store,
          emitEvent: false,
        }),
    })

    const cartParticipants: any = await getRowFromIndexStore({
      storeName: SN.SALES,
      indexName: IN.CART_PARTICIPANTS,
      key: cartItem.__cartId__,
    })

    if (cartParticipants) {
      if (cartParticipants._userId) {
        events.push({
          storeName: SN.USERS_STATS,
          cb: ({store}: any) =>
            send({
              type: PUT_USER_STATS,
              payload: {
                ...cartItem,
                _userId: cartParticipants._userId,
                currentDate,
              },
              parentEvent: PROCESS_SALE,
              store,
              emitEvent: false,
            }),
        })
      }

      if (cartParticipants._customerId) {
        events.push({
          storeName: SN.CUSTOMERS_STATS,
          cb: ({store}: any) =>
            send({
              type: PUT_CUSTOMER_STATS,
              payload: {
                ...cartItem,
                _customerId: cartParticipants._customerId,
                currentDate,
              },
              parentEvent: PROCESS_SALE,
              store,
              emitEvent: false,
            }),
        })
      }
    }

    for (const selectedAcquisition of cartItem.selectedAcquisitions) {
      if (selectedAcquisition._supplierId) {
        const sum = cartItem.salePrice * selectedAcquisition.count

        const income =
          sum - selectedAcquisition.realPrice * selectedAcquisition.count

        events.push({
          storeName: SN.SUPPLIERS_STATS,
          cb: ({store}: any) =>
            send({
              type: PUT_SUPPLIER_STATS,
              payload: {
                sum,
                income,
                _supplierId: selectedAcquisition._supplierId,
                currentDate,
              },
              parentEvent: PROCESS_SALE,
              store,
              emitEvent: false,
            }),
        })
      }
    }

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
  }

  const selectedActiveCart: any = await getRowFromIndexStore({
    storeName: SN.SALES,
    indexName: IN.ACTIVE_CART_ID,
    key: payload.cartId,
  })

  events.push({
    storeName: SN.SALES,
    cb: ({store}: any) =>
      send({
        type: DELETE_SALE_ITEM,
        payload: {id: selectedActiveCart.id},
        store,
        emitEvent: false,
      }),
  })

  const [success] = await handleAsync(pushEvents(events))

  return success
}
