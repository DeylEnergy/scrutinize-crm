import {handleAsync, getPeriodOfDate, getEmptyPeriod} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {
  PUT_CUSTOMER_STATS,
  PROCESS_SALE,
  PROCESS_RETURN_ITEMS,
} from '../../constants/events'
import {getRow} from '../queries'

export default async function putCustomerStats({
  store = null,
  type,
  payload,
  emitEvent = true,
  parentEvent = null,
}: any) {
  let updatedPeriod = payload
  if (parentEvent === PROCESS_SALE || parentEvent === PROCESS_RETURN_ITEMS) {
    const {currentDate, sum} = payload

    const currentPeriod = getPeriodOfDate(currentDate)

    const customerIdPeriod = [payload._customerId, currentPeriod]

    let [foundPeriod] = await handleAsync(
      getRow({store, storeName: SN.CUSTOMERS_STATS, key: customerIdPeriod}),
    )

    if (!foundPeriod) {
      foundPeriod = getEmptyPeriod(SN.CUSTOMERS_STATS)
      foundPeriod.customerIdPeriod = customerIdPeriod
    }

    if (parentEvent === PROCESS_SALE) {
      foundPeriod.soldSum += sum
      foundPeriod.incomeSum += payload.income
    } else if (parentEvent === PROCESS_RETURN_ITEMS) {
      foundPeriod.soldSum -= sum
      foundPeriod.incomeSum -= payload.income
      foundPeriod.returnedSum += sum
    }

    updatedPeriod = foundPeriod
  }

  const [, isCustomersStatsUpdateError] = await handleAsync(
    putRow(SN.CUSTOMERS_STATS, updatedPeriod, store),
  )

  if (isCustomersStatsUpdateError) {
    return Promise.reject(isCustomersStatsUpdateError)
  }

  const passedEvent = {
    type: PUT_CUSTOMER_STATS,
    eventDatetime: Date.now(),
    payload: updatedPeriod,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
