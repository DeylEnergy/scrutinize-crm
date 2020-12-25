import {handleAsync, getPeriodOfDate, getEmptyPeriod} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {
  PUT_PRODUCT_STATS,
  PROCESS_SALE,
  PROCESS_ACQUISITIONS,
  PROCESS_RETURN_ITEMS,
} from '../../constants/events'
import {getRow} from '../queries'

export default async function putProductStats({
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

    const productIdPeriod = [payload._productId, currentPeriod]

    let [foundPeriod] = await handleAsync(
      getRow({store, storeName: SN.PRODUCTS_STATS, key: productIdPeriod}),
    )

    if (!foundPeriod) {
      foundPeriod = getEmptyPeriod(SN.PRODUCTS_STATS)
      foundPeriod.productIdPeriod = productIdPeriod
    }

    if (parentEvent === PROCESS_SALE) {
      foundPeriod.soldCount += payload.count
      foundPeriod.soldSum += sum
      foundPeriod.incomeSum += payload.income
    } else if (parentEvent === PROCESS_RETURN_ITEMS) {
      foundPeriod.returnedCount += payload.count
      foundPeriod.soldSum -= sum
      foundPeriod.incomeSum -= payload.income
      foundPeriod.returnedSum += sum
    } else if (parentEvent === PROCESS_ACQUISITIONS) {
      foundPeriod.acquiredCount += payload.count
      foundPeriod.spentSum += sum
    }

    updatedPeriod = foundPeriod
  }

  const [, isProductStatsUpdateError] = await handleAsync(
    putRow(SN.PRODUCTS_STATS, updatedPeriod, store),
  )

  if (isProductStatsUpdateError) {
    return Promise.reject(isProductStatsUpdateError)
  }

  const passedEvent = {
    type: PUT_PRODUCT_STATS,
    eventDatetime: Date.now(),
    payload: updatedPeriod,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
