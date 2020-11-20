import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  return {
    consist: (supplier: any) => {
      const searchValues = [supplier.name]

      const phone = supplier.phone
      if (phone) {
        searchValues.push(phone)
      }

      const address = supplier.address
      if (address) {
        searchValues.push(address)
      }

      const note = supplier.note
      if (note) {
        searchValues.push(note)
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
