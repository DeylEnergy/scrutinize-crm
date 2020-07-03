import {v4 as uuidv4} from 'uuid'

const PRODUCTS_STORE_NAME = 'products'
const SALES_STORE_NAME = 'sales'
const ACQUISITIONS_STORE_NAME = 'acquisitions'
const CUSTOMERS_STORE_NAME = 'customers'
const USERS_STORE_NAME = 'users'
const SUPPLIERS_STORE_NAME = 'suppliers'
const STATS_STORE_NAME = 'stats'

const currentVersion = 1

let db
let dbReq = indexedDB.open('mydbx', currentVersion)

dbReq.onupgradeneeded = e => {
  db = e.target.result

  if (currentVersion === 1) {
    const keyPath = {keyPath: 'id'}
    db.createObjectStore(PRODUCTS_STORE_NAME, keyPath).createIndex(
      'nameModel',
      'nameModel',
    )
    db.createObjectStore(SALES_STORE_NAME, keyPath).createIndex(
      'datetime',
      'datetime',
    )
    db.createObjectStore(ACQUISITIONS_STORE_NAME, keyPath).createIndex(
      'datetime',
      'datetime',
    )
    db.createObjectStore(CUSTOMERS_STORE_NAME, keyPath)
    db.createObjectStore(USERS_STORE_NAME, keyPath)
    db.createObjectStore(SUPPLIERS_STORE_NAME, keyPath)
    db.createObjectStore(STATS_STORE_NAME, keyPath)
  }
}

dbReq.onsuccess = e => {
  if (!db) {
    db = e.target.result
  }
  // console.log('db connected', db)
}
dbReq.onerror = e => console.error('db connection error', e.target.errorCode)

function setupTransaction(storeName) {
  const tx = db.transaction(storeName, 'readwrite')
  const store = tx.objectStore(storeName)

  return {
    tx,
    store,
  }
}

export function putRow(storeName, row, i) {
  return new Promise((resolve, reject) => {
    const {store, tx} = setupTransaction(storeName)

    store.put(row)

    tx.oncomplete = function() {
      console.log('put row', i ? i : row)
      resolve(row)
    }

    tx.onerror = function(event) {
      console.error(event.target.error)
      reject(event.target.error.message)
    }
  })
}

export function getAllFromStore(storeName) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName)
    tx.objectStore(storeName).getAll().onsuccess = function(event) {
      resolve(event.target.result)
    }
  })
}

export function getAllFromIndexStore({
  storeName,
  indexName,
  limit,
  lowerBoundKey,
}) {
  return new Promise(resolve => {
    const tx = db.transaction([storeName], 'readonly')

    const indexStore = tx.objectStore(storeName).index(indexName)

    let count = 0
    const result = []
    const keyRange =
      lowerBoundKey && IDBKeyRange.lowerBound(lowerBoundKey, true)

    indexStore.openCursor(keyRange).onsuccess = event => {
      const cursor = event.target.result

      if (!cursor || count === limit) {
        return resolve(result)
      }

      result.push(cursor.value)
      count += 1

      cursor.continue()
    }
  })
}

export function getRowFromStore(storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName)
    console.time('strt')
    tx.objectStore(storeName).get(id).onsuccess = function(event) {
      console.timeEnd('strt')
      resolve(event.target.result)
    }
  })
}

export async function asyncCountThing(cb) {
  console.time('async fn took')
  await cb()
  console.timeEnd('async fn took')
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min //The maximum is exclusive and the minimum is inclusive
}

export function createManyProducts(count = 0, from = 0) {
  const example = {
    id: 0,
    // name: 'Name #0',
    // model: 'Model #0',
    inStockCount: 1,
    soldCount: 1,
    realPrice: 1000,
    salePrice: 1200,
    lowestBoundCount: 3,
    isFrozen: false,
    image: null,
  }

  for (let i = from; i < count + from; i++) {
    putRow(
      'products',
      {
        ...example,
        id: uuidv4(),
        nameModel: [`Name #${i}`, `Model #${i}`],
      },
      i,
    )
  }
}

