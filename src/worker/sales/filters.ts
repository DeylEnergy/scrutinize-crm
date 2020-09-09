function isSearchValueIncluded(searchValue: string, searchQuery: string) {
  return searchValue.toLowerCase().includes(searchQuery)
}

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

      const consumerName = salesItem?._consumer?.name
      if (consumerName) {
        searchValues.push(consumerName)
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
