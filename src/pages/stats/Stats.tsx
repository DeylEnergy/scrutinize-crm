import React from 'react'
import Table from '../../components/Table'
import {STORE_NAME as SN} from '../../constants'
import {
  useLocale,
  useDatabase,
  useCancellablePromise,
  reversePeriodView,
  withErrorBoundary,
} from '../../utilities'
import {PageWrapper, ControlWrapper} from '../../layouts'
import ProductsOutlinePanel from './ProductsOutlinePanel'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function Stats() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.STATS
  const {STRING_FORMAT} = locale.vars.GENERAL
  const db = useDatabase()
  const itemsRef = React.useRef<any>([])

  const makeCancellablePromise = useCancellablePromise()

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => {
      const updated = {...s, ...v}
      itemsRef.current = updated.items
      return updated
    },
    LOADED_ITEMS_DEFAULT,
  )

  const serializeItem = React.useCallback(
    item => {
      const soldSumCell = Number(item.soldSum).toLocaleString(STRING_FORMAT)

      const incomeSumCell = Number(item.incomeSum).toLocaleString(STRING_FORMAT)

      const spentSumCell =
        item.spentSum && Number(item.spentSum).toLocaleString(STRING_FORMAT)

      return {
        id: item.id,
        cells: [
          reversePeriodView(item.period),
          soldSumCell,
          incomeSumCell,
          spentSumCell || '',
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
    const queryFetch = makeCancellablePromise(
      db.getRows({
        storeName: SN.STATS,
        direction: 'prev',
        limit: FETCH_ITEM_LIMIT,
        lastKey,
      }),
    )

    queryFetch.then((newItems: any) => {
      if (!newItems) {
        return
      }

      const newItemsSerialized = newItems.map(serializeItem)
      setLoadedItems({
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...itemsRef.current, ...newItemsSerialized],
        lastKey: newItems.length && newItems[newItems.length - 1].period,
      })
    })
  }, [db, lastKey, serializeItem, makeCancellablePromise])

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE
    return [
      {label: COLUMNS.PERIOD.TITLE, width: COLUMNS.PERIOD.WIDTH},
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
    ]
  }, [PAGE_CONST])

  return (
    <PageWrapper>
      <ControlWrapper>
        <ProductsOutlinePanel />
      </ControlWrapper>
      {/* <Pane flex={1}>, */}
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
      />
      {/* </Pane> */}
    </PageWrapper>
  )
}

export default withErrorBoundary(Stats)
