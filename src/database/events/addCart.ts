import {handleAsync} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {PUT_CART, PUT_CART_PARTICIPANTS} from '../../constants/events'
import send from './index'
import pushEvents from '../pushEvents'

export default async function addCart({payload}: any) {
  const {activeCartId, userId} = payload
  const events = [
    {
      storeName: SN.SALES,
      cb: ({store}: any) =>
        send({
          type: PUT_CART,
          payload: {activeCartId},
          store,
          emitEvent: false,
        }),
    },
    {
      storeName: SN.SALES,
      cb: ({store}: any) =>
        send({
          type: PUT_CART_PARTICIPANTS,
          payload: {__cartId__: activeCartId, _userId: userId},
          store,
          emitEvent: false,
        }),
    },
  ]

  const [, error] = await handleAsync(pushEvents(events))

  if (error) {
    return Promise.reject(`Cart creation failed. ${error}`)
  }

  return true
}
