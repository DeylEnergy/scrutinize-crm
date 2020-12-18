import {handleAsync} from '../../utilities'
import {getRow} from '../queries'
import {STORE_NAME as SN} from '../../constants'
import sendEvent from './index'
import {PUT_BUDGET} from '../../constants/events'

export default async function recomputeBudget({store = null, payload}: any) {
  const [budget, budgetError] = await handleAsync(
    getRow({store: SN.BUDGET, key: 1}),
  )

  if (budgetError) {
    return Promise.reject(`Error fetching budget`)
  }

  const eventDatetime = Date.now()

  const updatedBudget = {
    ...budget,
    value: budget.value - payload.sum,
    lastChangeDatetime: eventDatetime,
  }

  const [budgetUpdateEvent, isBudgetUpdateEventError] = await handleAsync(
    sendEvent({
      type: PUT_BUDGET,
      payload: updatedBudget,
      store,
      emitEvent: false,
    }),
  )

  if (isBudgetUpdateEventError) {
    return Promise.reject('Error completing budget update')
  }

  return budgetUpdateEvent
}
