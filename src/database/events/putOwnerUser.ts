import {handleAsync} from '../../utilities'
import {v4 as uuidv4} from 'uuid'
import {STORE_NAME as SN} from '../../constants'
import {PUT_GROUP, PUT_USER} from '../../constants/events'
import rights from '../../constants/rights'
import send from './index'

import pushEvents from '../pushEvents'

export default async function putOwnerUser({payload}: any) {
  const {groupName, userId, userName, secretKey} = payload

  const groupId = uuidv4()

  const groupData = {
    name: groupName,
    id: groupId,
    permissions: Object.values(rights),
  }

  const ownerGroup = {
    storeName: SN.GROUPS,
    cb: ({store}: any) =>
      send({
        type: PUT_GROUP,
        payload: groupData,
        store,
        emitEvent: false,
      }),
  }

  const userData = {name: userName, id: userId, _groupId: groupId, secretKey}

  const ownerUser = {
    storeName: SN.USERS,
    cb: ({store}: any) =>
      send({
        type: PUT_USER,
        payload: userData,
        store,
        emitEvent: false,
      }),
  }

  const events = [ownerGroup, ownerUser]

  const [, error] = await handleAsync(pushEvents(events))

  if (error) {
    return Promise.reject(error)
  }

  return {
    user: userData,
    group: groupData,
  }
}
