import {getRowFromStore} from '../../queries'
import {STORE_NAME as SN} from '../../../constants'
import {handleAsync} from '../../../utilities'

export default async function authorization({userId, secretKey}: any) {
  const [user] = await handleAsync(getRowFromStore(SN.USERS, userId))

  if (user?.secretKey === secretKey) {
    const group = await getRowFromStore(SN.GROUPS, user._groupId)

    return {user, group}
  }

  return Promise.reject('Cannot authorize user.')
}
