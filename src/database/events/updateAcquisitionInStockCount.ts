import {handleAsync} from '../../utilities'
import {getRowFromStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'
import {
  UPDATE_ACQUISITION_IN_STOCK_COUNT,
  PUT_ACQUISITION,
  PUT_PRODUCT,
} from '../../constants/events'
import send from './index'

import pushEvents from '../pushEvents'

export default async function updateAcquisitionInStockCount({
  payload,
  consumer = 'server',
}: any) {
  if (isNaN(payload.inStockCount) || payload.inStockCount < 0) {
    return Promise.reject('Incorrect input number.')
  }

  const acquisition: any = await getRowFromStore(SN.ACQUISITIONS, payload.id)
  const product: any = await getRowFromStore(
    SN.PRODUCTS,
    acquisition._productId,
  )

  const newAqInStockCount = payload.inStockCount
  const inStockCountDifference = newAqInStockCount - acquisition.inStockCount

  product.inStockCount += inStockCountDifference
  acquisition.inStockCount = newAqInStockCount
  acquisition.lastChangeDatetime = Date.now()

  const events = [
    {
      storeName: SN.ACQUISITIONS,
      cb: ({store}: any) =>
        send({
          type: PUT_ACQUISITION,
          payload: acquisition,
          store,
          emitEvent: false,
        }),
    },
    {
      storeName: SN.PRODUCTS,
      cb: ({store}: any) =>
        send({
          type: PUT_PRODUCT,
          payload: product,
          store,
          emitEvent: false,
        }),
    },
  ]

  const [, pushEventsError] = await handleAsync(pushEvents(events))

  if (pushEventsError) {
    return Promise.reject(
      `Cannot ${UPDATE_ACQUISITION_IN_STOCK_COUNT}: ${pushEventsError}`,
    )
  }

  if (consumer === 'client') {
    acquisition._product = product
  }

  if (consumer === 'client' && acquisition._supplierId) {
    acquisition._supplier = await getRowFromStore(
      SN.SUPPLIERS,
      acquisition._supplierId,
    )
  }

  if (consumer === 'client' && acquisition._userId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {secretKey, ...userData}: any = await getRowFromStore(
      SN.USERS,
      acquisition._userId,
    )
    acquisition._user = userData
  }

  return {
    acquisition,
    product,
  }
}
