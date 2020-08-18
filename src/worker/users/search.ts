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
    const users: any = await getFullStore(SN.USERS)

    const keys = []
    for (const user of users) {
      const name = user.name.toLowerCase()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {secretKey, ...userData} = user
      keys.push({key: name, data: userData})
    }
    store.users = keys

    return keys.map(x => ({
      label: x.data.name,
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.users && (query || query === '')) {
    const result = []
    for (const user of store.users) {
      if (user.key.includes(query.toLowerCase())) {
        result.push({
          value: user.data.id,
          label: user.data.name,
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.users
  }
}
