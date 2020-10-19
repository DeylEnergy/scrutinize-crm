import React from 'react'
import {Pane} from 'evergreen-ui'
import Table from '../../components/Table'
import {STORE_NAME as SN} from '../../constants'
import {useDatabase, withErrorBoundary} from '../../utilities'
import {PageWrapper} from '../../layouts'

const columns = [
  {label: 'Period', width: 150},
  {label: 'Sold Sum', width: 150},
  {label: 'Income Sum', width: 150},
  {label: 'Spent Sum', width: 150},
]

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function Stats() {
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
