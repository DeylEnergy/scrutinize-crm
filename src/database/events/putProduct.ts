import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRowFromStore} from '../queries'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'

export default async function putProduct({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  let product: any = {}

  const isAcquisition = '_productId' in payload

  const productId = payload._productId

  if (productId) {
    // update product's info
    const [storedProduct, isStoredProductError] = await handleAsync(
      getRowFromStore(SN.PRODUCTS, productId, store),
    )

    if (isStoredProductError) {
      return
    }
    product = storedProduct
  } else {
    product = {
      id: payload.futureProductId ?? uuidv4(),
      inStockCount: 0,
      soldCount: 0,
    }
  }

  const eventDatetime = Date.now()

  let updatedProduct

  if (isAcquisition) {
    const nameValue = payload.name || product.nameModel[0]
    const modelValue = payload.model || product.nameModel[1]

    const nameModel = [nameValue, modelValue]
    updatedProduct = {
      ...product,
      id: product.id,
      nameModel,
      inStockCount: product.inStockCount + payload.count,
      realPrice: payload.price || product.price,
      salePrice: payload.salePrice || product.salePrice,
      lowestBoundCount: payload.lowestBoundCount || product.lowestBoundCount,
      lastAcquiredDatetime: eventDatetime,
      lastChangeDatetime: eventDatetime,
    }
  } else {
    updatedProduct = {...product, ...payload, lastChangeDatetime: eventDatetime}
  }

  const [savedProduct, isProductUpdateError] = await handleAsync(
    putRow(SN.PRODUCTS, updatedProduct, store),
  )

  if (isProductUpdateError) {
    return Promise.reject(isProductUpdateError)
  }

  const passedEvent = {
    type,
    eventDatetime,
    payload: savedProduct,
  }

  const [isEventSaved] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (isEventSaved) {
    return passedEvent
  }

  return Promise.reject(
    `Event save of "${type}" (product id: ${updatedProduct.id}) failed`,
  )
}
