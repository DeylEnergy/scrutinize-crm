import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_CASHBOX_OPERATION} from '../../constants/events'

export default async function putCashboxOperation({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const [, updateError] = await handleAsync(
    putRow(SN.CASHBOX_HISTORY, payload, store),
  )

  if (updateError) {
    return Promise.reject(updateError)
  }

  const passedEvent = {
    type: PUT_CASHBOX_OPERATION,
    eventDatetime: Date.now(),
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
