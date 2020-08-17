import {getFullIndexStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'

const store: any = {}

export default async function searchInProducts({
  type,
  query,
  filterFor,
  fullResult = false,
}: {
  type: string
  query: string
  filterFor: string
  fullResult: boolean
}) {
  if (type === 'init') {
    const products = await getFullIndexStore({
      storeName: SN.PRODUCTS,
      indexName: IN.NAME_MODEL,
    })

    const filtersStore: any = {}

    if (filterFor === 'toBuyList') {
      filtersStore.toBuyList = await getFullIndexStore({
        storeName: SN.ACQUISITIONS,
        indexName: IN.NEEDED_SINCE_DATETIME,
      })
    }

    const keys = []
    for (const product of products) {
      const {toBuyList} = filtersStore

      if (toBuyList) {
        const isInToBuyList = Boolean(
          toBuyList.find((x: any) => x._productId === product.id),
        )

        if (isInToBuyList) {
          continue
        }
      }

      const name = product.nameModel[0].toLowerCase()
      const model = product.nameModel[1].toLowerCase()

      keys.push({key: [name, model, product.id].join('__'), data: product})
    }
    store.products = keys

    return keys.map(x => ({
      label: x.data.nameModel.join(' '),
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.products && (query || query === '')) {
    const result = []
    for (const product of store.products) {
      if (product.key.includes(query.toLowerCase())) {
        result.push({
          value: fullResult ? product.data : product.data.id,
          label: product.data.nameModel.join(' '),
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.products
  }
}
