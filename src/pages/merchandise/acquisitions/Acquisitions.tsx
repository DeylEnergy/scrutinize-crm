import React from 'react'
import Table from '../../../components/Table'
import {useLocale, useDatabase, withErrorBoundary} from '../../../utilities'

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
      item._product.nameModel[0],
      item._product.nameModel[1],
      item.price,
      item.count,
      item.sum,
      item._supplier?.name,
      item._user?.name,
      item._productId,
    ],
  }
}

function Acquisitions() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.ACQUISITIONS
  const db = useDatabase()
  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    LOADED_ITEMS_DEFAULT,
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || Boolean(loadedItems.items[index])
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const loadMoreItems = React.useCallback(() => {
    db.getRows({
      storeName: 'acquisitions',
      indexName: 'datetime',
      direction: 'prev',
      limit: FETCH_ITEM_LIMIT,
      lastKey: loadedItems.lastKey,
    }).then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)
      setLoadedItems({
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...loadedItems.items, ...newItemsSerialized],
        lastKey: newItems.length && newItems[newItems.length - 1].datetime,
      })
    })
  }, [loadedItems.items])

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE
    return [
      {label: COLUMNS.DATE, width: 150},
      {label: COLUMNS.NAME, width: 150},
      {label: COLUMNS.MODEL, width: 150},
      {label: COLUMNS.PRICE, width: 150},
      {label: COLUMNS.COUNT, width: 150},
      {label: COLUMNS.SUM, width: 150},
      {label: COLUMNS.SUPPLIER, width: 150},
      {label: COLUMNS.EXECUTOR, width: 150},
      {label: COLUMNS.PRODUCT_ID, width: 250},
    ]
  }, [PAGE_CONST])

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

export default withErrorBoundary(Acquisitions)
