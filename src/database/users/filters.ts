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

      return isSearchValueIncluded(searchValues, searchQuery)
    },
  }
}
