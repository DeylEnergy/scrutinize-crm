import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  return {
    consist: (salesItem: any) => {
      const searchValues = []
      const productNameModel = salesItem?._product?.nameModel
      if (productNameModel) {
        searchValues.push(...productNameModel)
      }

      const userName = salesItem?._user?.name
      if (userName) {
        searchValues.push(userName)
      }

      const customerName = salesItem?._customer?.name
      if (customerName) {
        searchValues.push(customerName)
      }

      const note = salesItem.note
      if (note) {
        searchValues.push(note)
      }

      return isSearchValueIncluded(searchValues, searchQuery)
    },
  }
}
