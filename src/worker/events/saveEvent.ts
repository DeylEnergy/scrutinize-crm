import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import putRow from '../putRow'

export default async function saveEvent(eventData: any, emitEvent = true) {
  if (!emitEvent) {
    return eventData
  }

  const [result] = await handleAsync(
    putRow('logs', {id: uuidv4(), ...eventData}),
  )

  if (result) {
    return result
  }

  return Promise.reject(`Cannot save event ${eventData.type}`)
}

console.log(saveEvent)
