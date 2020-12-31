import {getCurrentPeriod} from '../helpers'

const currentPeriod = getCurrentPeriod()

const charger = {
  shortProductId: '9f875184',
  name: 'Charger',
  model: 'Complo, microUSB',
  finalProduct: {
    inStockCount: 23,
    soldCount: 7,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 10,
      returnedCount: 0,
      soldSum: 0,
      incomeSum: 0,
      spentSum: '4,500',
      returnedSum: 0,
    },
  },
}

const computerFan = {
  shortProductId: 'e81e7de8',
  name: 'Computer fan',
  model: 'Cooly, FRT-1020',
  finalProduct: {
    inStockCount: 21,
    soldCount: 2,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 8,
      returnedCount: 0,
      soldSum: 0,
      incomeSum: 0,
      spentSum: '6,240',
      returnedSum: 0,
    },
  },
}

const earphones = {
  shortProductId: '75ac746c',
  name: 'Earphones',
  model: 'ClearSound, J1050, Bluetooth',
  finalProduct: {
    inStockCount: 15,
    soldCount: 0,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 5,
      returnedCount: 0,
      soldSum: 0,
      incomeSum: 0,
      spentSum: '6,000',
      returnedSum: 0,
    },
  },
}

const newProduct = {
  shortProductId: 'new',
  name: 'Remote control',
  model: 'Universal TV',
  price: 150,
  count: 20,
  sum: '3,000',
  finalProduct: {
    inStockCount: 20,
    soldCount: 0,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 20,
      returnedCount: 0,
      soldSum: 0,
      incomeSum: 0,
      spentSum: '3,000',
      returnedSum: 0,
    },
  },
}

const productsMap = {
  charger,
  computerFan,
  earphones,
  newProduct,
}

const productKeys = Object.keys(productsMap)

const executorName = 'Leonie'
const supplierName = 'Dejon Zboncak'

const funds = {
  needed: '19,740',
  budget: '28,760',
  spent: '19,740',
  remains: '9,020',
}

const currentMonthStats = {
  value: currentPeriod,
  soldSum: 0,
  incomeSum: 0,
  spentSum: '19,740',
}

const userStats = {
  name: executorName,
  currentMonth: currentMonthStats,
}

const suppliersStats = [
  {
    name: 'Dejon Zboncak',
    currentMonth: {
      ...currentMonthStats,
      soldSum: 0,
      incomeSum: 0,
    },
  },
]

export {
  productsMap,
  productKeys,
  newProduct,
  funds,
  executorName,
  supplierName,
  currentPeriod,
  currentMonthStats,
  userStats,
  suppliersStats,
}
