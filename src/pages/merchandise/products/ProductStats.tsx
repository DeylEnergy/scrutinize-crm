import React from 'react'
import {Pane} from 'evergreen-ui'
import Table from '../../../components/Table'
import {STORE_NAME as SN} from '../../../constants'
import {
  useLocale,
  useDatabase,
  reversePeriodView,
  withErrorBoundary,
} from '../../../utilities'
import {PageWrapper} from '../../../layouts'

const TABLE_HEIGHT = 250

const NO_CONTENT_HEIGHT = 32

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function ProductStats({productId}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const {DRAWER} = locale.vars.PAGES.PRODUCTS
  const db = useDatabase()
  const itemsRef = React.useRef<any>([])

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => {
      const updated = {...s, ...v}
      itemsRef.current = updated.items
      return updated
    },
    LOADED_ITEMS_DEFAULT,
  )

  const [firstFetched, setFirstFetched] = React.useState(false)

  const serializeItem = React.useCallback(
    item => {
      const [, period] = item.productIdPeriod

      const soldSumCell = Number(item.soldSum).toLocaleString(STRING_FORMAT)

      const incomeSumCell = Number(item.incomeSum).toLocaleString(STRING_FORMAT)

      const acquiredSumCell =
        item.acquiredSum &&
        Number(item.acquiredSum).toLocaleString(STRING_FORMAT)

      const returnedSumCell =
        item.returnedSum &&
        Number(item.returnedSum).toLocaleString(STRING_FORMAT)

      return {
        id: item.id,
        cells: [
          reversePeriodView(period),
          item.soldCount,
          item.acquiredCount,
          item.returnedCount,
          soldSumCell,
          incomeSumCell,
          acquiredSumCell || '',
          returnedSumCell || '',
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

  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    db.getRows({
      storeName: SN.PRODUCTS_STATS,
      direction: 'prev',
      limit: FETCH_ITEM_LIMIT,
      filterBy: 'productId',
      filterParams: {_productId: productId},
      lastKey,
    }).then((newItems: any) => {
      if (!newItems) {
        return
      }

      const newItemsSerialized = newItems.map(serializeItem)
      setLoadedItems({
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...itemsRef.current, ...newItemsSerialized],
        lastKey:
          newItems.length && newItems[newItems.length - 1].productIdPeriod,
      })
    })
  }, [db, lastKey, serializeItem, productId])

  const columns = React.useMemo(() => {
    const {COLUMNS} = DRAWER.TABLE
    return [
      {
        label: COLUMNS.PERIOD.TITLE,
        width: COLUMNS.PERIOD.WIDTH,
      },
      {
        label: COLUMNS.SOLD_COUNT.TITLE,
        width: COLUMNS.SOLD_COUNT.WIDTH,
        canGrow: true,
      },
      {
        label: COLUMNS.ACQUIRED_COUNT.TITLE,
        width: COLUMNS.ACQUIRED_COUNT.WIDTH,
        canGrow: true,
      },
      {
        label: COLUMNS.RETURNED_COUNT.TITLE,
        width: COLUMNS.RETURNED_COUNT.WIDTH,
        canGrow: true,
      },
      {
        label: COLUMNS.SOLD_SUM.TITLE,
        width: COLUMNS.SOLD_SUM.WIDTH,
        canGrow: true,
      },
      {
        label: COLUMNS.INCOME_SUM.TITLE,
        width: COLUMNS.INCOME_SUM.WIDTH,
        canGrow: true,
      },
      {
        label: COLUMNS.SPENT_SUM.TITLE,
        width: COLUMNS.SPENT_SUM.WIDTH,
        canGrow: true,
      },
      {
        label: COLUMNS.RETURNED_SUM.TITLE,
        width: COLUMNS.RETURNED_SUM.WIDTH,
        canGrow: true,
      },
    ]
  }, [DRAWER])

  return (
    <Pane
      height={
        loadedItems.items.length && firstFetched
          ? TABLE_HEIGHT
          : NO_CONTENT_HEIGHT
      }
    >
      <PageWrapper>
        <Pane flex={1}>
          <Table
            columns={columns}
            rows={loadedItems.items}
            hasNextPage={loadedItems.hasNextPage}
            isItemLoaded={isItemLoaded}
            loadMoreItems={loadMoreItems}
            isRowNumberShown={false}
            onFirstFetchComplete={() => setFirstFetched(true)}
          />
        </Pane>
      </PageWrapper>
    </Pane>
  )
}

export default withErrorBoundary(ProductStats)
