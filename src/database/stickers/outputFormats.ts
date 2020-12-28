import {getPrintStickersList} from '../../utilities'

export function stickersSelectionIds(rows: any[]) {
  return rows.map((x: any) => x.stickersSelectionId)
}

export function printStickersList(rows: any[]) {
  const acquisitions = rows.reduce((total, current) => {
    if (current.stickersSelectionId) {
      return total
    }

    const {_productId, _product} = current

    const productAcquisitions = current.selectedAcquisitions.map(
      (selectedAcquisition: any) => {
        return {
          id: selectedAcquisition._acquisitionId,
          toPrintStickersCount: selectedAcquisition.count,
          _productId,
          _product,
        }
      },
    )

    return [...total, ...productAcquisitions]
  }, [])

  return getPrintStickersList(acquisitions)
}
