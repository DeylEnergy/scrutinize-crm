import {handleAsync} from '../utilities'
import saveEvent from './events/saveEvent'
import setupTransaction from './setupTransaction'

function wrapReq(fn: (...args: any) => any, ...args: any) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fn(...args)
      resolve(res)
    } catch (e) {
      reject(e)
    }
  })
}

export default function pushEvents(requests: any) {
  return new Promise(async (resolve, reject) => {
    let storeNames = requests.map((x: any) => x.storeName)
    // @ts-ignore
    storeNames = [...new Set(storeNames)]

    const tx = setupTransaction(storeNames)

    if (!tx) {
      return reject()
    }

    const eventsResults = []

    for (const request of requests) {
      const {cb, storeName} = request
      const store = tx.objectStore(storeName)
      const [data, requestFailed]: any = await handleAsync(
        wrapReq(cb, {store, tx, eventsResults}),
      )

      if (requestFailed) {
        tx.abort()
        break
      }

      eventsResults.push(data)

      const isLastElement = request === requests[requests.length - 1]
      // emit all events after the latest task, if all tasks successfully finished
      if (isLastElement) {
        for (const passedEvent of eventsResults) {
          const [, saveError] = await handleAsync(saveEvent(passedEvent))

          if (saveError) {
            return tx.abort()
          }
        }
        resolve(true)
      }
    }

    tx.oncomplete = () => {}

    tx.onerror = (event: any) => {
      console.error(event.target.error)
      reject(event.target.error.message)
    }

    tx.onabort = () => {
      reject('Transaction of pushEvents was aborted')
    }
  })
}
