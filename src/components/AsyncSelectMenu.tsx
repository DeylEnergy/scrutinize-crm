import React from 'react'
import {Position} from 'evergreen-ui'
import SelectMenu from './SelectMenu'
import {useDatabase} from '../utilities'

function AsyncSelectMenu({
  title,
  children,
  selected,
  onSelect,
  storeName,
  filterFor = null,
  emptyView = null,
  position = Position.BOTTOM_RIGHT,
}: any) {
  const db = useDatabase()
  const [options, setOptions] = React.useState([])
  const searchValue = React.useRef<any>('')
  const searchFn = db.search

  const searchQuery = React.useCallback((value: any) => {
    searchFn({storeName, type: 'search', query: value}).then((res: any) => {
      setOptions(res ? res : [])
    })
  }, [])

  const handleOpen = React.useCallback(() => {
    searchFn({storeName, type: 'init', filterFor}).then(setOptions)
  }, [])

  const handleCloseComplete = React.useCallback(() => {
    setOptions([])
    searchFn({storeName, type: 'discard'})
  }, [])

  return (
    <SelectMenu
      title={title}
      options={options}
      selected={selected}
      onSelect={onSelect}
      asyncSearch={searchQuery}
      asyncSearchDebounceTimeMs={500}
      position={position}
      onOpen={handleOpen}
      onCloseComplete={handleCloseComplete}
      onFilterChange={(value: any) => (searchValue.current = value)}
      closeOnSelect={true}
      emptyView={emptyView && emptyView(searchValue.current)}
    >
      {children}
    </SelectMenu>
  )
}

export default React.memo(AsyncSelectMenu)
