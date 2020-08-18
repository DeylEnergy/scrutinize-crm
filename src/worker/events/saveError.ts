import {v4 as uuidv4} from 'uuid'
import {handleAsync} from '../../utilities'
import putRow from '../putRow'
import {STORE_NAME as SN} from '../../constants'

export default async function saveError({payload}: any) {
  const [result] = await handleAsync(
    putRow(SN.ERRORS, {
      id: uuidv4(),
      errorDatetime: Date.now(),
      value: payload,
    }),
  )

  if (result) {
    return result
  }

  return Promise.reject(`Cannot save error.`)
}
