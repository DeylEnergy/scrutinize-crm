import React from 'react'
import Table from '../../../components/Table'
import {useLocale, useDatabase, withErrorBoundary} from '../../../utilities'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function Acquisitions() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.ACQUISITIONS
  const db = useDatabase()
  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    LOADED_ITEMS_DEFAULT,
  )

  const serializeItem = React.useCallback(
    (item: any) => {
      const priceCell = Number(item.price).toLocaleString(STRING_FORMAT)

      const sumCell = Number(item.sum).toLocaleString(STRING_FORMAT)

      return {
        id: item.id,
        cells: [
          new Date(item.datetime).toLocaleDateString(STRING_FORMAT),
          item._product.nameModel[0],
          item._product.nameModel[1],
          priceCell,
          item.count,
          sumCell,
          item._supplier?.name,
          item._user?.name,
          item._productId,
        ],
      }
    },
    [STRING_FORMAT],
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
      {label: COLUMNS.DATE.TITLE, width: COLUMNS.DATE.WIDTH, canGrow: true},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH},
      {label: COLUMNS.PRICE.TITLE, width: COLUMNS.PRICE.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: COLUMNS.COUNT.WIDTH},
      {label: COLUMNS.SUM.TITLE, width: COLUMNS.SUM.WIDTH},
      {label: COLUMNS.SUPPLIER.TITLE, width: COLUMNS.SUPPLIER.WIDTH},
      {label: COLUMNS.EXECUTOR.TITLE, width: COLUMNS.EXECUTOR.WIDTH},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
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
