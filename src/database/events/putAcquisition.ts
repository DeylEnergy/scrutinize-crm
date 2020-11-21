import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRowFromStore, getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'

const PROFIT_PERCENTAGE = 20

export default async function putAcquisition({
  store = null,
  tx = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  if (!payload.id) {
    payload.id = uuidv4()
    if (payload._productId) {
      const _product: any = await getRowFromStore(
        SN.PRODUCTS,
        payload._productId,
        null,
        tx,
      )

      payload.price = _product.realPrice
      payload.count = _product.lowestBoundCount

      payload._product = _product
    }
  }

  let {price, count} = payload

  price = Number(price)
  count = Number(count)
  const sum = price * count

  const computed = {price, count, sum}

  if (typeof payload.salePrice === 'string') {
    payload.salePrice = Number(payload.salePrice)
  }

  if (typeof payload.lowestBoundCount === 'string') {
    payload.lowestBoundCount = Number(payload.lowestBoundCount)
  }

  const isNewProduct = !payload._productId

  // if new product was added and has no salePrice
  if (isNewProduct && !payload.salePrice) {
    const profitSum = (price / 100) * PROFIT_PERCENTAGE
    payload.salePrice = price + profitSum
  }

  if (
    isNewProduct &&
    !payload.lowestBoundCount &&
    payload.lowestBoundCount !== 0
  ) {
    payload.lowestBoundCount = Math.floor(count / 2)
  }

  // item to buy and stickers number aren't specified
  if (
    !payload.datetime &&
    !payload.toPrintStickersCount &&
    payload.toPrintStickersCount !== 0
  ) {
    payload.toPrintStickersCount = count
  }

  if (payload.isDone === undefined) {
    payload.isDone = false
  }

  const eventDatetime = Date.now()

  if (emitEvent) {
    payload.lastChangeDatetime = eventDatetime
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {_product, _supplier, _user, ...serverSide} = payload

  let _supplierUpdated

  if (consumer === 'client' && payload._supplierId) {
    _supplierUpdated = await getRowFromStore(SN.SUPPLIERS, payload._supplierId)
  }

  let _userUpdated

  if (consumer === 'client' && payload._userId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {secretKey, ...userData}: any = await getRowFromStore(
      SN.USERS,
      payload._userId,
    )
    _userUpdated = userData
  }

  const server = {...serverSide, ...computed}
  const client = {
    ...payload,
    _supplier: _supplierUpdated,
    _user: _userUpdated,
    ...computed,
  }

  const [, isAcquisitionUpdateError] = await handleAsync(
    putRow(SN.ACQUISITIONS, server, store),
  )

  if (isAcquisitionUpdateError) {
    return Promise.reject(isAcquisitionUpdateError)
  }

  const passedEvent = {
    type,
    eventDatetime,
    payload: server,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (acquisition id: ${server.id}) failed`,
    )
  }

  if (consumer === 'client') {
    return client
  }

  return savedEvent
}
