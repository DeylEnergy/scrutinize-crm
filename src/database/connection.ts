import {STORE_NAME as SN, INDEX_NAME as IN} from '../constants'
const currentVersion = 24

const db: {current: null | IDBDatabase} = {current: null}
const dbReq: IDBOpenDBRequest = indexedDB.open('mydbx', currentVersion)
dbReq.onupgradeneeded = () => {
  db.current = dbReq.result

  const keyPath = {keyPath: 'id'}

  const objectStores = db.current.objectStoreNames
  if (!objectStores.contains(SN.PRODUCTS)) {
    db.current
      .createObjectStore(SN.PRODUCTS, keyPath)
      .createIndex(IN.NAME_MODEL, IN.NAME_MODEL)
  }

  if (!objectStores.contains(SN.PRODUCTS_STATS)) {
    db.current.createObjectStore(SN.PRODUCTS_STATS, {
      keyPath: 'productIdPeriod',
    })
  }

  if (!objectStores.contains(SN.SALES)) {
    const sales = db.current.createObjectStore(SN.SALES, keyPath)
    sales.createIndex(IN.DATETIME, IN.DATETIME)
    sales.createIndex(IN.__CART_ID__, IN.__CART_ID__)
    sales.createIndex(IN.CART_PARTICIPANTS, IN.CART_PARTICIPANTS)
    sales.createIndex(IN.ACTIVE_CART_ID, IN.ACTIVE_CART_ID)
  }

  if (!objectStores.contains(SN.ACQUISITIONS)) {
    const acquisitionsStore = db.current.createObjectStore(
      SN.ACQUISITIONS,
      keyPath,
    )
    acquisitionsStore.createIndex(IN.DATETIME, IN.DATETIME)
    acquisitionsStore.createIndex(
      IN.NEEDED_SINCE_DATETIME,
      IN.NEEDED_SINCE_DATETIME,
    )
  }

  if (!objectStores.contains(SN.CUSTOMERS)) {
    db.current
      .createObjectStore(SN.CUSTOMERS, keyPath)
      .createIndex(IN.NAME, IN.NAME)
  }

  if (!objectStores.contains(SN.CUSTOMERS_STATS)) {
    db.current.createObjectStore(SN.CUSTOMERS_STATS, {
      keyPath: 'customerIdPeriod',
    })
  }

  if (!objectStores.contains(SN.USERS)) {
    db.current
      .createObjectStore(SN.USERS, keyPath)
      .createIndex(IN.NAME, IN.NAME)
  }

  if (!objectStores.contains(SN.USERS_STATS)) {
    db.current.createObjectStore(SN.USERS_STATS, {keyPath: 'userIdPeriod'})
  }

  if (!objectStores.contains(SN.GROUPS)) {
    db.current.createObjectStore(SN.GROUPS, keyPath)
  }

  if (!objectStores.contains(SN.SUPPLIERS)) {
    db.current
      .createObjectStore(SN.SUPPLIERS, keyPath)
      .createIndex(IN.NAME, IN.NAME)
  }

  if (!objectStores.contains(SN.SUPPLIERS_STATS)) {
    db.current.createObjectStore(SN.SUPPLIERS_STATS, {
      keyPath: 'supplierIdPeriod',
    })
  }

  if (!objectStores.contains(SN.STATS)) {
    db.current.createObjectStore(SN.STATS, {keyPath: 'period'})
  }

  if (!objectStores.contains(SN.BUDGET)) {
    db.current.createObjectStore(SN.BUDGET, keyPath)
  }

  if (!objectStores.contains(SN.CASHBOX_HISTORY)) {
    db.current
      .createObjectStore(SN.CASHBOX_HISTORY, keyPath)
      .createIndex(IN.DATETIME, IN.DATETIME)
  }

  if (!objectStores.contains(SN.STICKERS)) {
    db.current
      .createObjectStore(SN.STICKERS, keyPath)
      .createIndex(IN.STICKERS_SELECTION_ID, IN.STICKERS_SELECTION_ID)
  }

  if (!objectStores.contains(SN.EVENTS)) {
    db.current
      .createObjectStore(SN.EVENTS, keyPath)
      .createIndex(IN.EVENT_DATETIME, IN.EVENT_DATETIME)
  }

  if (!objectStores.contains(SN.ERRORS)) {
    db.current
      .createObjectStore(SN.ERRORS, keyPath)
      .createIndex(IN.ERROR_DATETIME, IN.ERROR_DATETIME)
  }
}

dbReq.onsuccess = () => {
  if (!db.current) {
    db.current = dbReq.result
  }

  /* eslint-disable */
  // @ts-ignore
  self.postMessage('ready')
  /* eslint-enable */
}
dbReq.onerror = () => console.error('db connection error', dbReq.error)

export default db
