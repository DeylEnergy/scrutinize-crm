import {getCurrentPeriod} from '../helpers'

const currentPeriod = getCurrentPeriod()

const charger = {
  label: 'Charger Complo, microUSB',
  shortProductId: '9f875184',
  shortAcquisitionId: '3a802cb0',
  count: 3,
  finalCart: {
    price: 540,
    count: 3,
    sum: '1,620',
  },
  finalProduct: {
    inStockCount: 16,
    soldCount: 7,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 0,
      returnedCount: 3,
      soldSum: '-1,620',
      incomeSum: -270,
      spentSum: 0,
      returnedSum: '1,620',
    },
  },
}

const keyboard = {
  label: 'Keyboard Ergonomo T20',
  shortProductId: 'dbadd47c',
  shortAcquisitionId: 'e79a55c2',
  count: 1,
  finalCart: {
    price: 840,
    count: 1,
    sum: 840,
  },
  finalProduct: {
    inStockCount: 4,
    soldCount: 2,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 0,
      returnedCount: 1,
      soldSum: -840,
      incomeSum: -140,
      spentSum: 0,
      returnedSum: 840,
    },
  },
}

const microphone = {
  label: 'Microphone BearWolf, USB, grey',
  shortProductId: 'd413460c',
  shortAcquisitionId: 'd05204e9',
  count: 2,
  finalCart: {
    price: '1,440',
    count: 2,
    sum: '2,880',
  },
  finalProduct: {
    inStockCount: 7,
    soldCount: 2,
    currentMonth: {
      value: currentPeriod,
      soldCount: 0,
      acquiredCount: 0,
      returnedCount: 2,
      soldSum: '-2,880',
      incomeSum: -480,
      spentSum: 0,
      returnedSum: '2,880',
    },
  },
}

const productsMap = {
  charger,
  keyboard,
  microphone,
}

const productKeys = Object.keys(productsMap)

const salespersonName = 'Leonie'
const customerName = 'Ernestina Aufderhar'

const sumToReturn = '5,340'

const currentMonthStats = {
  value: currentPeriod,
  soldSum: `-${sumToReturn}`,
  incomeSum: -890,
  spentSum: 0,
}

const userStats = {
  name: salespersonName,
  currentMonth: currentMonthStats,
}

const customerStats = {
  name: customerName,
  currentMonth: {...currentMonthStats, returnedSum: sumToReturn},
}

const suppliersStats = [
  {
    name: 'Dejon Zboncak',
    currentMonth: {
      ...currentMonthStats,
      soldSum: '-1,620',
      incomeSum: -270,
    },
  },
  {
    name: 'Kailey',
    currentMonth: {
      ...currentMonthStats,
      soldSum: '-3,720',
      incomeSum: -620,
    },
  },
]

export {
  productsMap,
  productKeys,
  salespersonName,
  customerName,
  currentMonthStats,
  userStats,
  suppliersStats,
  customerStats,
}
