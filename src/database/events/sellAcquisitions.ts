import {handleAsync} from '../../utilities'
import {getRow} from '../queries'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'

export default async function sellAcquisitions({
  store = null,
  tx,
  type,
  payload,
  emitEvent = true,
}: any) {
  for (const selectedAcquisition of payload.selectedAcquisitions) {
    const acquisition: any = await getRow({
      store,
      storeName: SN.ACQUISITIONS,
      key: selectedAcquisition._acquisitionId,
    })

    if (!acquisition.hasOwnProperty('inStockCount')) {
      acquisition.inStockCount = acquisition.count
    }

    acquisition.inStockCount -= selectedAcquisition.count

    const [, isAcquisitionUpdateError] = await handleAsync(
      putRow(SN.ACQUISITIONS, acquisition, store),
    )

    if (isAcquisitionUpdateError) {
      tx.abort()
      return Promise.reject(isAcquisitionUpdateError)
    }
  }

  const eventDatetime = Date.now()

  if (emitEvent) {
    payload.lastChangeDatetime = eventDatetime
  }

  const passedEvent = {
    type,
    eventDatetime,
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
