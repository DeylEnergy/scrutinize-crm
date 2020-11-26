import React from 'react'
import {Position} from 'evergreen-ui'
import SelectMenu from './SelectMenu'
import {useDatabase} from '../utilities'

function noop() {}

function AsyncSelectMenu({
  title,
  children,
  selected,
  onSelect,
  onCloseComplete = noop,
  hasFilter = true,
  storeName,
  filterFor = null,
  emptyView = noop,
  contentView,
  position = Position.BOTTOM_RIGHT,
}: any) {
  const db = useDatabase()
  const [options, setOptions] = React.useState([])
  const searchValue = React.useRef<any>('')
  const searchFn = db.search

  const searchQuery = React.useCallback(
    (value: any) => {
      searchFn({storeName, type: 'search', query: value}).then((res: any) => {
        setOptions(res ? res : [])
      })
    },
    [searchFn, storeName],
  )

  const handleOpen = React.useCallback(() => {
    searchFn({storeName, type: 'init', filterFor}).then(setOptions)
  }, [filterFor, searchFn, storeName])

  const handleCloseComplete = React.useCallback(() => {
    setOptions([])
    searchFn({storeName, type: 'discard'})
    onCloseComplete()
  }, [searchFn, storeName, onCloseComplete])

  return (
    <SelectMenu
      title={title}
      options={options}
      selected={selected}
      onSelect={onSelect}
      hasFilter={hasFilter}
      asyncSearch={searchQuery}
      asyncSearchDebounceTimeMs={500}
      position={position}
      onOpen={handleOpen}
      onCloseComplete={handleCloseComplete}
      onFilterChange={(value: any) => (searchValue.current = value)}
      closeOnSelect={true}
      // @ts-ignore
      emptyView={({close}: any) => emptyView(searchValue.current, close)}
      contentView={contentView}
    >
      {children}
    </SelectMenu>
  )
}

export default React.memo(AsyncSelectMenu)
