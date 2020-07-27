import {v4 as uuidv4} from 'uuid'

const PRODUCTS_STORE_NAME = 'products'
const SALES_STORE_NAME = 'sales'
const ACQUISITIONS_STORE_NAME = 'acquisitions'
const BUDGET_STORE_NAME = 'budget'
const CUSTOMERS_STORE_NAME = 'customers'
const USERS_STORE_NAME = 'users'
const SUPPLIERS_STORE_NAME = 'suppliers'
const STATS_STORE_NAME = 'stats'

const currentVersion = 9

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
    const acquisitionsStore = db.createObjectStore(
      ACQUISITIONS_STORE_NAME,
      keyPath,
    )
    acquisitionsStore.createIndex('datetime', 'datetime')
    acquisitionsStore.createIndex('neededSinceDatetime', 'neededSinceDatetime')
    db.createObjectStore(CUSTOMERS_STORE_NAME, keyPath)
    db.createObjectStore(USERS_STORE_NAME, keyPath)
    db.createObjectStore(SUPPLIERS_STORE_NAME, keyPath)
    db.createObjectStore(STATS_STORE_NAME, keyPath)
    db.createObjectStore(BUDGET_STORE_NAME, {keyPath: 'id'})
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

export function getRowFromStore(storeName, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName)
    tx.objectStore(storeName).get(id).onsuccess = function(event) {
      resolve(event.target.result)
    }
  })
}

const acquisitionsFilters = {
  active: x => !x.isFrozen,
  haveToBuy: x => !x.isDone && !x.isFrozen,
  bought: x => x.isDone,
  frozen: x => x.isFrozen,
}

const filters = {
  acquisitions: acquisitionsFilters,
}

const PROFIT_PERCENTAGE = 20

async function acquisitionsActions(acquisition) {
  if (!acquisition.id) {
    acquisition.id = uuidv4()
    if (acquisition._productId) {
      const _product = await getRowFromStore('products', acquisition._productId)

      acquisition.price = _product.realPrice
      acquisition.count = _product.lowestBoundCount

      acquisition._product = _product
    }
  }

  let {price, count} = acquisition

  price = Number(price)
  count = Number(count)
  const sum = price * count

  const computed = {price, count, sum}

  const isNewProduct = !acquisition._productId

  // if new product was added and has no salePrice
  if (isNewProduct && !acquisition.salePrice) {
    const profitSum = (price / 100) * PROFIT_PERCENTAGE
    acquisition.salePrice = price + profitSum
  }

  if (
    isNewProduct &&
    !acquisition.lowestBoundCount &&
    acquisition.lowestBoundCount !== 0
  ) {
    acquisition.lowestBoundCount = Math.floor(count / 2)
  }

  // stickers number aren't specified
  if (
    !acquisition.toPrintStickersCount &&
    acquisition.toPrintStickersCount !== 0
  ) {
    acquisition.toPrintStickersCount = count
  }

  if (acquisition.isDone === undefined) {
    acquisition.isDone = false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {_product, _supplier, ...serverSide} = acquisition

  let _supplierUpdated

  if (acquisition._supplierId) {
    _supplierUpdated = await getRowFromStore(
      'suppliers',
      acquisition._supplierId,
    )
  }

  let _userUpdated

  if (acquisition._userId) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {secretKey, ...userData} = await getRowFromStore(
      'users',
      acquisition._userId,
    )
    _userUpdated = userData
  }

  const server = {...serverSide, ...computed}
  const client = {
    ...acquisition,
    _supplier: _supplierUpdated,
    _user: _userUpdated,
    ...computed,
  }

  return {server, client}
}

async function applyActionsOn(storeName, row) {
  const actions = {
    acquisitions: acquisitionsActions,
  }

  const applyAction = actions[storeName]

  if (!applyAction) {
    return {server: row, client: row}
  }

  return applyAction(row)
}

