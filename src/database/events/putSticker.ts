import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import putRow from '../putRow'
import saveEvent from './saveEvent'
import {PUT_STICKER} from '../../constants/events'

export default async function putSticker({
  store = null,
  type,
  payload,
  emitEvent = true,
}: any) {
  payload = {id: uuidv4(), ...payload}

  const [, error] = await handleAsync(putRow(SN.STICKERS, payload, store))

  if (error) {
    return Promise.reject(error)
  }

  const passedEvent = {
    type: PUT_STICKER,
    eventDatetime: Date.now(),
    payload,
  }

  const [savedEvent] = await handleAsync(saveEvent(passedEvent, emitEvent))

  if (!savedEvent) {
    return Promise.reject(`Event save of "${type}" failed`)
  }

  return savedEvent
}
