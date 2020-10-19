import {handleAsync} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import deleteRow from '../deleteRow'
import saveEvent from './saveEvent'

export default async function deleteToBuyItem({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const [, toBuyItemDeleteError] = await handleAsync(
    deleteRow(SN.ACQUISITIONS, payload.id, store),
  )

  if (toBuyItemDeleteError) {
    return Promise.reject(toBuyItemDeleteError)
  }

  const passedEvent = {
    type,
    eventDatetime: Date.now(),
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (acquisition id: ${payload.id}) failed`,
    )
  }

  return savedEvent
}
