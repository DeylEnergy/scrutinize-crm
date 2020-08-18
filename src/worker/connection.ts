import {STORE_NAME as SN, INDEX_NAME as IN} from '../constants'
const currentVersion = 14

const db: {current: null | IDBDatabase} = {current: null}
const dbReq: IDBOpenDBRequest = indexedDB.open('mydbx', currentVersion)

dbReq.onupgradeneeded = () => {
  db.current = dbReq.result

  const keyPath = {keyPath: 'id'}
  // @ts-ignore
  if (currentVersion === 1) {
    db.current
      .createObjectStore(SN.PRODUCTS, keyPath)
      .createIndex(IN.NAME_MODEL, IN.NAME_MODEL)
    db.current
      .createObjectStore(SN.SALES, keyPath)
      .createIndex(IN.DATETIME, IN.DATETIME)
    const acquisitionsStore = db.current.createObjectStore(
      SN.ACQUISITIONS,
      keyPath,
    )
    acquisitionsStore.createIndex(IN.DATETIME, IN.DATETIME)
    acquisitionsStore.createIndex(
      IN.NEEDED_SINCE_DATETIME,
      IN.NEEDED_SINCE_DATETIME,
    )
    db.current.createObjectStore(SN.CUSTOMERS, keyPath)
    db.current.createObjectStore(SN.USERS, keyPath)
    db.current.createObjectStore(SN.SUPPLIERS, keyPath)
    db.current.createObjectStore(SN.STATS, keyPath)
    db.current.createObjectStore(SN.BUDGET, keyPath)
    db.current
      .createObjectStore(SN.EVENTS, keyPath)
      .createIndex(IN.EVENT_DATETIME, IN.EVENT_DATETIME)
    db.current
      .createObjectStore(SN.ERRORS, keyPath)
      .createIndex(IN.ERROR_DATETIME, IN.ERROR_DATETIME)
  }
}

dbReq.onsuccess = () => {
  if (!db.current) {
    db.current = dbReq.result
  }
}
dbReq.onerror = () => console.error('db connection error', dbReq.error)

export default db
