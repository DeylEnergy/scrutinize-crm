import React from 'react'
import {TableHead, SearchTableHeaderCell, SearchIcon} from 'evergreen-ui'
import {PageWrapper} from '../../../layouts'
import Table from '../../../components/Table'
import {
  STORE_NAME as SN,
  INDEX_NAME as IN,
  PRODUCTS_FILTER_OPTIONS as FILTER_OPTIONS,
} from '../../../constants'
import {
  withErrorBoundary,
  useLocale,
  useDatabase,
  useUpdate,
  debounce,
} from '../../../utilities'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const CELL_STYLE = {cursor: 'pointer'}

function PickProduct({handleProductSelect}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS.CONTROLS.SELECT_PRODUCT
  const {TABLE} = PAGE_CONST
  const {STRING_FORMAT} = locale.vars.GENERAL

  const db = useDatabase()

  const itemsRef = React.useRef<any>(null)

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => {
      const updated = {...s, ...v}
      itemsRef.current = updated.items
      return updated
    },
    LOADED_ITEMS_DEFAULT,
  )

  const [searchQuery, setSearchQuery] = React.useState('')

  const serializeItem = React.useCallback(
    item => {
      const salePriceCell = Number(item.salePrice).toLocaleString(STRING_FORMAT)

      return {
        id: item.id,
        cells: [item.nameModel.join(' '), salePriceCell],
        onClick: () => handleProductSelect(item.id),
        style: CELL_STYLE,
      }
    },
    [STRING_FORMAT, handleProductSelect],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchItems = React.useCallback(
    ({lastKey, searchQuery = ''}: any) => {
      db.getRows({
        storeName: SN.PRODUCTS,
        indexName: IN.NAME_MODEL,
        limit: FETCH_ITEM_LIMIT,
        lastKey,
        filterBy: FILTER_OPTIONS.IN_STOCK,
        filterParams: {searchQuery},
      }).then((newItems: any) => {
        if (!newItems) {
          return
        }
        const newItemsSerialized = newItems.map(serializeItem)
        setLoadedItems({
          ...loadedItems,
          hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
          items: [...(lastKey ? itemsRef.current : []), ...newItemsSerialized],
          lastKey: newItems.length && newItems[newItems.length - 1].nameModel,
        })
      })
    },
    [db, serializeItem, loadedItems],
  )

  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    fetchItems({lastKey, searchQuery})
  }, [fetchItems, lastKey, searchQuery])

  const debouncedFetch = React.useMemo(() => {
    return debounce(fetchItems)
  }, [fetchItems])

  useUpdate(() => {
    debouncedFetch({searchQuery})
  }, [searchQuery])

  const columns = React.useMemo(() => {
    const {COLUMNS} = TABLE
    return [
      {width: COLUMNS.NAME_MODEL.WIDTH, canGrow: true},
      {width: COLUMNS.IN_STOCK.WIDTH},
    ]
  }, [TABLE])

  return (
    <PageWrapper>
      <TableHead>
        <SearchTableHeaderCell
          value={searchQuery}
          onChange={(e: any) => setSearchQuery(e)}
          borderRight={undefined}
          height={32}
          placeholder={PAGE_CONST.SEARCH_PLACEHOLDER}
          icon={SearchIcon}
        />
      </TableHead>
      <Table
        columns={columns}
        rows={loadedItems.items}
        rowHeight={32}
        isHeaderShown={false}
        isRowNumberShown={false}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
      />
    </PageWrapper>
  )
}

export default withErrorBoundary(PickProduct)
