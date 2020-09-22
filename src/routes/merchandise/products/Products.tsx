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
import SearchInput from '../../../components/SearchInput'
import Table from '../../../components/Table'
import UpdateProduct from './UpdateProduct'
import GlobalContext from '../../../contexts/globalContext'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import RIGHTS from '../../../constants/rights'
import {withErrorBoundary, useAccount, useUpdate} from '../../../utilities'

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

const columns = [
  {label: 'Name', width: 150},
  {label: 'Model', width: 150},
  {label: 'Real Price', width: 150},
  {label: 'Sale Price', width: 150},
  {label: 'In Stock', width: 150},
  {label: 'Sold', width: 150},
  {label: 'Last Sold', width: 150},
  {label: 'Last Acquired', width: 150},
  {label: 'Lowest Bound', width: 150},
  {label: 'OPTIONS', width: 50},
]

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
  const [{permissions}] = useAccount()
  const {worker} = React.useContext(GlobalContext)

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

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const serializeItem = React.useCallback(item => {
    const editSideSheet = () => {
      setSideSheet({
        value: JSON.parse(JSON.stringify(item)),
        isShown: true,
      })
    }

    const canEditProducts = permissions.includes(RIGHTS.CAN_EDIT_PRODUCTS)

    return {
      id: item.id,
      cells: [
        item.nameModel[0],
        item.nameModel[1],
        item.realPrice,
        item.salePrice,
        item.inStockCount,
        item.soldCount,
        item.datetime, // last sold
        new Date(item.lastAcquiredDatetime).toLocaleDateString(), // last acquisition
        item.lowestBoundCount,
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
  }, [])

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchItems = React.useCallback(
    ({lastKey, searchQuery = ''}: any) => {
      worker
        .getRows({
          storeName: SN.PRODUCTS,
          indexName: IN.NAME_MODEL,
          limit: FETCH_ITEM_LIMIT,
          lastKey,
          filterBy: 'consist',
          filterParams: {searchQuery},
        })
        .then((newItems: any) => {
          if (!newItems) {
            return
          }
          const newItemsSerialized = newItems.map(serializeItem)
          setLoadedItems({
            ...loadedItems,
            hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
            items: [
              ...(lastKey ? itemsRef.current : []),
              ...newItemsSerialized,
            ],
            lastKey: newItems.length && newItems[newItems.length - 1].nameModel,
          })
        })
    },
    [setLoadedItems],
  )

  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    fetchItems({lastKey, searchQuery})
  }, [lastKey, searchQuery])

  useUpdate(() => {
    fetchItems({searchQuery})
  }, [searchQuery])

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const handleSearchQuery = React.useCallback(
    (value: string) => {
      setSearchQuery(value)
    },
    [setSearchQuery],
  )

  return (
    <PageWrapper>
      <ControlWrapper>
        <SearchInput
          width={210}
          placeholder="Name or Model and tap Enter..."
          value={searchQuery}
          handleSearchQuery={handleSearchQuery}
        />
      </ControlWrapper>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
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
