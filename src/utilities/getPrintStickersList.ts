import {STORE_NAME as SN} from '../constants'
import codePrefixes from '../constants/codePrefixes'

export default function getPrintStickersList(value: any[]) {
  return value.reduce(
    (total: any[], cur: any) =>
      cur.toPrintStickersCount
        ? [
            ...total,
            {
              count: cur.toPrintStickersCount,
              acquisitionId: cur.id,
              productId: cur._productId || cur.futureProductId,
              code: `${codePrefixes[SN.ACQUISITIONS]}::${cur.id}`,
              nameModel: cur?._product?.nameModel || [cur.name, cur.model],
            },
          ]
        : total,
    [],
  )
}
