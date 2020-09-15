export default function isSearchValueIncluded(
  searchValue: string,
  searchQuery: string,
) {
  return searchValue.toLowerCase().includes(searchQuery)
}
