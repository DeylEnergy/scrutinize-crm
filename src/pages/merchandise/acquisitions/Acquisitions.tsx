import React from 'react'
import {Menu, IconButton, MoreIcon, EditIcon, Position} from 'evergreen-ui'
import Table from '../../../components/Table'
import UpdateAcquisitionInStockCount from './UpdateAcquisitionInStockCount'
import Popover from '../../../components/Popover'
import {
  useLocale,
  useDatabase,
  useAccount,
  useCancellablePromise,
  withErrorBoundary,
} from '../../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {UPDATE_ACQUISITION_IN_STOCK_COUNT} from '../../../constants/events'
import RIGHTS from '../../../constants/rights'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const SIDE_SHEET_DEFAULT = {
  value: null,
  isShown: false,
}

function Acquisitions() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.ACQUISITIONS
  const db = useDatabase()

  const [{permissions}] = useAccount()

  const makeCancellablePromise = useCancellablePromise()

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const itemsRef = React.useRef<any>(null)

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
    (item: any) => {
      const editSideSheet = () => {
        setSideSheet({
          value: {id: item.id, inStockCount: item.inStockCount},
          isShown: true,
        })
      }

      const nameModel =
        item?._product?.nameModel || item?._legacyProductNameModel

      const priceCell = Number(item.price).toLocaleString(STRING_FORMAT)

      const sumCell = Number(item.sum).toLocaleString(STRING_FORMAT)

      const aqIdCell = item.id.split('-')[0]

      return {
        id: item.id,
        cells: [
          new Date(item.datetime).toLocaleDateString(STRING_FORMAT),
          nameModel[0],
          nameModel[1],
          priceCell,
          item.count,
          sumCell,
          item._supplier?.name,
          item._user?.name,
          item?._productId?.split('-')[0],
          aqIdCell,
        ],
        optionsMenu: permissions.includes(
          RIGHTS.CAN_EDIT_ACQUISITION_IN_STOCK_COUNT,
        ) && (
          <Popover
            content={
              <Menu>
                <Menu.Group>
                  <Menu.Item onSelect={editSideSheet} icon={EditIcon}>
                    {PAGE_CONST.TABLE.OPTIONS.EDIT_IN_STOCK_COUNT}
                  </Menu.Item>
                </Menu.Group>
              </Menu>
            }
            position={Position.BOTTOM_RIGHT}
          >
            <IconButton icon={MoreIcon} height={24} appearance="minimal" />
          </Popover>
        ),
      }
    },
    [STRING_FORMAT, PAGE_CONST, permissions],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || Boolean(loadedItems.items[index])
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const loadMoreItems = React.useCallback(() => {
    const queryFetch = makeCancellablePromise(
      db.getRows({
        storeName: SN.ACQUISITIONS,
        indexName: IN.DATETIME,
        direction: 'prev',
        limit: FETCH_ITEM_LIMIT,
        lastKey: loadedItems.lastKey,
      }),
    )

    queryFetch.then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)
      setLoadedItems({
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...loadedItems.items, ...newItemsSerialized],
        lastKey: newItems.length && newItems[newItems.length - 1].datetime,
      })
    })
  }, [
    makeCancellablePromise,
    db,
    loadedItems.items,
    loadedItems.lastKey,
    serializeItem,
  ])

  const handleAcquisitionInStockCountUpdate = React.useCallback(
    updatedAcquisition => {
      db.sendEvent({
        type: UPDATE_ACQUISITION_IN_STOCK_COUNT,
        payload: updatedAcquisition,
        consumer: 'client',
      }).then((result: any) => {
        if (!result) {
          return
        }

        const {acquisition} = result

        const items = itemsRef.current

        const foundIndex = items.findIndex((x: any) => x.id === acquisition.id)
        items[foundIndex] = serializeItem(acquisition)

        setLoadedItems({items: [...items]})
        setTimeout(() => setSideSheet({isShown: false}))
      })
    },
    [db, serializeItem],
  )

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE

    const tableColumns = [
      {label: COLUMNS.DATE.TITLE, width: COLUMNS.DATE.WIDTH},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH, canGrow: true},
      {label: COLUMNS.PRICE.TITLE, width: COLUMNS.PRICE.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: COLUMNS.COUNT.WIDTH},
      {label: COLUMNS.SUM.TITLE, width: COLUMNS.SUM.WIDTH},
      {label: COLUMNS.SUPPLIER.TITLE, width: COLUMNS.SUPPLIER.WIDTH},
      {label: COLUMNS.EXECUTOR.TITLE, width: COLUMNS.EXECUTOR.WIDTH},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
      {
        label: COLUMNS.ACQUISITION_ID.TITLE,
        width: COLUMNS.ACQUISITION_ID.WIDTH,
      },
    ]

    if (permissions.includes(RIGHTS.CAN_EDIT_ACQUISITION_IN_STOCK_COUNT)) {
      tableColumns.push({label: 'OPTIONS', width: 50})
    }

    return tableColumns
  }, [PAGE_CONST, permissions])

  return (
    <>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
      />
      {sideSheet.value && (
        <UpdateAcquisitionInStockCount
          sideSheet={sideSheet}
          handleAcquisitionInStockCountUpdate={
            handleAcquisitionInStockCountUpdate
          }
          onCloseComplete={handleSlideSheetCloseComplete}
        />
      )}
    </>
  )
}

export default withErrorBoundary(Acquisitions)
