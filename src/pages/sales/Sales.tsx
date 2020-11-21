import React from 'react'
import {Pane} from 'evergreen-ui'
import SearchInput from '../../components/SearchInput'
import Filters, {FILTER_PARAMS_DEFAULT} from './Filters'
import Table from '../../components/Table'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {useLocale, useDatabase, withErrorBoundary} from '../../utilities'
import {PageWrapper, ControlWrapper} from '../../layouts'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const PERIOD_START_DEFAULT = [-Infinity]
const PERIOD_STOP_DEFAULT = [Infinity]

function Sales() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.SALES

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

  const [filterParams, setFilterParams] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    FILTER_PARAMS_DEFAULT,
  )

  const serializeItem = React.useCallback(
    item => {
      const saleTime = new Date(item.datetime[0])
      const saleTimeCell = {
        value: `${saleTime.toLocaleDateString(
          STRING_FORMAT,
        )} ${saleTime.toLocaleTimeString(STRING_FORMAT)}`,
      }

      const salePriceCell = Number(item.salePrice).toLocaleString(STRING_FORMAT)

      const sumCell = Number(item.sum).toLocaleString(STRING_FORMAT)

      return {
        id: item.id,
        isDisabled: Boolean(item.returned),
        cells: [
          saleTimeCell,
          item._product.nameModel[0],
          item._product.nameModel[1],
          salePriceCell,
          item.count,
          sumCell,
          item?._user?.name,
          item?._customer?.name,
          item.note,
        ],
      }
    },
    [STRING_FORMAT],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchItems = React.useCallback(
    ({from, to, lastKey, searchQuery = ''}: any) => {
      const startDate = (to && [to]) ?? PERIOD_START_DEFAULT
      const stopDate =
        lastKey ?? (from && [from, Infinity]) ?? PERIOD_STOP_DEFAULT
      const includeFirstItem = Boolean(lastKey)
      const excludeLastItem = false
      db.getRows({
        storeName: SN.SALES,
        indexName: IN.DATETIME,
        direction: 'prev',
        limit: FETCH_ITEM_LIMIT,
        customKeyRange: {
          method: 'bound',
          args: [startDate, stopDate, excludeLastItem, includeFirstItem],
        },
        filterBy: 'consist',
        filterParams: {searchQuery},
      }).then((newItems: any) => {
        if (!newItems) {
          return
        }

        const newItemsSerialized = newItems.map(serializeItem)
        setLoadedItems({
          hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
          items: [...(lastKey ? itemsRef.current : []), ...newItemsSerialized],
          lastKey:
            (newItems.length && newItems[newItems.length - 1].datetime) || null,
        })
      })
    },
    [db, serializeItem],
  )

  const {from, to} = filterParams
  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    fetchItems({from, to, searchQuery, lastKey})
  }, [fetchItems, from, to, searchQuery, lastKey])

  React.useEffect(() => {
    fetchItems({from, to, searchQuery})
  }, [from, to, searchQuery, fetchItems])

  const handleSearchQuery = React.useCallback(
    (value: string) => {
      setSearchQuery(value)
    },
    [setSearchQuery],
  )

  const handleFilterChange = React.useCallback(
    (params: any) => {
      setFilterParams(params)
    },
    [setFilterParams],
  )

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE
    return [
      {label: COLUMNS.TIME.TITLE, width: COLUMNS.TIME.WIDTH},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH, canGrow: true},
      {label: COLUMNS.SALE_PRICE.TITLE, width: COLUMNS.SALE_PRICE.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: COLUMNS.COUNT.WIDTH},
      {label: COLUMNS.SUM.TITLE, width: COLUMNS.SUM.WIDTH},
      {label: COLUMNS.SALESPERSON.TITLE, width: COLUMNS.SALESPERSON.WIDTH},
      {label: COLUMNS.CUSTOMER.TITLE, width: COLUMNS.CUSTOMER.WIDTH},
      {label: COLUMNS.NOTE.TITLE, width: COLUMNS.NOTE.WIDTH, canGrow: true},
    ]
  }, [PAGE_CONST])

  return (
    <PageWrapper>
      <ControlWrapper>
        <SearchInput
          width={210}
          placeholder={PAGE_CONST.CONTROLS.SEARCH_PLACEHOLDER}
          value={searchQuery}
          handleSearchQuery={handleSearchQuery}
        />
        <Filters
          period={filterParams.period}
          handleFilterChange={handleFilterChange}
        />
      </ControlWrapper>
      <Pane flex={1}>
        <Table
          columns={columns}
          rows={loadedItems.items}
          hasNextPage={loadedItems.hasNextPage}
          isItemLoaded={isItemLoaded}
          loadMoreItems={loadMoreItems}
        />
      </Pane>
    </PageWrapper>
  )
}

export default withErrorBoundary(Sales)
