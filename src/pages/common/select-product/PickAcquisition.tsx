import React from 'react'
import {ArrowLeftIcon, Button, Pane} from 'evergreen-ui'
import {
  useLocale,
  useDatabase,
  getLocaleTimeString,
  clipLongId,
  getTestId,
  withErrorBoundary,
} from '../../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import Table from '../../../components/Table'
import {PageWrapper} from '../../../layouts'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const RETURN_BACK_BUTTON_STYLE = {
  boxShadow: 'none',
  justifyContent: 'center',
  background: '#f5f2f2',
  border: 'none',
  borderRadius: 0,
}

const CELL_STYLE = {
  cursor: 'pointer',
}

function PickAcquisition({
  productId,
  handleAcquisitionSelect,
  handleReturnBack,
}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.COMMON.PICK_ACQUISITION
  const {TABLE} = PAGE_CONST

  const db = useDatabase()

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    LOADED_ITEMS_DEFAULT,
  )

  const serializeItem = React.useCallback(
    (item: any) => {
      const acquisitionShortId = clipLongId(item.id)

      const acquisitionShortIdCell = {
        value: acquisitionShortId,
        testId: `acquisition-short-id-cell_${acquisitionShortId}`,
      }

      const dateTime = getLocaleTimeString(item.datetime[0], STRING_FORMAT)
      const acquisitionDateCell = {
        value: dateTime && `${dateTime.date}`,
      }

      return {
        onClick: () => {
          handleAcquisitionSelect({
            acquisitionId: item.id,
            productId: item._productId,
          })
        },
        id: item.id,
        cells: [acquisitionShortIdCell, item.inStockCount, acquisitionDateCell],
        style: CELL_STYLE,
      }
    },
    [STRING_FORMAT, handleAcquisitionSelect],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchAcquisitions = React.useCallback(() => {
    db.getRows({
      storeName: SN.ACQUISITIONS,
      indexName: IN.DATETIME,
      direction: 'prev',
      limit: FETCH_ITEM_LIMIT,
      lastKey: loadedItems.lastKey,
      filterBy: 'productId',
      filterParams: {productId},
    }).then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)

      const updatedLoadedItems = {
        ...loadedItems,
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...loadedItems.items, ...newItemsSerialized],
        lastKey: newItems.length && newItems[newItems.length - 1].datetime,
      }

      setLoadedItems(updatedLoadedItems)
    })
  }, [db, loadedItems, productId, serializeItem])

  const columns = React.useMemo(() => {
    const {COLUMNS} = TABLE
    return [
      {width: COLUMNS.ACQUISITION_ID.WIDTH, canGrow: true},
      {width: COLUMNS.IN_STOCK.WIDTH},
      {width: COLUMNS.DATE.WIDTH},
    ]
  }, [TABLE])

  return (
    <PageWrapper>
      <Button
        onClick={handleReturnBack}
        iconBefore={ArrowLeftIcon}
        style={RETURN_BACK_BUTTON_STYLE}
        {...getTestId('return-back-btn')}
      >
        {PAGE_CONST.RETURN_BACK_BUTTON.TITLE}
      </Button>
      <Pane flexGrow={1}>
        <Table
          columns={columns}
          rows={loadedItems.items}
          rowHeight={32}
          isHeaderShown={false}
          hasNextPage={loadedItems.hasNextPage}
          isItemLoaded={isItemLoaded}
          loadMoreItems={fetchAcquisitions}
          isRowNumberShown={false}
        />
      </Pane>
    </PageWrapper>
  )
}

export default withErrorBoundary(PickAcquisition)
