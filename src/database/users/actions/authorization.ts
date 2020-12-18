import {getRow} from '../../queries'
import {STORE_NAME as SN} from '../../../constants'
import {handleAsync} from '../../../utilities'

export default async function authorization({userId, secretKey}: any) {
  const [user] = await handleAsync(getRow({storeName: SN.USERS, key: userId}))

  if (user?.secretKey === secretKey) {
    const group = await getRow({storeName: SN.GROUPS, key: user._groupId})

    return {user, group}
  }

  return Promise.reject('Cannot authorize user.')
}
