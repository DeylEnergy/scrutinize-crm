import {getRowFromStore, getRowFromIndexStore} from '../../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {handleAsync} from '../../../utilities'

export default async function computeCartSum({cartId}: {cartId: string}) {
  const [participants, error] = await handleAsync(
    getRowFromIndexStore({
      storeName: SN.SALES,
      indexName: IN.CART_PARTICIPANTS,
      key: cartId,
    }),
  )

  if (!participants) {
    return {}
  }

  if (participants._userId) {
    const [userData, userError] = await handleAsync(
      getRowFromStore(SN.USERS, participants._userId),
    )

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {secretKey, ..._user} = userData

    participants._user = _user
  }

  if (participants._customerId) {
    const [_customer, customerError] = await handleAsync(
      getRowFromStore(SN.CUSTOMERS, participants._customerId),
    )

    participants._customer = _customer
  }

  return participants
}