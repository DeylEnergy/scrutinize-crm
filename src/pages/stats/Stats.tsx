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

const CELL_TEST_ID_PREFIX = 'stats'

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
      const reversedPeriod = reversePeriodView(item.period)

      const soldSumCell = {
        value: Number(item.soldSum).toLocaleString(STRING_FORMAT),
        testId: `${CELL_TEST_ID_PREFIX}-sold-sum_${reversedPeriod}`,
      }

      const incomeSumCell = {
        value: Number(item.incomeSum).toLocaleString(STRING_FORMAT),
        testId: `${CELL_TEST_ID_PREFIX}-income-sum_${reversedPeriod}`,
      }

      const spentSumCell = {
        value:
          item.spentSum && Number(item.spentSum).toLocaleString(STRING_FORMAT),
        testId: `${CELL_TEST_ID_PREFIX}-spent-sum_${reversedPeriod}`,
      }

      return {
        id: item.id,
        cells: [
          reversedPeriod,
          soldSumCell,
          incomeSumCell,
          spentSumCell || '0',
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