export async function createManyAcquisitions(count = 0, from = 0) {
  const example = {
    id: 'string',
    datetime: 'string',
    count: 0,
    price: 0,
    sum: 0,
    _productId: 'uuid',
    _supplierId: 'string',
    _userId: 'string',
    extra: 'string',
  }

  const prices = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 2000]

  const products = await getAllFromStore('products')

  for (let i = from; i < count + from; i++) {
    const price = prices[getRandomInt(0, 10)]
    const count = getRandomInt(1, 10)
    const sum = price * count
    putRow('acquisitions', {
      ...example,
      id: uuidv4(),
      datetime: Date.now(),
      _productId: products[getRandomInt(0, products.length - 1)].id,
      _userId: null,
      _supplierId: null,
      count,
      price,
      sum,
      extra: null,
    })
  }
}

export async function createManySales(count = 0, from = 0) {
  const example = {
    id: 0,
    _cartId: '',
    _productId: 'uuid',
    _acquisitionId: 'uuid',
    _userId: 'uuid',
    _customerId: 'uuid',
    datetime: 'unixTime',
    realPrice: 0,
    salePrice: 0,
    sumPrice: 0,
    count: 0,
    income: 0,
    extra: 'nothing',
  }

  const products = await getAllFromStore('products')
  const acquisitions = await getAllFromStore('acquisitions')

  for (let i = from; i < count + from; i++) {
    const acquisition = acquisitions[getRandomInt(0, acquisitions.length - 1)]
    const product = products.find(x => x.id === acquisition._productId)

    const count = getRandomInt(1, 10)
    const salePriceSum = product.salePrice * count
    const saleRealSum = product.realPrice * count
    const income = salePriceSum - saleRealSum

    putRow(
      'sales',
      {
        ...example,
        id: uuidv4(),
        _cartId: uuidv4(),
        _acquisitionId: acquisition.id,
        _productId: acquisition._productId,
        _userId: null,
        _customerId: null,
        datetime: Date.now(),
        salePrice: product.salePrice,
        realPrice: product.realPrice,
        sumPrice: salePriceSum,
        count,
        income,
      },
      i,
    )
  }
}

export function createManyUsers(count = 0, from = 0) {
  const example = {
    id: 0,
    name: 'string',
    avatar: 'string',
    secretKey: 'string',
    extra: 'nothing',
  }

  for (let i = from; i < count + from; i++) {
    putRow('users', {
      ...example,
      id: uuidv4(),
      name: `Username #${i}`,
      avatar: null,
      secretKey: uuidv4(),
    })
  }
}

export function createManyCustomers(count = 0, from = 0) {
  const example = {
    id: 0,
    name: 'string',
    discount: 'boolean',
    extra: 'nothing',
  }

  for (let i = from; i < count + from; i++) {
    putRow('customers', {
      ...example,
      id: uuidv4(),
      name: `Customer #${i}`,
      discount: Boolean(getRandomInt(0, 1)),
    })
  }
}

export function createManySuppliers(count = 0) {
  const example = {
    id: 0,
    name: 'string',
    phoneNumber: 'string',
    extra: 'nothing',
  }

  for (let i = 0; i < count; i++) {
    putRow('suppliers', {
      ...example,
      id: uuidv4(),
      name: `Supplier #${i}`,
    })
  }
}

export function createManyStats(count = 0) {
  const example = {
    id: 0,
    month: 'string',
    spentSum: 'number',
    soldSum: 'number',
    incomeSum: 'number',
  }

  for (let i = 1; i < count + 1; i++) {
    putRow('stats', {
      ...example,
      id: uuidv4(),
      month: i > 9 ? `${i}/2020` : `0${i}/2020`,
      spentSum: getRandomInt(400000, 700000),
      soldSum: getRandomInt(400000, 600000),
      incomeSum: getRandomInt(150000, 250000),
    })
  }
}
