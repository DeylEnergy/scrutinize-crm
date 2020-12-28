import db from './connection'
import {handleAsync} from '../utilities'
import handleIdbRequest from './handleIdbRequest'

async function clearAllStores(tx: IDBTransaction) {
  for (const storeName of Array.from(tx.objectStoreNames)) {
    const store = tx.objectStore(storeName)

    const [, reqError] = await handleAsync(handleIdbRequest(store.clear()))

    if (reqError) {
      tx.abort()
      return Promise.reject('Clear stores error.')
    }
  }

  return true
}

export default function importObjectStoresData(
  fileContent: any,
  shouldClearOld: boolean,
) {
  return new Promise(async (resolve, reject) => {
    if (!db.current) {
      return reject('No db connection.')
    }

    const {data} = fileContent

    if (!data) {
      return reject('Cannot read content. File corrupted.')
    }

    const storeNames = Object.keys(data)

    if (!storeNames.length) {
      return reject('Nothing to import. No object stores.')
    }

    const tx = db.current.transaction(storeNames, 'readwrite')

    if (shouldClearOld) {
      const [, clearOldError] = await handleAsync(clearAllStores(tx))

      if (clearOldError) {
        return Promise.reject(clearOldError)
      }
    }

    const resultOutline: any = {}

    // this indicator used to break all loops
    let errorOnAdd = false

    for (const storeName of storeNames) {
      const store = tx.objectStore(storeName)

      resultOutline[storeName] = 0
      const currentStore = data[storeName]
      // insert each row to its store
      for (const row of currentStore) {
        const [, reqError] = await handleAsync(handleIdbRequest(store.add(row)))

        if (reqError) {
          errorOnAdd = true
          break
        }

        resultOutline[storeName] += 1
      }

      // break all operations if one of requests failed
      if (errorOnAdd) {
        tx.abort()
        break
      }
    }

    tx.oncomplete = () => {
      resolve(resultOutline)
    }

    tx.onabort = (e: any) => {
      reject(e.target.error.toString())
    }
  })
}
