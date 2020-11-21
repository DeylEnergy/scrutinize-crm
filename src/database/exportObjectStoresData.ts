import db from './connection'

export default function exportObjectStoresData(convertToJSON = true) {
  return new Promise((resolve, reject) => {
    if (!db.current) {
      return reject('No db connection.')
    }

    const storeNames = Array.from(db.current.objectStoreNames)

    if (!storeNames.length) {
      return reject('Nothing to export. No object stores.')
    }

    const tx = db.current.transaction(storeNames, 'readonly')

    const fileContent: any = {data: {}}

    for (const storeName of storeNames) {
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onsuccess = (e: any) => {
        fileContent.data[storeName] = e.target.result
      }
    }

    tx.oncomplete = () => {
      resolve(convertToJSON ? JSON.stringify(fileContent) : fileContent)
    }
  })
}
