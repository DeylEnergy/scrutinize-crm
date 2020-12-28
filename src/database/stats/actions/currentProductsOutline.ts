import {getAllRows} from '../../queries'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'

export default async function currentProductsOutline() {
  const activeProducts = await getAllRows({
    storeName: SN.PRODUCTS,
    filterBy: 'inStock',
  })

  const activeProductsNumber = activeProducts.length
  let potentialSaleSum = 0
  let potentialIncomeSum = 0

  for (const product of activeProducts) {
    const saleSum = product.inStockCount * product.salePrice
    potentialSaleSum += saleSum

    const realSum = product.inStockCount * product.realPrice
    potentialIncomeSum += saleSum - realSum
  }

  return {
    activeProductsNumber,
    potentialSaleSum,
    potentialIncomeSum,
  }
}
