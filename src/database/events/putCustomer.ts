import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_CUSTOMER} from '../../constants/events'

export default async function putCustomer({
  store = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  const updatedCustomer = payload

  if (!updatedCustomer.id) {
    updatedCustomer.id = uuidv4()
  }

  const [, isCustomerUpdateError] = await handleAsync(
    putRow(SN.CUSTOMERS, updatedCustomer, store),
  )

  if (isCustomerUpdateError) {
    return Promise.reject(isCustomerUpdateError)
  }

  const passedEvent = {
    type: PUT_CUSTOMER,
    eventDatetime: Date.now(),
    payload: updatedCustomer,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  if (consumer === 'client') {
    return updatedCustomer
  }

  return savedEvent
}
