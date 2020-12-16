import {handleAsync, getPeriodOfDate, getEmptyPeriod} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {
  PUT_USER_STATS,
  PROCESS_SALE,
  PROCESS_ACQUISITIONS,
  PROCESS_RETURN_ITEMS,
} from '../../constants/events'
import {getRowFromStore} from '../queries'

export default async function putUserStats({
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

    const userIdPeriod = [payload._userId, currentPeriod]

    let [foundPeriod] = await handleAsync(
      getRowFromStore(SN.USERS_STATS, userIdPeriod, store),
    )

    if (!foundPeriod) {
      foundPeriod = getEmptyPeriod()
      foundPeriod.userIdPeriod = userIdPeriod
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

  const [, isUserStatsUpdateError] = await handleAsync(
    putRow(SN.USERS_STATS, updatedPeriod, store),
  )

  if (isUserStatsUpdateError) {
    return Promise.reject(isUserStatsUpdateError)
  }

  const passedEvent = {
    type: PUT_USER_STATS,
    eventDatetime: Date.now(),
    payload: updatedPeriod,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
