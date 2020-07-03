import React from 'react'
import Table from '../../../components/Table'
import GlobalContext from '../../../contexts/globalContext'

const columns = [
  {label: 'Date', width: 150},
  {label: 'Product Id', width: 250},
  {label: 'Name', width: 150},
  {label: 'Model', width: 150},
  {label: 'Price', width: 150},
  {label: 'Count', width: 150},
  {label: 'Sum', width: 150},
  {label: 'Supplier', width: 150},
  {label: 'Buyer', width: 150},
]

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function serializeItem(item: any) {
  return {
    id: item.id,
    cells: [
      new Date(item.datetime).toLocaleDateString(),
      item._productId,
      item._product.nameModel[0],
      item._product.nameModel[1],
      item.price,
      item.count,
      item.sum,
      item._supplierId,
      item._userId,
    ],
  }
}

export default function Products() {
  const {worker} = React.useContext(GlobalContext)
  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    LOADED_ITEMS_DEFAULT,
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const loadMoreItems = React.useCallback(() => {
    worker
      .getAcquisitions({
        storeName: 'acquisitions',
        indexName: 'datetime',
        limit: FETCH_ITEM_LIMIT,
        lowerBoundKey: loadedItems.lastKey,
      })
      .then((newItems: any) => {
        const newItemsSerialized = newItems.map(serializeItem)

        setLoadedItems({
          ...loadedItems,
          hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
          items: [...loadedItems.items, ...newItemsSerialized],
          lastKey: newItems && newItems[newItems.length - 1].datetime,
        })
      })
  }, [loadedItems.items])

  return (
    <Table
      columns={columns}
      rows={loadedItems.items}
      hasNextPage={loadedItems.hasNextPage}
      isItemLoaded={isItemLoaded}
      loadMoreItems={loadMoreItems}
    />
  )
}
