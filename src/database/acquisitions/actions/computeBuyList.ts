import {getFullIndexStore, getRowFromStore} from '../../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'

export default async function computeBuyList() {
  const buyList = await getFullIndexStore({
    storeName: SN.ACQUISITIONS,
    indexName: IN.NEEDED_SINCE_DATETIME,
    filterBy: 'active',
  })

  let budget: any = await getRowFromStore(SN.BUDGET, 1)

  if (!budget) {
    return {}
  }

  budget = budget.value

  let needed = 0
  let spent = 0

  for (const item of buyList) {
    const {sum, isDone} = item
    needed += sum

    if (isDone && sum) {
      spent += sum
    }
  }

  const remains = spent ? budget - spent : 0

  return {
    budget,
    needed,
    spent,
    remains,
  }
}
