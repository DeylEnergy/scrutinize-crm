import {getRowFromIndexStore, getRowFromStore} from '../../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {handleAsync} from '../../../utilities'

export default async function authorize({userName, secretKey}: any) {
  const [user] = await handleAsync(
    getRowFromIndexStore({
      storeName: SN.USERS,
      indexName: IN.NAME,
      key: userName,
    }),
  )

  if (user?.secretKey === secretKey) {
    const group = await getRowFromStore(SN.GROUPS, user._groupId)

    return {user, group}
  }

  return Promise.reject('Cannot authorize user.')
}
