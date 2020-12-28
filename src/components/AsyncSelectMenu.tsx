import React from 'react'
import {Pane, Position, Spinner} from 'evergreen-ui'
import SelectMenu from './SelectMenu'
import {useDatabase, useDelay} from '../utilities'

function noop() {}

function Progressing() {
  return (
    <Pane position="relative" height="100%">
      <Spinner
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -100%)"
      />
    </Pane>
  )
}

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

  const [isLoading, {handleDelay, resetDelay}] = useDelay(true)

  const searchQuery = React.useCallback(
    (value: any) => {
      searchFn({storeName, type: 'search', query: value}).then((res: any) => {
        setOptions(res ? res : [])
      })
    },
    [searchFn, storeName],
  )

  const handleOpen = React.useCallback(() => {
    handleDelay({isProgressing: true})
    searchFn({storeName, type: 'init', filterFor}).then((result: any) => {
      handleDelay({isProgressing: false, cb: () => setOptions(result)})
    })
  }, [filterFor, searchFn, storeName, handleDelay])

  const handleCloseComplete = React.useCallback(() => {
    resetDelay()
    setOptions([])
    searchFn({storeName, type: 'discard'})
    onCloseComplete()
  }, [searchFn, storeName, onCloseComplete, resetDelay])

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
      emptyView={({close}: any) =>
        isLoading ? <Progressing /> : emptyView(searchValue.current, close)
      }
      contentView={contentView}
    >
      {children}
    </SelectMenu>
  )
}

export default React.memo(AsyncSelectMenu)
