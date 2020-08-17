import React from 'react'
import {SearchInput} from 'evergreen-ui'
import GlobalContext from '../contexts/globalContext'

interface Props {
  width?: number
  storeName: string
  placeholder?: string
  onSearchResult: (result: any[], isEmptyQuery: boolean) => any
}

function CustomSearchInput({
  width = 170,
  storeName,
  placeholder,
  onSearchResult,
}: Props) {
  const {worker} = React.useContext<any>(GlobalContext)
  const [value, setValue] = React.useState('')

  const searchFn = worker.search

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      searchFn({
        storeName,
        type: 'search',
        query: value,
        fullResult: true,
      }).then((result: any) => {
        const isEmptyQuery = !value
        onSearchResult(result, isEmptyQuery)
      })
    }
  }

  return (
    <SearchInput
      height={24}
      width={width}
      placeholder={placeholder}
      value={value}
      onFocus={() => searchFn({storeName, type: 'init'})}
      onBlur={() => searchFn({storeName, type: 'discard'})}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

export default React.memo(CustomSearchInput)
