import {handleAsync, getPeriodOfDate} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_STAT, PROCESS_SALE} from '../../constants/events'
import {getRowFromStore} from '../queries'

function getEmptyPeriod(currentMonthYear: string) {
  return {
    id: Date.now(),
    incomeSum: 0,
    period: currentMonthYear,
    soldSum: 0,
    spentSum: 0,
  }
}

export default async function putStat({
  store = null,
  type,
  payload,
  emitEvent = true,
  parentEvent = null,
}: any) {
  let updatedPeriod = payload
  if (parentEvent === PROCESS_SALE) {
    const {currentDate, sum, income} = payload

    const currentPeriod = getPeriodOfDate(currentDate)

    let [foundPeriod] = await handleAsync(
      getRowFromStore(SN.STATS, currentPeriod, store),
    )

    if (!foundPeriod) {
      foundPeriod = getEmptyPeriod(currentPeriod)
    }

    foundPeriod.soldSum += sum
    foundPeriod.incomeSum += income

    updatedPeriod = foundPeriod
  }

  const [, isStatsUpdateError] = await handleAsync(
    putRow(SN.STATS, updatedPeriod, store),
  )

  if (isStatsUpdateError) {
    return Promise.reject(isStatsUpdateError)
  }

  const passedEvent = {
    type: PUT_STAT,
    eventDatetime: Date.now(),
    payload: updatedPeriod,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
