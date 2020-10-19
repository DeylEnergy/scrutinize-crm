import {handleAsync} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import deleteRow from '../deleteRow'
import saveEvent from './saveEvent'

export default async function deleteSaleItem({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const [, saleItemDeleteError] = await handleAsync(
    deleteRow(SN.SALES, payload.id, store),
  )

  if (saleItemDeleteError) {
    return Promise.reject(saleItemDeleteError)
  }

  const passedEvent = {
    type,
    eventDatetime: Date.now(),
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (sale id: ${payload.id}) failed`,
    )
  }

  return savedEvent
}
