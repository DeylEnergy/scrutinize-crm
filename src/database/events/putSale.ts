import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRowFromStore, getAllRows} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'

async function getAcquisitionData(id: string) {
  const aq: any = await getRowFromStore(SN.ACQUISITIONS, id)

  return aq
}

export default async function putSale({
  store = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  // in case sale item was scanned outside from particular cart give it the latest one
  if (!payload.__cartId__ && !payload.cartId) {
    const [saleItem] = await handleAsync(
      getAllRows({
        storeName: SN.SALES,
        indexName: IN.__CART_ID__,
        direction: 'prev',
        limit: 1,
      }),
    )

    if (saleItem.length) {
      payload.__cartId__ = saleItem[0].__cartId__
    } else {
      const datetime = Date.now()
      const uId = uuidv4()
      const newCartId = `${datetime}_${uId}`
      payload.__cartId__ = payload.activeCartId = newCartId
    }
  }

  // if _acquisitionId is provided it will manipulate count
  if (payload.__cartId__ && payload._productId && payload._acquisitionId) {
    const [saleItems] = await handleAsync(
      getAllRows({
        storeName: SN.SALES,
        indexName: IN.__CART_ID__,
        direction: 'prev',
        matchProperties: {__cartId__: payload.__cartId__},
      }),
    )

    let saleItem = saleItems.find(
      (x: any) => x._productId === payload._productId,
    )

    if (saleItem) {
      if (!saleItem.selectedAcquisitions) {
        saleItem.selectedAcquisitions = []
      }

      const acquisition = saleItem.selectedAcquisitions.find(
        (x: any) => x._acquisitionId === payload._acquisitionId,
      )

      if (acquisition) {
        acquisition.count += 1
      } else {
        const [aq, aqError] = await handleAsync(
          getAcquisitionData(payload._acquisitionId),
        )

        if (aqError) {
          return Promise.reject('Cannot find acquisitionId.')
        }

        saleItem.selectedAcquisitions.push({
          _acquisitionId: payload._acquisitionId,
          _supplierId: aq._supplierId,
          count: 1,
          realPrice: aq.price,
        })
      }
    } else {
      saleItem = {}
      const [aq, aqError] = await handleAsync(
        getAcquisitionData(payload._acquisitionId),
      )

      if (aqError) {
        return Promise.reject('Cannot find acquisitionId.')
      }

      saleItem.selectedAcquisitions = [
        {
          _acquisitionId: payload._acquisitionId,
          _supplierId: aq._supplierId,
          count: 1,
          realPrice: aq.price,
        },
      ]
    }

    payload = {...payload, ...saleItem}
  }

  delete payload._acquisitionId

  if (!payload.id) {
    payload.id = uuidv4()
    if (payload._productId) {
      const _product: any = await getRowFromStore(
        SN.PRODUCTS,
        payload._productId,
      )

      payload.salePrice = _product.salePrice

      payload.note = ''

      payload._product = _product
    }
  }

  // eslint-disable-next-line prefer-const
  let {salePrice} = payload

  salePrice = Number(salePrice)
  const count = payload.selectedAcquisitions.reduce(
    (total: number, {count}: any) => total + count,
    0,
  )
  const sum = salePrice * count
  const realSum = payload.selectedAcquisitions.reduce(
    (total: number, {realPrice, count}: any) => total + realPrice * count,
    0,
  )
  const income = sum - realSum

  const computed = {salePrice, count, sum, income}

  const eventDatetime = Date.now()

  if (emitEvent) {
    payload.lastChangeDatetime = eventDatetime
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {_product, ...serverSide} = payload

  const server = {...serverSide, ...computed}
  const client = {
    ...payload,
    ...computed,
  }

  const [, isPutSaleError] = await handleAsync(putRow(SN.SALES, server, store))

  if (isPutSaleError) {
    return Promise.reject(isPutSaleError)
  }

  const passedEvent = {
    type,
    eventDatetime,
    payload: server,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (sale id: ${server.id}) failed`,
    )
  }

  if (consumer === 'client') {
    return client
  }

  return savedEvent
}
