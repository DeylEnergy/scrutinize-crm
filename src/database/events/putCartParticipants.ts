import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRowFromIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'

export default async function putCartParticipants({
  type,
  payload,
  emitEvent = true,
}: any) {
  const {__cartId__, ...updatedValues} = payload

  const [cartParticipants, cartParticipantsError] = await handleAsync(
    getRowFromIndexStore({
      storeName: SN.SALES,
      indexName: IN.CART_PARTICIPANTS,
      key: __cartId__,
    }),
  )

  if (cartParticipantsError) {
    return Promise.reject(
      `Cannot perform fetch on "${type}" (__cartId__: ${__cartId__})`,
    )
  }

  const updatedCartParticipants = {
    id: cartParticipants?.id || uuidv4(),
    cartParticipants: __cartId__,
    ...cartParticipants,
    ...updatedValues,
  }

  const [, isParticipantsUpdateError] = await handleAsync(
    putRow(SN.SALES, updatedCartParticipants),
  )

  if (isParticipantsUpdateError) {
    return Promise.reject(isParticipantsUpdateError)
  }

  const passedEvent = {
    type,
    eventDatetime: Date.now(),
    payload: updatedCartParticipants,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (__cartId__: ${__cartId__}) failed`,
    )
  }

  return savedEvent
}
