import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRowFromStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'

export default async function putSale({
  store = null,
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
      )

      payload.realPrice = _product.realPrice
      payload.salePrice = _product.salePrice

      payload._product = _product
    }
  }

  // eslint-disable-next-line prefer-const
  let {salePrice, realPrice, count} = payload

  salePrice = Number(salePrice)
  count = Number(count)
  const sum = salePrice * count
  const realSum = realPrice * count
  const income = sum - realSum

  const computed = {salePrice, count, sum, income}

  if (typeof payload.salePrice === 'string') {
    payload.salePrice = Number(payload.salePrice)
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
    putRow(SN.SALES, server, store),
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
      `Event save of "${type}" (sale id: ${server.id}) failed`,
    )
  }

  if (consumer === 'client') {
    return client
  }

  return savedEvent
}