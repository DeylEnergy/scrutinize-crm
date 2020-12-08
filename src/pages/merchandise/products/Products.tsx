import React from 'react'
import {
  Popover,
  Menu,
  IconButton,
  Position,
  MoreIcon,
  EditIcon,
} from 'evergreen-ui'
import {PageWrapper, ControlWrapper} from '../../../layouts'
import Filters from './Filters'
import SearchInput from '../../../components/SearchInput'
import Table from '../../../components/Table'
import UpdateProduct from './UpdateProduct'
import {
  STORE_NAME as SN,
  INDEX_NAME as IN,
  PRODUCTS_FILTER_OPTIONS as FILTER_OPTIONS,
} from '../../../constants'
import RIGHTS from '../../../constants/rights'
import {
  withErrorBoundary,
  useLocale,
  useAccount,
  useDatabase,
  useUpdate,
  useLocalStorage,
  useCancellablePromise,
  getLocaleTimeString,
} from '../../../utilities'

interface Supplier {
  id: number
  name: string
  phoneNumber: string
  extra: string
}

interface Customer {
  id: number
  name: string
  discount: boolean
  extra: string
}

interface SaleShape {
  id: string
  _cartId: string
  _productId: number
  _acquisitionId?: string
  datetime: number
  realPrice: number
  sumPrice: number
  count: number
  income: number
  _userId: number
  _customerId?: number
  extra: string
}

interface AcquisitionShape {
  id: string
  datetime: string
  count: number
  seller: string
  executor: string
  extra: string
}

interface ProductsShape {
  id: number
  name: string
  model: string
  inStockCount: number
  soldCount: number
  lowestBoundCount: number
  isFrozen: boolean
  image: string | null
  sales: [SaleShape] | []
  acquisitions: [AcquisitionShape] | []
}

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

function Products() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.PRODUCTS
  const {STRING_FORMAT} = locale.vars.GENERAL
  const [{permissions, user}] = useAccount()
  const db = useDatabase()

  const makeCancellablePromise = useCancellablePromise()

  const itemsRef = React.useRef<any>(null)

  const loaderRef = React.useRef<any>(null)

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => {
      const updated = {...s, ...v}
      itemsRef.current = updated.items
      return updated
    },
    LOADED_ITEMS_DEFAULT,
  )

  const [filterBy, setFilterBy] = useLocalStorage(
    `PRODUCTS_FILTERS_${user?.id}`,
    FILTER_OPTIONS.IN_STOCK,
  )

  const [searchQuery, setSearchQuery] = React.useState('')

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const serializeItem = React.useCallback(
    item => {
      const editSideSheet = () => {
        setSideSheet({
          value: JSON.parse(JSON.stringify(item)),
          isShown: true,
        })
      }

      const canEditProducts = permissions.includes(RIGHTS.CAN_EDIT_PRODUCTS)

      const realPriceCell = Number(item.realPrice).toLocaleString(STRING_FORMAT)

      const salePriceCell = Number(item.salePrice).toLocaleString(STRING_FORMAT)

      const localeSoldDate = getLocaleTimeString(
        item.lastSoldDatetime,
        STRING_FORMAT,
      )
      const lastSoldTimeCell =
        localeSoldDate && `${localeSoldDate.date} ${localeSoldDate.time}`

      return {
        id: item.id,
        isDisabled: item.inStockCount <= 0,
        cells: [
          item.nameModel[0],
          item.nameModel[1],
          realPriceCell,
          salePriceCell,
          item.inStockCount,
          item.soldCount,
          lastSoldTimeCell,
          new Date(item.lastAcquiredDatetime).toLocaleDateString(STRING_FORMAT), // last acquisition
          item.lowestBoundCount,
          item.id.split('-')[0],
        ],
        onDoubleClick: (canEditProducts && editSideSheet) || null,
        optionsMenu: canEditProducts && (
          <Popover
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item onSelect={editSideSheet} icon={EditIcon}>
                    Edit
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
    [STRING_FORMAT, permissions],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchItems = React.useCallback(
    ({lastKey, searchQuery = ''}: any) => {
      const queryFetch = makeCancellablePromise(
        db.getRows({
          storeName: SN.PRODUCTS,
          indexName: IN.NAME_MODEL,
          limit: FETCH_ITEM_LIMIT,
          lastKey,
          filterBy,
          filterParams: {searchQuery},
        }),
      )

      queryFetch.then((newItems: any) => {
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
    [makeCancellablePromise, db, filterBy, serializeItem, loadedItems],
  )

  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    fetchItems({lastKey, searchQuery})
    loaderRef.current?.resetloadMoreItemsCache()
  }, [fetchItems, lastKey, searchQuery])

  useUpdate(() => {
    fetchItems({searchQuery})
  }, [searchQuery, filterBy])

  const handleFilterChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterBy(e.target.value)
    },
    [setFilterBy],
  )

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const handleSearchQuery = React.useCallback(
    (value: string) => {
      setSearchQuery(value)
    },
    [setSearchQuery],
  )

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE
    return [
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH, canGrow: true},
      {label: COLUMNS.REAL_PRICE.TITLE, width: COLUMNS.REAL_PRICE.WIDTH},
      {label: COLUMNS.SALE_PRICE.TITLE, width: COLUMNS.SALE_PRICE.WIDTH},
      {label: COLUMNS.IN_STOCK.TITLE, width: COLUMNS.IN_STOCK.WIDTH},
      {label: COLUMNS.SOLD.TITLE, width: COLUMNS.SOLD.WIDTH},
      {label: COLUMNS.LAST_SOLD.TITLE, width: COLUMNS.LAST_SOLD.WIDTH},
      {label: COLUMNS.LAST_ACQUIRED.TITLE, width: COLUMNS.LAST_ACQUIRED.WIDTH},
      {label: COLUMNS.LOWEST_BOUND.TITLE, width: COLUMNS.LOWEST_BOUND.WIDTH},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
      {label: 'OPTIONS', width: 50},
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
        <Filters value={filterBy} handleFilterChange={handleFilterChange} />
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
        <UpdateProduct
          items={loadedItems.items}
          setLoadedItems={setLoadedItems}
          serializeItem={serializeItem}
          sideSheet={sideSheet}
          setSideSheet={setSideSheet}
          onCloseComplete={handleSlideSheetCloseComplete}
        />
      )}
    </PageWrapper>
  )
}

export default withErrorBoundary(Products)
