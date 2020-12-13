import React from 'react'
import {Menu, IconButton, MoreIcon, EditIcon, Position} from 'evergreen-ui'
import Filters, {FILTER_PARAMS_DEFAULT} from './Filters'
import SearchInput from '../../../components/SearchInput'
import Table from '../../../components/Table'
import UpdateAcquisitionInStockCount from './UpdateAcquisitionInStockCount'
import Popover from '../../../components/Popover'
import {
  useLocale,
  useDatabase,
  useAccount,
  useCancellablePromise,
  useUpdate,
  withErrorBoundary,
} from '../../../utilities'
import {PageWrapper, ControlWrapper} from '../../../layouts'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {UPDATE_ACQUISITION_IN_STOCK_COUNT} from '../../../constants/events'
import RIGHTS from '../../../constants/rights'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const SIDE_SHEET_DEFAULT = {
  value: null,
  isShown: false,
}

const PERIOD_START_DEFAULT = [-Infinity]
const PERIOD_STOP_DEFAULT = [Infinity]

function Acquisitions() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.ACQUISITIONS
  const db = useDatabase()

  const [{permissions}] = useAccount()

  const makeCancellablePromise = useCancellablePromise()

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const loaderRef = React.useRef<any>(null)

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
    (item: any) => {
      const editSideSheet = () => {
        setSideSheet({
          value: {id: item.id, inStockCount: item.inStockCount},
          isShown: true,
        })
      }

      const acquiredDate = new Date(item.datetime[0])
      const acquiredDateCell = {
        value: acquiredDate.toLocaleDateString(STRING_FORMAT),
      }

      const nameModel =
        item?._product?.nameModel || item?._legacyProductNameModel

      const priceCell = Number(item.price).toLocaleString(STRING_FORMAT)

      const countCell = {
        value: item.count,
        tooltipContent: (
          <>
            <b>{PAGE_CONST.TABLE.TOOLTIP.IN_STOCK_COUNT}:</b>{' '}
            {item.inStockCount || 0}
          </>
        ),
      }

      const sumCell = Number(item.sum).toLocaleString(STRING_FORMAT)

      const aqIdCell = item.id.split('-')[0]

      return {
        id: item.id,
        cells: [
          acquiredDateCell,
          nameModel[0],
          nameModel[1],
          priceCell,
          countCell,
          sumCell,
          item._supplier?.name,
          item._user?.name,
          item?._productId?.split('-')[0],
          aqIdCell,
        ],
        optionsMenu: permissions.includes(
          RIGHTS.CAN_EDIT_ACQUISITION_IN_STOCK_COUNT,
        ) && (
          <Popover
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item onSelect={editSideSheet} icon={EditIcon}>
                    {PAGE_CONST.TABLE.OPTIONS.EDIT_IN_STOCK_COUNT}
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }
            position={Position.BOTTOM_RIGHT}
          >
            <IconButton icon={MoreIcon} height={24} appearance="minimal" />
          </Popover>
        ),
      }
    },
    [STRING_FORMAT, PAGE_CONST, permissions],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || Boolean(loadedItems.items[index])
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

      const queryFetch = makeCancellablePromise(
        db.getRows({
          storeName: SN.ACQUISITIONS,
          indexName: IN.DATETIME,
          direction: 'prev',
          limit: FETCH_ITEM_LIMIT,
          customKeyRange: {
            method: 'bound',
            args: [startDate, stopDate, excludeLastItem, includeFirstItem],
          },
          filterBy: 'consist',
          filterParams: {searchQuery},
        }),
      )

      queryFetch.then((newItems: any) => {
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
    [makeCancellablePromise, db, serializeItem],
  )

  const {from, to} = filterParams
  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    fetchItems({from, to, searchQuery, lastKey})
  }, [fetchItems, from, to, searchQuery, lastKey])

  useUpdate(() => {
    fetchItems({from, to, searchQuery})
    loaderRef.current?.resetloadMoreItemsCache()
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

  const handleAcquisitionInStockCountUpdate = React.useCallback(
    updatedAcquisition => {
      db.sendEvent({
        type: UPDATE_ACQUISITION_IN_STOCK_COUNT,
        payload: updatedAcquisition,
        consumer: 'client',
      }).then((result: any) => {
        if (!result) {
          return
        }

        const {acquisition} = result

        const items = itemsRef.current

        const foundIndex = items.findIndex((x: any) => x.id === acquisition.id)
        items[foundIndex] = serializeItem(acquisition)

        setLoadedItems({items: [...items]})
        setTimeout(() => setSideSheet({isShown: false}))
      })
    },
    [db, serializeItem],
  )

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE

    const tableColumns = [
      {label: COLUMNS.DATE.TITLE, width: COLUMNS.DATE.WIDTH},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH, canGrow: true},
      {label: COLUMNS.PRICE.TITLE, width: COLUMNS.PRICE.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: COLUMNS.COUNT.WIDTH},
      {label: COLUMNS.SUM.TITLE, width: COLUMNS.SUM.WIDTH},
      {label: COLUMNS.SUPPLIER.TITLE, width: COLUMNS.SUPPLIER.WIDTH},
      {label: COLUMNS.EXECUTOR.TITLE, width: COLUMNS.EXECUTOR.WIDTH},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
      {
        label: COLUMNS.ACQUISITION_ID.TITLE,
        width: COLUMNS.ACQUISITION_ID.WIDTH,
      },
    ]

    if (permissions.includes(RIGHTS.CAN_EDIT_ACQUISITION_IN_STOCK_COUNT)) {
      tableColumns.push({label: 'OPTIONS', width: 50})
    }

    return tableColumns
  }, [PAGE_CONST, permissions])

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
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
        loaderRef={loaderRef}
      />
      {sideSheet.value && (
        <UpdateAcquisitionInStockCount
          sideSheet={sideSheet}
          handleAcquisitionInStockCountUpdate={
            handleAcquisitionInStockCountUpdate
          }
          onCloseComplete={handleSlideSheetCloseComplete}
        />
      )}
    </PageWrapper>
  )
}

export default withErrorBoundary(Acquisitions)
