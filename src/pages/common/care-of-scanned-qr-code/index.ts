import {recognizeQRCode} from '../../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {PUT_SALE} from '../../../constants/events'
import codePrefixes from '../../../constants/codePrefixes'

function getProductId(db: any, legacyProductId: number) {
  return db
    .getRows({
      storeName: SN.PRODUCTS,
      matchProperties: {_legacyId: legacyProductId},
    })
    .then((result: any) => {
      if (!result) {
        return Promise.reject('Cannot find such a product legacyId.')
      }

      const [product] = result
      return product.id
    })
}

function getAvailableProductAcquisitionId(db: any, productId: string) {
  return db
    .getRows({
      storeName: SN.ACQUISITIONS,
      indexName: IN.DATETIME,
      dataCollecting: false,
      matchProperties: {_productId: productId},
    })
    .then((result: any) => {
      if (!result) {
        return Promise.reject('Cannot find such a product legacyId.')
      }

      const availableAcquisition = result.find((aq: any) => aq.inStockCount > 0)

      if (availableAcquisition) {
        return availableAcquisition.id
      }
    })
}

function addAcquisitionIdToCart({
  db,
  acquisitionId,
  cartId,
}: {
  db: any
  acquisitionId: string
  cartId?: string
}) {
  return db
    .getRow({storeName: SN.ACQUISITIONS, key: acquisitionId})
    .then((aq: any) => {
      if (!aq) {
        return Promise.reject('No item with such acquisitionId.')
      }

      const productToAdd = {
        count: 1,
        _productId: aq._productId,
        _acquisitionId: aq.id,
        __cartId__: cartId,
      }

      return db
        .sendEvent({
          type: PUT_SALE,
          payload: productToAdd,
          consumer: 'client',
        })
        .then((result: any) => {
          if (!result) {
            return Promise.reject('Cannot put acquisitionId in cart.')
          }

          return result
        })
    })
}

function noop() {}

function careOfScannedQRCode({
  db,
  scannedCode,
  cartId,
  onUserAuthorized = noop,
  onProductScanned = noop,
  onUnknownScanned = noop,
  onUnknownAcquisitionScanned = noop,
}: {
  db: any
  scannedCode: any
  cartId?: string
  onProductScanned?: (acquisitionData: any) => void
  onUserAuthorized?: (userData: any) => void
  onUnknownScanned?: () => void
  onUnknownAcquisitionScanned?: () => void
}) {
  const [prefix, data]: any = recognizeQRCode(scannedCode?.value)

  if (prefix === codePrefixes.acquisitions) {
    addAcquisitionIdToCart({db, acquisitionId: data, cartId})
      .then(onProductScanned)
      .catch(onUnknownAcquisitionScanned)
  } else if (prefix === codePrefixes.users) {
    const [userId, secretKey] = data.split('__')

    db.perform({
      storeName: SN.USERS,
      action: 'authorization',
      params: {userId, secretKey},
    }).then((result: any) => {
      if (!result) {
        return
      }

      onUserAuthorized(result)
    })
  } else if (prefix === codePrefixes.legacySticker) {
    const legacyProductId = data

    getProductId(db, legacyProductId).then((productId: string) => {
      getAvailableProductAcquisitionId(db, productId).then((aqId: string) => {
        addAcquisitionIdToCart({db, acquisitionId: aqId, cartId})
          .then(onProductScanned)
          .catch(onUnknownAcquisitionScanned)
      })
    })
  } else {
    onUnknownScanned()
  }
}

export default careOfScannedQRCode
