function isWordInValues(searchValuesModified: string[], word: string) {
  return Boolean(
    searchValuesModified.filter(value => value.includes(word)).length,
  )
}

export default function isSearchValueIncluded(
  searchValues: string[],
  searchQuery: string,
) {
  // return searchValue.toLowerCase().includes(searchQuery)
  if (searchQuery === '') {
    return true
  }
  const words = searchQuery
    .trim()
    .split(' ')
    .map(x => x.toLowerCase())

  let matches = 0

  const searchValuesModified = searchValues.map(x => x.toLowerCase())

  for (const word of words) {
    if (isWordInValues(searchValuesModified, word)) {
      matches += 1
    }
  }
  return words.length === matches
}
