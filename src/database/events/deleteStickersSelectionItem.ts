import {handleAsync} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import deleteRow from '../deleteRow'
import saveEvent from './saveEvent'

export default async function deleteStickersSelectionItem({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const [, deleteError] = await handleAsync(
    deleteRow(SN.STICKERS, payload.id, store),
  )

  if (deleteError) {
    return Promise.reject(deleteError)
  }

  const passedEvent = {
    type,
    eventDatetime: Date.now(),
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (sticker id: ${payload.id}) failed`,
    )
  }

  return savedEvent
}
