import {getRow} from '../../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {handleAsync} from '../../../utilities'

export default async function getCartParticipants({cartId}: {cartId: string}) {
  const [participants] = await handleAsync(
    getRow({
      storeName: SN.SALES,
      indexName: IN.CART_PARTICIPANTS,
      key: cartId,
    }),
  )

  if (!participants) {
    return {}
  }

  if (participants._userId) {
    const [userData] = await handleAsync(
      getRow({storeName: SN.USERS, key: participants._userId}),
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {secretKey, ..._user} = userData

    participants._user = _user
  }

  if (participants._customerId) {
    const [_customer] = await handleAsync(
      getRow({storeName: SN.CUSTOMERS, key: participants._customerId}),
    )

    participants._customer = _customer
  }

  return participants
}
