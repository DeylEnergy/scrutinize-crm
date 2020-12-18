import {getAllRows} from '../queries'
import {STORE_NAME as SN} from '../../constants'

const store: any = {}

export default async function searchInSuppliers({
  type,
  query,
}: {
  type: string
  query: string
}) {
  if (type === 'init') {
    const suppliers: any = await getAllRows({storeName: SN.SUPPLIERS})

    const keys = []
    for (const supplier of suppliers) {
      const name = supplier.name.toLowerCase()

      keys.push({key: name, data: supplier})
    }
    store.suppliers = keys

    return keys.map(x => ({
      label: x.data.name,
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.suppliers && (query || query === '')) {
    const result = []
    for (const supplier of store.suppliers) {
      if (supplier.key.includes(query.toLowerCase())) {
        result.push({
          value: supplier.data.id,
          label: supplier.data.name,
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.suppliers
  }
}
