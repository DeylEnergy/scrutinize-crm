import db from './connection'

export default function setupTransaction(
  storeNames: string[] | string,
  mode: IDBTransactionMode = 'readwrite',
  storeSelected = false,
): any {
  if (db.current) {
    if (typeof storeNames === 'string') {
      storeNames = [storeNames]
    }

    const tx: IDBTransaction = db.current.transaction(storeNames, mode)

    if (storeSelected && storeNames.length === 1) {
      const objectStore = tx?.objectStore(storeNames[0])
      return {tx, objectStore}
    }

    return tx
  }
}
