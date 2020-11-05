import React from 'react'
import {Pane} from 'evergreen-ui'
import Table from '../../components/Table'
import {STORE_NAME as SN} from '../../constants'
import {useLocale, useDatabase, withErrorBoundary} from '../../utilities'
import {PageWrapper} from '../../layouts'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function Stats() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.STATS
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

  const serializeItem = React.useCallback(item => {
    return {
      id: item.id,
      cells: [item.period, item.soldSum, item.incomeSum, item.spentSum || ''],
    }
  }, [])

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    db.getRows({
      storeName: SN.STATS,
      direction: 'prev',
      limit: FETCH_ITEM_LIMIT,
      lastKey,
    }).then((newItems: any) => {
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
  }, [lastKey])

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE
    return [
      {label: COLUMNS.PERIOD, width: 150},
      {label: COLUMNS.SOLD_SUM, width: 150, canGrow: true},
      {label: COLUMNS.INCOME_SUM, width: 150, canGrow: true},
      {label: COLUMNS.SPENT_SUM, width: 150, canGrow: true},
    ]
  }, [PAGE_CONST])

  return (
    <PageWrapper>
      <Pane flex={1}>
        <Table
          columns={columns}
          rows={loadedItems.items}
          hasNextPage={loadedItems.hasNextPage}
          isItemLoaded={isItemLoaded}
          loadMoreItems={loadMoreItems}
        />
      </Pane>
    </PageWrapper>
  )
}

export default withErrorBoundary(Stats)
