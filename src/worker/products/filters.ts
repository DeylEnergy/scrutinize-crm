import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  return {
    consist: (product: any) => {
      const searchValues = []
      const productNameModel = product.nameModel
      if (productNameModel) {
        searchValues.push(...productNameModel)
      }

      for (const searchValue of searchValues) {
        if (isSearchValueIncluded(searchValue, searchQuery)) {
          return true
        }
      }

      return false
    },
  }
}
