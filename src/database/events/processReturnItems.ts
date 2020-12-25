import {handleAsync} from '../../utilities'
import {getAllRows, getRow} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {
  PUT_PRODUCT,
  PUT_SALE,
  PUT_STAT,
  PUT_PRODUCT_STATS,
  PUT_USER_STATS,
  PUT_CUSTOMER_STATS,
  PUT_SUPPLIER_STATS,
  PUT_BUDGET,
  PROCESS_RETURN_ITEMS,
  DELETE_TO_BUY_ITEM,
  DELETE_SALE_ITEM,
  RETURN_ACQUISITIONS,
} from '../../constants/events'
import send from './index'

import pushEvents from '../pushEvents'

function getProductShapeAfterReturn(cartItem: any) {
  const product = JSON.parse(JSON.stringify(cartItem._product))

  const {count} = cartItem
  product.inStockCount = product.inStockCount + count

  return product
}

function getSaleShapeAfterReturn(
  cartItem: any,
  returnDatetime: number,
  returnOrder: number,
) {
  const {__cartId__, _product, ...soldItem} = cartItem

  soldItem.cartId = __cartId__
  // returnOrder needed for ASC order within idb index store
  soldItem.datetime = [returnDatetime, returnOrder]

  soldItem.returned = true

  return soldItem
}

function getReturnTotalSum(cartProducts: any) {
  return cartProducts.reduce(
    (total: number, current: any) => total + current.sum,
    0,
  )
}

export default async function processReturnItems({payload}: any) {
  const cartProducts = await getAllRows({
    storeName: SN.SALES,
    indexName: IN.__CART_ID__,
    direction: 'prev',
    sort: 'asc',
    matchProperties: {__cartId__: payload.cartId},
  })

  let orderCounter = 0

  const events = []

  const currentDate = new Date()
  const returnDatetime = currentDate.getTime()

  for (const cartItem of cartProducts.reverse()) {
    const productShapeAfterReturn = getProductShapeAfterReturn(cartItem)

    events.push({
      storeName: SN.PRODUCTS,
      cb: ({store}: any) =>
        send({
          type: PUT_PRODUCT,
          payload: productShapeAfterReturn,
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
          parentEvent: PROCESS_RETURN_ITEMS,
          store,
          emitEvent: false,
        }),
    })

    events.push({
      storeName: SN.ACQUISITIONS,
      cb: ({store, tx}: any) =>
        send({
          type: RETURN_ACQUISITIONS,
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
          payload: getSaleShapeAfterReturn(
            cartItem,
            returnDatetime,
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
          parentEvent: PROCESS_RETURN_ITEMS,
          store,
          emitEvent: false,
        }),
    })

    const cartParticipants: any = await getRow({
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
              parentEvent: PROCESS_RETURN_ITEMS,
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
              parentEvent: PROCESS_RETURN_ITEMS,
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
              parentEvent: PROCESS_RETURN_ITEMS,
              store,
              emitEvent: false,
            }),
        })
      }
    }

    if (
      productShapeAfterReturn.inStockCount >
      productShapeAfterReturn.lowestBoundCount
    ) {
      const [theProductInBuyList] = await handleAsync(
        getAllRows({
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
  }

  const returnTotalSum = getReturnTotalSum(cartProducts)

  events.push({
    storeName: SN.BUDGET,
    cb: ({store}: any) =>
      send({
        type: PUT_BUDGET,
        payload: {returnTotalSum},
        store,
        parentEvent: PROCESS_RETURN_ITEMS,
        emitEvent: false,
      }),
  })

  const selectedActiveCart: any = await getRow({
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
