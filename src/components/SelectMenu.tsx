import React from 'react'
// @ts-ignore
import arrify from 'arrify'
import {
  Position,
  Pane,
  SelectMenuContent,
  Heading,
  TableHead,
  SearchTableHeaderCell,
  IconButton,
  CrossIcon,
  SearchIcon,
} from 'evergreen-ui'
import Popover from './Popover'
import {debounce, getTestId} from '../utilities'

function getEmptyView(close: any, emptyView: any) {
  if (typeof emptyView === 'function') {
    return {
      emptyView: emptyView({close}),
    }
  }

  if (emptyView) {
    return {emptyView}
  }

  return {}
}

function noop() {}

function Header({
  title,
  hasFilter,
  filterIcon,
  filterPlaceholder,
  asyncSearch = noop,
  asyncSearchDebounceTimeMs = 166,
  onFilterChangeHandler = noop,
  close,
}: any) {
  const [searchValue, setSearchValue] = React.useState('')
  const searchRef = React.useRef<any>()

  React.useEffect(() => {
    let requestId: number
    if (searchRef.current) {
      requestId = requestAnimationFrame(() => {
        searchRef.current.focus()
      })
    }

    return () => {
      cancelAnimationFrame(requestId)
    }
  }, [])

  const debouncedAsyncSearch = React.useMemo(() => {
    return debounce(asyncSearch, asyncSearchDebounceTimeMs)
  }, [asyncSearch, asyncSearchDebounceTimeMs])

  const handleChange = React.useCallback(
    (value: any) => {
      setSearchValue(value)
      onFilterChangeHandler(value)
      debouncedAsyncSearch(value)
    },
    [setSearchValue, onFilterChangeHandler, debouncedAsyncSearch],
  )

  return (
    <>
      <Pane
        display="flex"
        alignItems="center"
        borderBottom="default"
        padding={8}
        height={40}
        boxSizing="border-box"
      >
        <Pane flex="1" display="flex" alignItems="center">
          <Heading size={400}>{title}</Heading>
        </Pane>
        <IconButton
          icon={CrossIcon}
          appearance="minimal"
          height={24}
          onClick={close}
        />
      </Pane>
      {hasFilter && (
        <TableHead>
          <SearchTableHeaderCell
            ref={searchRef}
            value={searchValue}
            onChange={handleChange}
            borderRight={undefined}
            height={32}
            placeholder={filterPlaceholder}
            icon={filterIcon}
            {...getTestId('select-menu-search-input')}
          />
        </TableHead>
      )}
    </>
  )
}

function SelectMenu({
  title,
  width = 240,
  height = 200,
  options,
  selected,
  position = Position.BOTTOM_LEFT,
  hasFilter = true,
  filterPlaceholder = 'Filter...',
  filterIcon = SearchIcon,
  emptyView,
  contentView = null,
  titleView,
  isMultiSelect = false,
  closeOnSelect = false,
  onSelect: onSelectHandler = noop,
  onDeselect: onDeselectHandler = noop,
  onFilterChange: onFilterChangeHandler = noop,
  asyncSearch,
  asyncSearchDebounceTimeMs,
  ...popoverProps
}: any) {
  const listProps = React.useMemo(
    () => ({
      onSelect: (item: any) => {
        onSelectHandler(item)
      },
      onDeselect: (item: any) => {
        onDeselectHandler(item)
      },
      onFilterChange: onFilterChangeHandler,
      selected: arrify(selected),
      ...getTestId('select-menu-options-list'),
    }),
    [onFilterChangeHandler, selected, onSelectHandler, onDeselectHandler],
  )

  return (
    <Popover
      minWidth={width}
      position={position}
      minHeight={height}
      content={({close}: any) => (
        <Pane display="flex" flexDirection="column">
          <Header
            title={title}
            hasFilter={hasFilter}
            filterIcon={filterIcon}
            filterPlaceholder={filterPlaceholder}
            onFilterChangeHandler={onFilterChangeHandler}
            asyncSearch={asyncSearch}
            asyncSearchDebounceTimeMs={asyncSearchDebounceTimeMs}
            close={close}
          />

          {contentView || (
            <SelectMenuContent
              width={width}
              height={height}
              options={options}
              title={title}
              hasFilter={false}
              filterPlaceholder={filterPlaceholder}
              filterIcon={filterIcon}
              hasTitle={false}
              isMultiSelect={isMultiSelect}
              titleView={titleView}
              listProps={listProps}
              close={close}
              {...getEmptyView(close, emptyView)}
              // @ts-ignore
              closeOnSelect={closeOnSelect}
            />
          )}
        </Pane>
      )}
      {...popoverProps}
    />
  )
}

export default SelectMenu
