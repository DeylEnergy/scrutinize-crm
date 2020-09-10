import setupTransaction from './setupTransaction'

export default function deleteRow(
  storeName: string,
  rowId: any,
  store?: IDBObjectStore | any,
) {
  return new Promise(async (resolve, reject) => {
    if (!store) {
      const tx = setupTransaction(storeName)

      store = tx?.objectStore(storeName)
    }

    try {
      const req: IDBRequest = store.delete(rowId)
      req.onsuccess = function() {
        resolve(true)
      }

      req.onerror = function() {
        reject(req.error)
      }
    } catch (e) {
      reject(e)
    }
  })
}
