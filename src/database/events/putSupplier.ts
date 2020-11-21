import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_SUPPLIER} from '../../constants/events'

export default async function putSupplier({
  store = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  const updatedSupplier = payload

  if (!updatedSupplier.id) {
    updatedSupplier.id = uuidv4()
  }

  const [, isSupplierUpdateError] = await handleAsync(
    putRow(SN.SUPPLIERS, updatedSupplier, store),
  )

  if (isSupplierUpdateError) {
    return Promise.reject(isSupplierUpdateError)
  }

  const passedEvent = {
    type: PUT_SUPPLIER,
    eventDatetime: Date.now(),
    payload: updatedSupplier,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  if (consumer === 'client') {
    return updatedSupplier
  }

  return savedEvent
}
