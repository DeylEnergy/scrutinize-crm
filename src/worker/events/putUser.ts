import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_USER} from '../../constants/events'

export default async function putGroup({
  store = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  const updatedUser = payload

  if (!updatedUser.id) {
    updatedUser.id = uuidv4()
  }

  const [, isUserUpdateError] = await handleAsync(
    putRow(SN.USERS, updatedUser, store),
  )

  if (isUserUpdateError) {
    return Promise.reject(isUserUpdateError)
  }

  const passedEvent = {
    type: PUT_USER,
    eventDatetime: Date.now(),
    payload: payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  if (consumer === 'client') {
    return updatedUser
  }

  return savedEvent
}
