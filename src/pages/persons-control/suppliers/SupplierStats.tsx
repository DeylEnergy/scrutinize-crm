import React from 'react'
import {Pane} from 'evergreen-ui'
import Table from '../../../components/Table'
import {STORE_NAME as SN} from '../../../constants'
import {
  useLocale,
  useDatabase,
  useCancellablePromise,
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

const CELL_TEST_ID_PREFIX = 'supplier-stats'

function SupplierStats({supplierId}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const {DRAWER} = locale.vars.PAGES.SUPPLIERS
  const db = useDatabase()

  const makeCancellablePromise = useCancellablePromise()

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
      const [, period] = item.supplierIdPeriod

      const reversedPeriod = reversePeriodView(period)

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
        storeName: SN.SUPPLIERS_STATS,
        direction: 'prev',
        limit: FETCH_ITEM_LIMIT,
        filterBy: 'supplierId',
        filterParams: {_supplierId: supplierId},
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
        lastKey:
          newItems.length && newItems[newItems.length - 1].supplierIdPeriod,
      })
    })
  }, [makeCancellablePromise, db, lastKey, serializeItem, supplierId])

  const columns = React.useMemo(() => {
    const {COLUMNS} = DRAWER.TABLE
    return [
      {
        label: COLUMNS.PERIOD.TITLE,
        width: COLUMNS.PERIOD.WIDTH,
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

export default withErrorBoundary(SupplierStats)
