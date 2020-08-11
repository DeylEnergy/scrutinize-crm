import {handleAsync} from '../../utilities'
import {getRowFromStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'
import sendEvent from './index'
import {PUT_ACQUISITION, PUT_PRODUCT} from '../../constants/events'

export default async function completeAcquisition({
  store = null,
  payload,
  eventsResults = [],
}: any) {
  const productEvent = eventsResults.find((x: any) => x.type === PUT_PRODUCT)

  if (!productEvent) {
    return Promise.reject(
      `Cannot get result for previous event of product for acquisition id: ${payload.id}`,
    )
  }

  const [acquisition, isAcquisitionError] = await handleAsync(
    getRowFromStore(SN.ACQUISITIONS, payload.id, store),
  )

  if (isAcquisitionError) {
    return Promise.reject(`Error fetching acquisition ${payload.id}`)
  }

  const {
    neededSinceDatetime,
    name,
    model,
    salePrice,
    lowestBoundCount,
    toPrintStickersCount,
    ...updatedAcquisition
  } = acquisition

  updatedAcquisition._productId = productEvent.payload.id

  const eventDatetime = Date.now()
  updatedAcquisition.lastChangeDatetime = eventDatetime
  updatedAcquisition.datetime = eventDatetime

  const [
    acquisitionUpdateEvent,
    isAcquisitionUpdateEventError,
  ] = await handleAsync(
    sendEvent({
      type: PUT_ACQUISITION,
      payload: updatedAcquisition,
      store,
      emitEvent: false,
    }),
  )

  if (isAcquisitionUpdateEventError) {
    return Promise.reject(`Error completing acquisition ${payload.id}`)
  }

  return acquisitionUpdateEvent
}
