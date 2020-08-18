import {handleAsync} from '../../utilities'

export default async function send(params: any) {
  const [eventFn] = await handleAsync(import(`./${params.type}`))

  if (eventFn && eventFn.default) {
    return eventFn.default(params)
  }

  return Promise.reject(`Event ${params.type} has not found.`)
}
