import {isSearchValueIncluded} from '../../utilities'

export default function filters({searchQuery}: any) {
  if (searchQuery) {
    searchQuery = searchQuery.toLowerCase()
  }

  return {
    consist: (user: any) => {
      const searchValues = [user.name]

      const phone = user.phone
      if (phone) {
        searchValues.push(phone)
      }

      const note = user.note
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
