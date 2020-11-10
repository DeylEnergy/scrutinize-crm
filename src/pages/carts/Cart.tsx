import React from 'react'
import {
  Menu,
  IconButton,
  Position,
  MoreIcon,
  EditIcon,
  toaster,
} from 'evergreen-ui'
import {
  useLocale,
  useDatabase,
  useTasksAfterUpdate,
  useScannerListener,
  withErrorBoundary,
  recognizeQRCode,
} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {PUT_SALE, DELETE_SALE_ITEM} from '../../constants/events'
import codePrefixes from '../../constants/codePrefixes'
import Table from '../../components/Table'
import CellCheckbox from '../../components/CellCheckbox'
import EditableCellInput from '../../components/EditableCellInput'
import Popover from '../../components/Popover'
import {PageWrapper, ControlWrapper} from '../../layouts'
import AddProduct from './AddProduct'

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

interface CartProps {
  cartId: string
  fetchComputedCartSum: () => void
}

function Cart({cartId, fetchComputedCartSum}: CartProps) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.CARTS
  const {TABLE} = PAGE_CONST
  const db = useDatabase()
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

  const [editCell, setEditCell] = React.useState<any>(null)

  const [addTask] = useTasksAfterUpdate([], [loadedItems.items])

  React.useEffect(() => {
    fetchComputedCartSum()
  }, [db])

  const deleteSaleItem = React.useCallback(
    (id: string) => {
      db.sendEvent({
        type: DELETE_SALE_ITEM,
        payload: {id},
      }).then(() => {
        const foundIndex = itemsRef.current.findIndex((x: any) => x.id === id)
        if (foundIndex > -1) {
          itemsRef.current.splice(foundIndex, 1)
          setLoadedItems({items: [...itemsRef.current]})
        }
      })
    },
    [db, itemsRef.current],
  )

  const serializeItem = React.useCallback(
    (item: any, indexInTable: number) => {
      function updateItem(cellUpdate: any) {
        const updatedItem = {...item, ...cellUpdate}

        const key = Object.keys(cellUpdate)[0]

        if (key === 'price' || key === 'count') {
          updatedItem[key] = Number(updatedItem[key])
        }

        // in case nothing changed
        if (item[key] === cellUpdate[key]) {
          return setEditCell(null)
        }

        db.sendEvent({
          type: PUT_SALE,
          payload: updatedItem,
          consumer: 'client',
        }).then((result: any) => {
          const items = itemsRef.current
          const foundIndex = items.findIndex((x: any) => x.id === item.id)

          items[foundIndex] = serializeItem(
            {
              ...result,
              _product: updatedItem._product,
            },
            indexInTable,
          )

          const updatedItems = {items: [...items]}
          addTask(() => setEditCell(null))
          // schedule update for footer computed values
          if (key === 'salePrice' || key === 'count') {
            addTask(fetchComputedCartSum)
          }

          setLoadedItems(updatedItems)
        })
      }

      const handleCellDblClick = (
        cellName: string,
        value: string,
        valueType: string,
        e: React.MouseEvent,
      ) => {
        const {
          top,
          left,
          height,
          width,
        } = e.currentTarget.getBoundingClientRect()

        setEditCell({
          style: {
            top,
            left,
            height,
            width,
          },
          value,
          valueType,
          updateItem,
          cellName,
        })
      }

      const doneCell = {
        value: (
          <CellCheckbox
            initState={item.isDone}
            onUpdate={() => {}}
            disabled={item.isFrozen}
          />
        ),
      }

      const inStockTooltip = item._productId && (
        <>
          <b>{TABLE.TOOLTIP.IN_STOCK}:</b> {item._product.inStockCount}
        </>
      )

      const name = item.name || item._product.nameModel[0]
      const nameCell = {
        value: name,
        tooltipContent: inStockTooltip,
      }

      const model = item.model || item._product.nameModel[1]
      const modelCell = {
        value: model,
        tooltipContent: inStockTooltip,
      }

      const salePrice =
        item.salePrice || (item._productId && item._product.salePrice)
      const salePriceCell = {
        value: Number(salePrice).toLocaleString(STRING_FORMAT),
        onDoubleClick: handleCellDblClick.bind(
          null,
          'salePrice',
          salePrice,
          'number',
        ),
        tooltipContent: item._productId && (
          <>
            <b>{TABLE.TOOLTIP.REAL_PRICE}:</b>{' '}
            {Number(item._product.realPrice).toLocaleString(STRING_FORMAT)}
          </>
        ),
      }

      const count = item.count
      const countCell = {
        value: count,
        onDoubleClick: handleCellDblClick.bind(null, 'count', count, 'number'),
      }

      const sumCell = {
        value: Number(item.sum).toLocaleString(STRING_FORMAT),
        tooltipContent: (
          <>
            <b>{TABLE.TOOLTIP.INCOME}:</b>{' '}
            {Number(item.income).toLocaleString(STRING_FORMAT)}
          </>
        ),
      }

      const noteCell = {
        value: item.note,
        onDoubleClick: handleCellDblClick.bind(
          null,
          'note',
          item.note,
          'string',
        ),
      }

      const optionsMenu = (
        <Popover
          content={({close}: any) => (
            <Menu>
              <Menu.Group>
                <Menu.Item
                  onSelect={() => {
                    close()
                    deleteSaleItem(item.id)
                  }}
                  icon={EditIcon}
                >
                  {TABLE.OPTIONS.REMOVE}
                </Menu.Item>
              </Menu.Group>
            </Menu>
          )}
          position={Position.BOTTOM_RIGHT}
        >
          <IconButton icon={MoreIcon} height={24} appearance="minimal" />
        </Popover>
      )

      return {
        id: item.id,
        cells: [
          doneCell,
          nameCell,
          modelCell,
          salePriceCell,
          countCell,
          sumCell,
          item._productId,
          noteCell,
        ],
        optionsMenu,
      }
    },
    [addTask, STRING_FORMAT],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchAcquisitions = React.useCallback(() => {
    db.getRows({
      storeName: SN.SALES,
      indexName: IN.__CART_ID__,
      direction: 'prev',
      matchProperties: {__cartId__: cartId},
      sort: 'asc',
    }).then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)

      const updatedLoadedItems = {
        ...loadedItems,
        hasNextPage: false,
        items: newItemsSerialized,
      }

      setLoadedItems(updatedLoadedItems)
    })
  }, [])

  const refetchAll = React.useCallback(() => {
    fetchAcquisitions()
    fetchComputedCartSum()
  }, [fetchAcquisitions, fetchComputedCartSum])

  const handleSelectedProduct = React.useCallback(
    (item: any) => {
      const productToAdd = {
        __cartId__: cartId,
        count: 1,
        _productId: item.value,
      }

      db.sendEvent({
        type: PUT_SALE,
        payload: productToAdd,
        consumer: 'client',
      }).then(refetchAll)
    },
    [refetchAll],
  )

  const handleNewScannedProduct = React.useCallback(
    (scanResult: any) => {
      const [prefix, data] = recognizeQRCode(scanResult?.value)
      if (prefix === codePrefixes.acquisitions) {
        db.getRow({storeName: SN.ACQUISITIONS, key: data}).then((aq: any) => {
          handleSelectedProduct({value: aq._productId})
        })
      } else {
        toaster.warning(PAGE_CONST.TOASTER.UNKNOWN_QR_CODE)
      }
    },
    [db, handleSelectedProduct],
  )

  useScannerListener({
    onChange: handleNewScannedProduct,
  })

  const columns = React.useMemo(() => {
    const {COLUMNS} = TABLE
    return [
      {label: COLUMNS.DONE.TITLE, width: COLUMNS.DONE.WIDTH},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH, canGrow: true},
      {label: COLUMNS.PRICE.TITLE, width: COLUMNS.PRICE.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: COLUMNS.COUNT.WIDTH},
      {label: COLUMNS.SUM.TITLE, width: COLUMNS.SUM.WIDTH},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
      {label: COLUMNS.NOTE.TITLE, width: COLUMNS.NOTE.WIDTH, canGrow: true},
      {label: 'OPTIONS', width: 50},
    ]
  }, [TABLE])

  return (
    <PageWrapper>
      <ControlWrapper>
        <AddProduct handleSelectedProduct={handleSelectedProduct} />
      </ControlWrapper>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={fetchAcquisitions}
      />
      <EditableCellInput anchor={editCell} />
    </PageWrapper>
  )
}

export default withErrorBoundary(Cart)
