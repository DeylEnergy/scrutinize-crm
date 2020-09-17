import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_GROUP} from '../../constants/events'

export default async function putGroup({
  store = null,
  type,
  payload,
  emitEvent = true,
  consumer = 'server',
}: any) {
  const updatedGroup = payload

  if (!updatedGroup.id) {
    updatedGroup.id = uuidv4()
  }

  const [, isStatsUpdateError] = await handleAsync(
    putRow(SN.GROUPS, updatedGroup, store),
  )

  if (isStatsUpdateError) {
    return Promise.reject(isStatsUpdateError)
  }

  const passedEvent = {
    type: PUT_GROUP,
    eventDatetime: Date.now(),
    payload: payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  if (consumer === 'client') {
    return updatedGroup
  }

  return savedEvent
}
