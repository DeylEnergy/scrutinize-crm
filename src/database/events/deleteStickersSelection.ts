import {handleAsync} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {getRowFromIndexStore} from '../queries'
import deleteRow from '../deleteRow'
import saveEvent from './saveEvent'

export default async function deleteStickersSelection({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const stickersSelection: any = await getRowFromIndexStore({
    storeName: SN.STICKERS,
    indexName: IN.STICKERS_SELECTION_ID,
    key: payload.stickersSelectionId,
  })

  if (!stickersSelection) {
    return Promise.reject('Cannot find stickers selection.')
  }

  const [, deleteError] = await handleAsync(
    deleteRow(SN.STICKERS, stickersSelection.id, store),
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
      `Event save of "${type}" (stickers id: ${payload.id}) failed`,
    )
  }

  return savedEvent
}
