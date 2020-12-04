import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {getRowFromStore, getFullIndexStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'

async function getAcquisitionData(id: string) {
  const aq: any = await getRowFromStore(SN.ACQUISITIONS, id)

  return aq
}

export default async function putStickersSelectionItem({
  store = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  if (
    payload._stickersSelectionId &&
    payload._productId &&
    payload._acquisitionId
  ) {
    const [selectedProducts] = await handleAsync(
      getFullIndexStore({
        storeName: SN.STICKERS,
        direction: 'prev',
        matchProperties: {_stickersSelectionId: payload._stickersSelectionId},
      }),
    )

    let selectedProduct = selectedProducts.find(
      (x: any) => x._productId === payload._productId,
    )

    if (selectedProduct) {
      if (!selectedProduct.selectedAcquisitions) {
        selectedProduct.selectedAcquisitions = []
      }

      const acquisition = selectedProduct.selectedAcquisitions.find(
        (x: any) => x._acquisitionId === payload._acquisitionId,
      )

      if (acquisition) {
        acquisition.count += 1
      } else {
        const [, aqError] = await handleAsync(
          getAcquisitionData(payload._acquisitionId),
        )

        if (aqError) {
          return Promise.reject('Cannot find acquisitionId.')
        }

        selectedProduct.selectedAcquisitions.push({
          _acquisitionId: payload._acquisitionId,
          count: 1,
        })
      }
    } else {
      selectedProduct = {}
      const [, aqError] = await handleAsync(
        getAcquisitionData(payload._acquisitionId),
      )

      if (aqError) {
        return Promise.reject('Cannot find acquisitionId.')
      }

      selectedProduct.selectedAcquisitions = [
        {
          _acquisitionId: payload._acquisitionId,
          count: 1,
        },
      ]
    }

    payload = {...payload, ...selectedProduct}
  }

  delete payload._acquisitionId

  if (!payload.id) {
    payload.id = uuidv4()
    if (payload._productId) {
      const _product: any = await getRowFromStore(
        SN.PRODUCTS,
        payload._productId,
      )

      payload._product = _product
    }
  }

  payload.count = payload.selectedAcquisitions.reduce(
    (total: number, {count}: any) => total + count,
    0,
  )

  const eventDatetime = Date.now()

  if (emitEvent) {
    payload.lastChangeDatetime = eventDatetime
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {_product, ...serverSide} = payload

  const server = serverSide
  const client = payload

  const [, isPutStickerSelectionItemError] = await handleAsync(
    putRow(SN.STICKERS, server, store),
  )

  if (isPutStickerSelectionItemError) {
    return Promise.reject(isPutStickerSelectionItemError)
  }

  const passedEvent = {
    type,
    eventDatetime,
    payload: server,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(
      `Event save of "${type}" (sticker id: ${server.id}) failed`,
    )
  }

  if (consumer === 'client') {
    return client
  }

  return savedEvent
}
