import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery, productId}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  return {
    consist: (acquisition: any) => {
      const searchValues = []
      const productNameModel =
        acquisition?._product?.nameModel || acquisition?._legacyProductNameModel
      if (productNameModel) {
        searchValues.push(...productNameModel)
      }

      const userName = acquisition?._user?.name
      if (userName) {
        searchValues.push(userName)
      }

      const supplierName = acquisition?._supplier?.name
      if (supplierName) {
        searchValues.push(supplierName)
      }

      return isSearchValueIncluded(searchValues, searchQuery)
    },
    productId: ({_productId, inStockCount}: any) => {
      return _productId === productId && inStockCount > 0
    },
    active: (x: any) => !x.isFrozen,
    haveToBuy: (x: any) => !x.isDone && !x.isFrozen,
    bought: (x: any) => x.isDone,
    frozen: (x: any) => x.isFrozen,
  }
}