export async function putRow(storeName, row, i) {
  const finalRow = await applyActionsOn(storeName, row)

  return new Promise((resolve, reject) => {
    const {store, tx} = setupTransaction(storeName)

    store.put(finalRow.server)

    tx.oncomplete = function() {
      console.log('put finalRow', i ? i : finalRow)
      resolve(finalRow.client)
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

function withoutFilter() {
  return true
}

export function getAllFromIndexStore({
  storeName,
  indexName,
  limit,
  lastKey,
  direction = 'next',
  filterBy,
}) {
  return new Promise(resolve => {
    const tx = db.transaction([storeName], 'readonly')

    const indexStore = tx.objectStore(storeName).index(indexName)

    const keyBound =
      lastKey && (direction === 'next' ? 'lowerBound' : 'upperBound')
    const keyRange = keyBound && IDBKeyRange[keyBound](lastKey, true)

    let count = 0
    const result = []

    indexStore.openCursor(keyRange, direction).onsuccess = event => {
      const cursor = event.target.result

      if (!cursor || count === limit) {
        return resolve(result)
      }

      const applyFilter = filterBy
        ? filters[storeName][filterBy]
        : withoutFilter

      const {value} = cursor
      if (applyFilter(value)) {
        result.push(value)
        count += 1
      }

      cursor.continue()
    }
  })
}

export function getFullIndexStore({storeName, indexName, direction = 'next'}) {
  return new Promise(resolve => {
    const tx = db.transaction([storeName], 'readonly')

    const indexStore = tx.objectStore(storeName).index(indexName)

    indexStore.getAll().onsuccess = event => {
      const result = event.target.result
      if (direction === 'prev') {
        result.reverse()
      }
      resolve(result)
    }
  })
}

export function getAcquisitions(params) {
  let fetcher = getFullIndexStore
  if (params.lowerBound || params.limit || params.filterBy) {
    fetcher = getAllFromIndexStore
  }

  return fetcher(params).then(async acquisitions => {
    for (const acquisition of acquisitions) {
      if (acquisition._productId) {
        const _product = await getRowFromStore(
          'products',
          acquisition._productId,
        )
        acquisition._product = _product
      }

      if (acquisition._supplierId) {
        const _supplier = await getRowFromStore(
          'suppliers',
          acquisition._supplierId,
        )
        acquisition._supplier = _supplier
      }

      if (acquisition._userId) {
        const _user = await getRowFromStore('users', acquisition._userId)
        acquisition._user = _user
      }
    }

    return acquisitions
  })
}

export async function computeBuyList() {
  const buyList = await getAcquisitions({
    storeName: 'acquisitions',
    indexName: 'neededSinceDatetime',
    limit: 10000,
  })

  let budget = await getAllFromStore('budget')
  budget = budget[0].value

  let needed = 0
  let spent = 0
  let remains = budget

  for (const item of buyList) {
    const {sum, isDone} = item
    needed += sum

    if (isDone && sum) {
      spent += sum
      remains -= sum
    }
  }

  return {
    budget,
    needed,
    spent,
    remains,
  }
}

const store = {}

export async function searchInProducts({type, query, filterFor}) {
  if (type === 'init') {
    const products = await getFullIndexStore({
      storeName: 'products',
      indexName: 'nameModel',
    })

    const filtersStore = {}

    if (filterFor === 'toBuyList') {
      filtersStore.toBuyList = await getFullIndexStore({
        storeName: 'acquisitions',
        indexName: 'neededSinceDatetime',
      })
    }

    const keys = []
    for (const product of products) {
      const {toBuyList} = filtersStore

      if (toBuyList) {
        const isInToBuyList = Boolean(
          toBuyList.find(x => x._productId === product.id),
        )

        if (isInToBuyList) {
          continue
        }
      }

      const name = product.nameModel[0].toLowerCase()
      const model = product.nameModel[1].toLowerCase()

      keys.push({key: [name, model, product.id].join('__'), data: product})
    }
    store.products = keys

    return keys.map(x => ({
      label: x.data.nameModel.join(' '),
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.products && (query || query === '')) {
    const result = []
    for (const product of store.products) {
      if (product.key.includes(query.toLowerCase())) {
        result.push({
          value: product.data.id,
          label: product.data.nameModel.join(' '),
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.products
  }
}

export async function searchInSuppliers({type, query}) {
  if (type === 'init') {
    const suppliers = await getAllFromStore('suppliers')

    const keys = []
    for (const supplier of suppliers) {
      const name = supplier.name.toLowerCase()

      keys.push({key: name, data: supplier})
    }
    store.suppliers = keys

    return keys.map(x => ({
      label: x.data.name,
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.suppliers && (query || query === '')) {
    const result = []
    for (const supplier of store.suppliers) {
      if (supplier.key.includes(query.toLowerCase())) {
        result.push({
          value: supplier.data.id,
          label: supplier.data.name,
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.suppliers
  }
}

export async function searchInUsers({type, query}) {
  if (type === 'init') {
    const users = await getAllFromStore('users')

    const keys = []
    for (const user of users) {
      const name = user.name.toLowerCase()

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {secretKey, ...userData} = user
      keys.push({key: name, data: userData})
    }
    store.users = keys

    return keys.map(x => ({
      label: x.data.name,
      value: x.data.id,
    }))
  }

  if (type === 'search' && store.users && (query || query === '')) {
    const result = []
    for (const user of store.users) {
      if (user.key.includes(query.toLowerCase())) {
        result.push({
          value: user.data.id,
          label: user.data.name,
        })
      }
    }

    return result
  }

  if (type === 'discard') {
    delete store.users
  }
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
