import {handleAsync, getPeriodOfDate, getEmptyPeriod} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {
  PUT_SUPPLIER_STATS,
  PROCESS_SALE,
  PROCESS_ACQUISITIONS,
  PROCESS_RETURN_ITEMS,
} from '../../constants/events'
import {getRowFromStore} from '../queries'

export default async function putSupplierStats({
  store = null,
  type,
  payload,
  emitEvent = true,
  parentEvent = null,
}: any) {
  let updatedPeriod = payload
  if (
    parentEvent === PROCESS_SALE ||
    parentEvent === PROCESS_RETURN_ITEMS ||
    parentEvent === PROCESS_ACQUISITIONS
  ) {
    const {currentDate, sum} = payload

    const currentPeriod = getPeriodOfDate(currentDate)

    const supplierIdPeriod = [payload._supplierId, currentPeriod]

    let [foundPeriod] = await handleAsync(
      getRowFromStore(SN.SUPPLIERS_STATS, supplierIdPeriod, store),
    )

    if (!foundPeriod) {
      foundPeriod = getEmptyPeriod()
      foundPeriod.supplierIdPeriod = supplierIdPeriod
    }

    if (parentEvent === PROCESS_SALE) {
      foundPeriod.soldSum += sum
      foundPeriod.incomeSum += payload.income
    } else if (parentEvent === PROCESS_RETURN_ITEMS) {
      foundPeriod.soldSum -= sum
      foundPeriod.incomeSum -= payload.income
    } else if (parentEvent === PROCESS_ACQUISITIONS) {
      foundPeriod.spentSum += sum
    }

    updatedPeriod = foundPeriod
  }

  const [, isSuppliersStatsUpdateError] = await handleAsync(
    putRow(SN.SUPPLIERS_STATS, updatedPeriod, store),
  )

  if (isSuppliersStatsUpdateError) {
    return Promise.reject(isSuppliersStatsUpdateError)
  }

  const passedEvent = {
    type: PUT_SUPPLIER_STATS,
    eventDatetime: Date.now(),
    payload: updatedPeriod,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
