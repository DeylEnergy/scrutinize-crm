import {getFullStore} from '../queries'
import {STORE_NAME as SN} from '../../constants'

const store: any = {}

export default async function searchInUsers({
  type,
  query,
}: {
  type: string
  query: string
}) {
  if (type === 'init') {
    const customers: any = await getFullStore(SN.CUSTOMERS)

    const keys = []
    for (const customer of customers) {
      const name = customer.name.toLowerCase()

      keys.push({key: name, data: customer})
    }
    store.customers = keys

    return keys.map(x => ({
      label: x.data.name,
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.customers && (query || query === '')) {
    const result = []
    for (const customer of store.customers) {
      if (customer.key.includes(query.toLowerCase())) {
        result.push({
          value: customer.data.id,
          label: customer.data.name,
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.customers
  }
}
