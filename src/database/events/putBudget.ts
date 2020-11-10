import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_BUDGET} from '../../constants/events'
import {getRowFromStore} from '../queries'

export default async function putBudget({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  const [budget, budgetError] = await handleAsync(
    getRowFromStore(SN.BUDGET, 1, store),
  )

  if (budgetError) {
    return Promise.reject(`Error fetching budget`)
  }

  payload = {...budget, ...payload}

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
