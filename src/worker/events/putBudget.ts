import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_BUDGET} from '../../constants/events'

export default async function putAcquisition({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const [, isBudgetUpdateError] = await handleAsync(
    putRow(SN.BUDGET, payload, store),
  )

  if (isBudgetUpdateError) {
    return Promise.reject(isBudgetUpdateError)
  }

  const passedEvent = {
    type: PUT_BUDGET,
    eventDatetime: payload.lastChangeDatetime || Date.now(),
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
