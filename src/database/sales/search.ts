import {getFullStore} from '../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {handleAsync} from '../../utilities'

const store: any = {}

export default async function searchInSales({
  type,
  query,
}: {
  type: string
  query: string
  filterFor: string
  fullResult: boolean
}) {
  if (type === 'init') {
    // get sales datetime index store relative to filters
    const [sales] = await handleAsync(
      getFullStore({
        storeName: SN.SALES,
        indexName: IN.DATETIME,
        direction: 'prev',
        sortAsc: false,
      }),
    )

    const keys = []
    for (const salesItem of sales) {
      const keyWords = []
      const product = salesItem._product

      if (product) {
        const name = product.nameModel[0].toLowerCase()
        const model = product.nameModel[1].toLowerCase()
        keyWords.push(name, model, product.id)
      }

      const userName = salesItem?._user?.name
      if (userName) {
        keyWords.push(userName)
      }

      keys.push({key: keyWords.join('__'), data: salesItem})
    }
    store.sales = keys

    return true
  }

  if (type === 'search' && store.sales && (query || query === '')) {
    const result = []
    for (const salesItem of store.sales) {
      if (salesItem.key.includes(query.toLowerCase())) {
        result.push(salesItem.data)
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.sales
  }
}
