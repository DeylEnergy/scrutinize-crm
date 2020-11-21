import React from 'react'
import {Pane} from 'evergreen-ui'
import Table from '../../../components/Table'
import {STORE_NAME as SN} from '../../../constants'
import {useLocale, useDatabase, withErrorBoundary} from '../../../utilities'
import {PageWrapper} from '../../../layouts'

const TABLE_HEIGHT = 250

const NO_CONTENT_HEIGHT = 32

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function UserStats({userId}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const {DRAWER} = locale.vars.PAGES.USERS
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
      const [, period] = item.userIdPeriod

      const soldSumCell = Number(item.soldSum).toLocaleString(STRING_FORMAT)

      const incomeSumCell = Number(item.incomeSum).toLocaleString(STRING_FORMAT)

      const spentSumCell =
        item.spentSum && Number(item.spentSum).toLocaleString(STRING_FORMAT)

      return {
        id: item.id,
        cells: [period, soldSumCell, incomeSumCell, spentSumCell || ''],
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
      storeName: SN.USERS_STATS,
      direction: 'prev',
      limit: FETCH_ITEM_LIMIT,
      filterBy: 'userId',
      filterParams: {_userId: userId},
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
          newItems.length && newItems[newItems.length - 1].userIdDatetime,
      })
    })
  }, [db, lastKey, serializeItem, userId])

  const columns = React.useMemo(() => {
    const {COLUMNS} = DRAWER.TABLE
    return [
      {label: COLUMNS.PERIOD, width: 80},
      {label: COLUMNS.SOLD_SUM, width: 100, canGrow: true},
      {label: COLUMNS.INCOME_SUM, width: 100, canGrow: true},
      {label: COLUMNS.SPENT_SUM, width: 100, canGrow: true},
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

export default withErrorBoundary(UserStats)
