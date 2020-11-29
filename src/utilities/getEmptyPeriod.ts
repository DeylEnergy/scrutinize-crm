import {STORE_NAME as SN} from '../constants'

export default function getEmptyPeriod(storeName?: string) {
  const emptyPeriod: any = {
    incomeSum: 0,
    soldSum: 0,
    spentSum: 0,
  }

  if (storeName === SN.PRODUCTS_STATS) {
    emptyPeriod.soldCount = 0
    emptyPeriod.acquiredCount = 0
    emptyPeriod.returnedCount = 0
    emptyPeriod.acquiredSum = 0
    emptyPeriod.returnedSum = 0
  } else if (storeName === SN.CUSTOMERS_STATS) {
    emptyPeriod.returnedSum = 0
  }

  return emptyPeriod
}
