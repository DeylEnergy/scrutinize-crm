// @ts-nocheck
import React from 'react'
import {Popover, Menu, IconButton, Position} from 'evergreen-ui'
import Table from '../../../components/Table'
import UpdateProduct from './UpdateProduct'
import GlobalContext from '../../../contexts/globalContext'
import worker from './worker' // eslint-disable-line import/no-webpack-loader-syntax

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

// const products: [ProductsShape] = [
//   {
//     id: 0,
//     name: 'Name #0',
//     model: 'Model #0',
//     inStockCount: 1,
//     soldCount: 1,
//     lowestBoundCount: 3,
//     isFrozen: false,
//     image: null,
//     sales: [],
//     acquisitions: [],
//   },
// ]

// for (let i = 1; i < 1000; i++) {
//   products.push({
//     ...products[0],
//     id: i,
//     name: `Name #${i}`,
//     model: `Model #${i}`,
//   })
// }

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

export default function Products() {
  const {worker} = React.useContext(GlobalContext)

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    LOADED_ITEMS_DEFAULT,
  )

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
      onDoubleClick: editSideSheet,
      optionsMenu: (
        <Popover
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item onSelect={editSideSheet} icon="edit">
                  Edit
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }
          position={Position.BOTTOM_RIGHT}
        >
          <IconButton icon="more" height={24} appearance="minimal" />
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

  const loadMoreItems = React.useCallback(() => {
    worker
      .getRows({
        storeName: 'products',
        indexName: 'nameModel',
        limit: FETCH_ITEM_LIMIT,
        lastKey: loadedItems.lastKey,
      })
      .then(newItems => {
        const newItemsSerialized = newItems.map(serializeItem)
        setLoadedItems({
          ...loadedItems,
          hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
          items: [...loadedItems.items, ...newItemsSerialized],
          lastKey: newItems && newItems[newItems.length - 1].nameModel,
        })
      })
  }, [loadedItems.items])

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  return (
    <>
      {
        <Table
          columns={columns}
          rows={loadedItems.items}
          hasNextPage={loadedItems.hasNextPage}
          isItemLoaded={isItemLoaded}
          loadMoreItems={loadMoreItems}
        />
      }
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
    </>
  )
}
