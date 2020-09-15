import React from 'react'
import {SearchInput} from 'evergreen-ui'
import GlobalContext from '../contexts/globalContext'

interface Props {
  width?: number
  placeholder?: string
  value: string
  handleSearchQuery: (value: string) => any
}

function CustomSearchInput({
  width = 170,
  placeholder,
  value,
  handleSearchQuery,
}: Props) {
  const [searchQuery, setSearchQuery] = React.useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      handleSearchQuery(searchQuery)
    }
  }

  return (
    <SearchInput
      height={24}
      width={width}
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

export default React.memo(CustomSearchInput)
