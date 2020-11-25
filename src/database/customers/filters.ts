import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  return {
    consist: (customer: any) => {
      const searchValues = [customer.name]

      const phone = customer.phone
      if (phone) {
        searchValues.push(phone)
      }

      const note = customer.note
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
