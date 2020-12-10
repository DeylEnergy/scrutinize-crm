import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {
  PROCESS_SALE,
  PROCESS_RETURN_ITEMS,
  PUT_BUDGET,
} from '../../constants/events'
import {getRowFromStore} from '../queries'

export default async function putBudget({
  store = null,
  type,
  payload,
  parentEvent,
  emitEvent = true,
}: any) {
  const [budget, budgetError] = await handleAsync(
    getRowFromStore(SN.BUDGET, 1, store),
  )

  if (budgetError) {
    return Promise.reject(`Error fetching budget`)
  }

  if (parentEvent === PROCESS_SALE) {
    budget.cashboxValue += payload.saleTotalSum
    delete payload.saleTotalSum
  } else if (parentEvent === PROCESS_RETURN_ITEMS) {
    budget.cashboxValue -= payload.returnTotalSum
    delete payload.returnTotalSum
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
