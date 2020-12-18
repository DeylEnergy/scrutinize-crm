import {handleAsync} from '../../utilities'
import {getFullStore, getRow} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {DELETE_SALE_ITEM} from '../../constants/events'
import send from './index'
import pushEvents from '../pushEvents'

export default async function removeCart({payload}: any) {
  const selectedActiveCart: any = await getRow({
    storeName: SN.SALES,
    indexName: IN.ACTIVE_CART_ID,
    key: payload.cartId,
  })

  const events = [
    {
      storeName: SN.SALES,
      cb: ({store}: any) =>
        send({
          type: DELETE_SALE_ITEM,
          payload: {id: selectedActiveCart.id},
          store,
          emitEvent: false,
        }),
    },
  ]

  const cartProducts = await getFullStore({
    storeName: SN.SALES,
    indexName: IN.__CART_ID__,
    direction: 'prev',
    matchProperties: {__cartId__: payload.cartId},
  })

  if (cartProducts.length) {
    for (const cartProduct of cartProducts) {
      events.push({
        storeName: SN.SALES,
        cb: ({store}: any) =>
          send({
            type: DELETE_SALE_ITEM,
            payload: {id: cartProduct.id},
            store,
            emitEvent: false,
          }),
      })
    }
  }

  const cartParticipants: any = await getRow({
    storeName: SN.SALES,
    indexName: IN.CART_PARTICIPANTS,
    key: payload.cartId,
  })

  if (cartParticipants) {
    events.push({
      storeName: SN.SALES,
      cb: ({store}: any) =>
        send({
          type: DELETE_SALE_ITEM,
          payload: {id: cartParticipants.id},
          store,
          emitEvent: false,
        }),
    })
  }

  // empty array denotes that the cart didn't have any products or participants
  if (!events.length) {
    return true
  }

  const [, error] = await handleAsync(pushEvents(events))

  if (error) {
    return Promise.reject(`Cannot delete cart. ${error}`)
  }

  return true
}
