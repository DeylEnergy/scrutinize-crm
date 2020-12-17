import {PRODUCTS_FILTER_OPTIONS as FILTER_OPTIONS} from '../../constants'
import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  const consist = (product: any) => {
    const searchValues = []
    const productNameModel = product.nameModel
    if (productNameModel) {
      searchValues.push(...productNameModel)
    }

    return isSearchValueIncluded(searchValues, searchQuery)
  }

  const all = (product: any) => {
    if (searchQuery && !consist(product)) {
      return false
    }

    return true
  }

  const inStock = (product: any) => {
    if (searchQuery && !consist(product)) {
      return false
    }

    return product.inStockCount > 0
  }

  const soldOut = (product: any) => {
    if (searchQuery && !consist(product)) {
      return false
    }

    return product.inStockCount <= 0
  }

  return {
    [FILTER_OPTIONS.ALL]: all,
    [FILTER_OPTIONS.IN_STOCK]: inStock,
    [FILTER_OPTIONS.SOLD_OUT]: soldOut,
  }
}
