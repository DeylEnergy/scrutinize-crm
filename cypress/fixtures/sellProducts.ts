import {getCurrentPeriod} from '../helpers'

const currentPeriod = getCurrentPeriod()

const battery = {
  label: 'Battery Retain,G11, AAA',
  shortProductId: 'e22bed42',
  shortAcquisitionId: '14228725',
  finalCart: {
    price: 40,
    count: 6,
    sum: 240,
  },
  finalProduct: {
    inStockCount: 1189,
    soldCount: 11,
    currentMonth: {
      value: currentPeriod,
      soldCount: 6,
      acquiredCount: 0,
      returnedCount: 0,
      soldSum: 240,
      incomeSum: 60,
      spentSum: 0,
      returnedSum: 0,
    },
  },
}

const charger = {
  label: 'Charger Complo, microUSB',
  shortProductId: '9f875184',
  shortAcquisitionId: '3a802cb0',
  finalCart: {
    price: 540,
    count: 1,
    sum: 540,
  },
  finalProduct: {
    inStockCount: 12,
    soldCount: 8,
    currentMonth: {
      value: currentPeriod,
      soldCount: 1,
      acquiredCount: 0,
      returnedCount: 0,
      soldSum: 540,
      incomeSum: 90,
      spentSum: 0,
      returnedSum: 0,
    },
  },
}

const computerFan = {
  label: 'Computer fan Cooly, FRT-1020',
  shortProductId: 'e81e7de8',
  shortAcquisitionId: 'c066ed99',
  count: 3,
  finalCart: {
    price: 930,
    count: 3,
    sum: '2,790',
  },
  finalProduct: {
    inStockCount: 10,
    soldCount: 5,
    currentMonth: {
      value: currentPeriod,
      soldCount: 3,
      acquiredCount: 0,
      returnedCount: 0,
      soldSum: '2,790',
      incomeSum: 450,
      spentSum: 0,
      returnedSum: 0,
    },
  },
}

const earphones = {
  label: 'Earphones ClearSound',
  shortProductId: '75ac746c',
  shortAcquisitionId: '14c670af',
  finalCart: {
    price: '1,440',
    count: 2,
    sum: '2,880',
  },
  finalProduct: {
    inStockCount: 8,
    soldCount: 2,
    currentMonth: {
      value: currentPeriod,
      soldCount: 2,
      acquiredCount: 0,
      returnedCount: 0,
      soldSum: '2,880',
      incomeSum: 480,
      spentSum: 0,
      returnedSum: 0,
    },
  },
}

const satReceiver = {
  label: 'Satellite receiver WorldBox, N150',
  shortProductId: '343d8361',
  shortAcquisitionId: 'c0c48740',
  finalCart: {
    price: '4,800',
    count: 1,
    sum: '4,800',
  },
  finalProduct: {
    inStockCount: 3,
    soldCount: 2,
    currentMonth: {
      value: currentPeriod,
      soldCount: 1,
      acquiredCount: 0,
      returnedCount: 0,
      soldSum: '4,800',
      incomeSum: 800,
      spentSum: 0,
      returnedSum: 0,
    },
  },
}

const productsMap = {
  battery,
  charger,
  computerFan,
  earphones,
  satReceiver,
}

const productKeys = Object.keys(productsMap)

export {productsMap, productKeys}
