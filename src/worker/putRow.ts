import setupTransaction from './setupTransaction'

export default function putRow(
  storeName: string,
  row: any,
  store?: IDBObjectStore | any,
) {
  return new Promise(async (resolve, reject) => {
    const finalRow = {
      server: row,
      client: row,
    }

    if (!store) {
      const tx = setupTransaction(storeName)

      store = tx?.objectStore(storeName)
    }

    try {
      const req: IDBRequest = store.put(finalRow.server)
      req.onsuccess = function() {
        // console.log('put finalRow', finalRow)
        resolve(finalRow.server)
      }

      req.onerror = function() {
        reject(req.error)
      }
    } catch (e) {
      reject(e)
    }
  })
}
