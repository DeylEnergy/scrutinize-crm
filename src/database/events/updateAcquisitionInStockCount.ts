import {handleAsync} from '../../utilities'
import {getRow} from '../queries'
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

  const acquisition: any = await getRow({
    storeName: SN.ACQUISITIONS,
    key: payload.id,
  })
  const product: any = await getRow({
    storeName: SN.PRODUCTS,
    key: acquisition._productId,
  })

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
    acquisition._supplier = await getRow({
      storeName: SN.SUPPLIERS,
      key: acquisition._supplierId,
    })
  }

  if (consumer === 'client' && acquisition._userId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {secretKey, ...userData}: any = await getRow({
      storeName: SN.USERS,
      key: acquisition._userId,
    })
    acquisition._user = userData
  }

  return {
    acquisition,
    product,
  }
}
