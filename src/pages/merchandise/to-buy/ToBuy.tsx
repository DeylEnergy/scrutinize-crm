import React from 'react'
import {v4 as uuidv4} from 'uuid'
import {
  useTasksAfterUpdate,
  useLocalStorage,
  useUpdate,
} from '../../../utilities'
import {Button} from 'evergreen-ui'
import {TO_BUY_FILTER_OPTIONS as FILTER_OPTIONS} from '../../../constants'
import RIGHTS from '../../../constants/rights'
import {PUT_ACQUISITION} from '../../../constants/events'
import Table from '../../../components/Table'
import CellCheckbox from '../../../components/CellCheckbox'
import EditableCellInput from '../../../components/EditableCellInput'
import AsyncSelectMenu from '../../../components/AsyncSelectMenu'
import {PageWrapper, ControlWrapper} from '../../../layouts'
import FundPanel from './FundPanel'
import AddProduct from './AddProduct'
import Filters from './Filters'
import Options from './Options'
import UpdateProduct from '../products/UpdateProduct'
import {
  useLocale,
  useAccount,
  useDatabase,
  withErrorBoundary,
} from '../../../utilities'

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const SIDE_SHEET_DEFAULT = {
  value: null,
  isShown: false,
}

const SELECT_MENU_STYLE = {
  maxWidth: '100%',
  whiteSpace: 'nowrap' as 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
}

function ToBuy() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.TO_BUY_LIST
  const {TABLE} = PAGE_CONST
  const [{permissions}] = useAccount()
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

  const [filterBy, setFilterBy] = useLocalStorage(
    'TO_BUY_FILTERS',
    FILTER_OPTIONS.ACTIVE,
  )

  const [editCell, setEditCell] = React.useState<any>(null)

  const [computedBuyList, setComputedBuyList] = React.useState<any>(null)

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const gridOuterRef = React.useRef<any>()

  const [addTask] = useTasksAfterUpdate([], [loadedItems.items])

  const fetchComputedOfToBuyList = React.useCallback(() => {
    db.perform({storeName: 'acquisitions', action: 'computeBuyList'}).then(
      setComputedBuyList,
    )
  }, [db])

  React.useEffect(() => {
    // fetch computation of buy list
    fetchComputedOfToBuyList()
  }, [db])

  const serializeItem = React.useCallback(
    (item: any) => {
      function updateItem(cellUpdate: any) {
        const updatedItem = {...item, ...cellUpdate}

        const key = Object.keys(cellUpdate)[0]

        if (
          key === 'price' ||
          key === 'count' ||
          key === 'lowestBoundCount' ||
          key === 'toPrintStickersCount'
        ) {
          updatedItem[key] = Number(updatedItem[key])
        }

        // in case nothing changed
        if (item[key] === cellUpdate[key]) {
          return setEditCell(null)
        }

        db.sendEvent({
          type: PUT_ACQUISITION,
          payload: updatedItem,
          consumer: 'client',
        }).then((result: any) => {
          const items = itemsRef.current
          const foundIndex = items.findIndex((x: any) => x.id === item.id)
          if (result.isFrozen && filterBy !== FILTER_OPTIONS.FROZEN) {
            items.splice(foundIndex, 1)
          } else if (!result.isFrozen && filterBy === FILTER_OPTIONS.FROZEN) {
            items.splice(foundIndex, 1)
          } else if (result.isDone && filterBy === FILTER_OPTIONS.HAVE_TO_BUY) {
            items.splice(foundIndex, 1)
          } else if (!result.isDone && filterBy === FILTER_OPTIONS.BOUGHT) {
            items.splice(foundIndex, 1)
          } else {
            items[foundIndex] = serializeItem({
              ...result,
              _product: updatedItem._product,
            })
          }

          const updatedItems = {items: [...items]}

          addTask(() => setEditCell(null))

          // schedule update for footer computed values
          if (key === 'price' || key === 'count' || key === 'isDone') {
            addTask(fetchComputedOfToBuyList)
          }

          setLoadedItems(updatedItems)
        })
      }

      const canEditCells =
        permissions.includes(RIGHTS.CAN_EDIT_ITEMS_IN_TO_BUY_LIST) || null

      const handleCellDblClick = (
        cellName: string,
        value: string,
        valueType: string,
        e: React.MouseEvent,
      ) => {
        if (!canEditCells) {
          return
        }

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

      const handleSupplierPick = (item: any) => {
        const _supplierId: number = item.value
        if (_supplierId !== item._supplierId) {
          updateItem({_supplierId})
        }
      }

      const handleExecutorPick = (item: any) => {
        const _userId: number = item.value
        if (_userId !== item._userId) {
          updateItem({_userId})
        }
      }

      const {CELLS, TOOLTIP} = TABLE

      const doneCell = {
        value: (
          <CellCheckbox
            initState={item.isDone}
            onUpdate={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateItem({isDone: e.target.checked})
            }}
            disabled={item.isFrozen || !canEditCells}
          />
        ),
      }

      const name = item.name || item._product.nameModel[0]
      const nameCell = {
        value: name,
        onDoubleClick: handleCellDblClick.bind(null, 'name', name, 'string'),
        tooltipContent: item.name && item._productId && (
          <>
            <b>{TOOLTIP.NAME_BEFORE}:</b> {item._product.nameModel[0]}
          </>
        ),
      }

      const model = item.model || item._product.nameModel[1]
      const modelCell = {
        value: model,
        onDoubleClick: handleCellDblClick.bind(null, 'model', model, 'string'),
        tooltipContent: item.model && item._productId && (
          <>
            <b>{TOOLTIP.MODEL_BEFORE}:</b> {item._product.nameModel[1]}
          </>
        ),
      }

      const price = item.price
      const priceCell = {
        value: Number(price).toLocaleString(STRING_FORMAT),
        onDoubleClick: handleCellDblClick.bind(null, 'price', price, 'number'),
        tooltipContent: item._productId && (
          <>
            <b>{TOOLTIP.PREVIOUS_PRICE}:</b>{' '}
            {Number(item._product.realPrice).toLocaleString(STRING_FORMAT)}
          </>
        ),
      }

      const count = item.count
      const countCell = {
        value: count,
        onDoubleClick: handleCellDblClick.bind(null, 'count', count, 'number'),
        tooltipContent: item._productId && (
          <>
            <b>{TOOLTIP.IN_STOCK}:</b> {item._product.inStockCount}
          </>
        ),
      }

      const sumCell = Number(item.sum).toLocaleString(STRING_FORMAT)

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
      }

      const lowestBoundCount =
        item.lowestBoundCount ||
        (item._productId && item._product.lowestBoundCount)
      const lowestBoundCountCell = {
        value: lowestBoundCount,
        onDoubleClick: handleCellDblClick.bind(
          null,
          'lowestBoundCount',
          lowestBoundCount,
          'number',
        ),
      }

      const toPrintStickersCount = item.toPrintStickersCount
      const toPrintStickersCountCell = {
        value: toPrintStickersCount,
        onDoubleClick: handleCellDblClick.bind(
          null,
          'toPrintStickersCount',
          toPrintStickersCount,
          'number',
        ),
      }

      const supplierCell = {
        value: (
          <AsyncSelectMenu
            selected={
              item._supplier
                ? {value: item._supplierId, label: item._supplier.name}
                : {value: null, label: null}
            }
            title={CELLS.SUPPLIER.POPOVER_TITLE}
            onSelect={handleSupplierPick}
            storeName="suppliers"
          >
            <Button style={SELECT_MENU_STYLE} disabled={!canEditCells}>
              {item._supplier
                ? item._supplier.name
                : CELLS.SUPPLIER.BUTTON_TITLE}
            </Button>
          </AsyncSelectMenu>
        ),

        style: {paddingTop: 4},
      }

      const executorCell = {
        value: (
          <AsyncSelectMenu
            selected={
              item._supplier
                ? {value: item._supplierId, label: item._supplier.name}
                : {value: null, label: null}
            }
            title={CELLS.EXECUTOR.POPOVER_TITLE}
            onSelect={handleExecutorPick}
            storeName="users"
          >
            <Button style={SELECT_MENU_STYLE} disabled={!canEditCells}>
              {item._user ? item._user.name : CELLS.EXECUTOR.BUTTON_TITLE}
            </Button>
          </AsyncSelectMenu>
        ),
        style: {paddingTop: 4},
      }

      const frozenCell = {
        value: (
          <CellCheckbox
            disabled={!canEditCells}
            initState={item.isFrozen}
            onUpdate={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateItem({isFrozen: e.target.checked})
            }
          />
        ),
      }

      return {
        id: item.id,
        cells: [
          doneCell,
          nameCell,
          modelCell,
          priceCell,
          countCell,
          sumCell,
          salePriceCell,
          lowestBoundCountCell,
          toPrintStickersCountCell,
          supplierCell,
          executorCell,
          frozenCell,
          new Date(item.neededSinceDatetime).toLocaleDateString(STRING_FORMAT),
          item._productId?.split('-')[0] || '-',
        ],
      }
    },
    [filterBy, TABLE, STRING_FORMAT],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchAcquisitions = React.useCallback(() => {
    db.getRows({
      storeName: 'acquisitions',
      indexName: 'neededSinceDatetime',
      direction: 'prev',
      sort: 'asc',
      filterBy,
    }).then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)

      const updatedLoadedItems = {
        ...loadedItems,
        hasNextPage: false,
        items: newItemsSerialized,
      }

      setLoadedItems(updatedLoadedItems)
    })
  }, [loadedItems.items, filterBy])

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const handleNewProductDrawer = React.useCallback(searchValue => {
    setSideSheet({
      value: {name: searchValue},
      isShown: true,
    })
  }, [])

  const handleSelectedProduct = React.useCallback(
    (item: any) => {
      const productToAdd = {
        neededSinceDatetime: Date.now(),
        _productId: item.value,
      }
      db.sendEvent({
        type: PUT_ACQUISITION,
        payload: productToAdd,
        consumer: 'client',
      }).then((product: any) => {
        const items = itemsRef.current
        const serializedProduct = serializeItem(product)
        setLoadedItems({items: [serializedProduct, ...items]})
        fetchComputedOfToBuyList()
      })
    },
    [itemsRef],
  )

  const handleNewProduct = React.useCallback(
    input => {
      const updatedRow = {
        neededSinceDatetime: Date.now(),
        futureProductId: uuidv4(),
        _productId: null,
        _supplierId: null,
        ...input,
      }

      db.sendEvent({
        type: PUT_ACQUISITION,
        payload: updatedRow,
        consumer: 'client',
      }).then((result: any) => {
        const items = itemsRef.current
        const newProduct = serializeItem(result)
        setLoadedItems({items: [newProduct, ...items]})
        fetchComputedOfToBuyList()
        requestAnimationFrame(() => {
          setSideSheet({isShown: false})
        })
      })
    },
    [db],
  )

  const handleFilterChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterBy(e.target.value)
    },
    [setFilterBy],
  )

  useUpdate(() => {
    fetchAcquisitions()
  }, [filterBy])

  const refetchAll = () => {
    fetchAcquisitions()
    fetchComputedOfToBuyList()
  }

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE

    return [
      {label: COLUMNS.DONE.TITLE, width: COLUMNS.DONE.WIDTH},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH},
      {label: COLUMNS.PRICE.TITLE, width: COLUMNS.PRICE.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: COLUMNS.COUNT.WIDTH},
      {label: COLUMNS.SUM.TITLE, width: COLUMNS.SUM.WIDTH},
      {label: COLUMNS.SALE_PRICE.TITLE, width: COLUMNS.SALE_PRICE.WIDTH},
      {label: COLUMNS.LOWEST_BOUND.TITLE, width: COLUMNS.LOWEST_BOUND.WIDTH},
      {label: COLUMNS.STICKERS.TITLE, width: COLUMNS.STICKERS.WIDTH},
      {label: COLUMNS.SUPPLIER.TITLE, width: COLUMNS.SUPPLIER.WIDTH},
      {label: COLUMNS.EXECUTOR.TITLE, width: COLUMNS.EXECUTOR.WIDTH},
      {label: COLUMNS.FROZEN.TITLE, width: COLUMNS.FROZEN.WIDTH},
      {label: COLUMNS.DATE.TITLE, width: COLUMNS.DATE.WIDTH},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
    ]
  }, [])

  const hasBoughtItems = computedBuyList?.spent > 0

  return (
    <PageWrapper>
      <ControlWrapper>
        {computedBuyList && (
          <FundPanel
            computedBuyList={computedBuyList}
            fetchComputedOfToBuyList={fetchComputedOfToBuyList}
          />
        )}
        {permissions.includes(RIGHTS.CAN_ADD_ITEM_TO_BUY_LIST) && (
          <AddProduct
            handleSelectedProduct={handleSelectedProduct}
            handleNewProductDrawer={handleNewProductDrawer}
          />
        )}
        <Filters value={filterBy} handleFilterChange={handleFilterChange} />
        {(permissions.includes(RIGHTS.CAN_PRINT_TO_BUY_LIST) ||
          permissions.includes(RIGHTS.CAN_COMPLETE_TO_BUY_LIST)) && (
          <Options refetchAll={refetchAll} hasBoughtItems={hasBoughtItems} />
        )}
      </ControlWrapper>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={fetchAcquisitions}
        gridOuterRef={gridOuterRef}
      />
      <EditableCellInput
        anchor={editCell}
        gridOuterRef={gridOuterRef.current}
      />
      {sideSheet.value && (
        <UpdateProduct
          items={loadedItems.items}
          setLoadedItems={setLoadedItems}
          serializeItem={serializeItem}
          sideSheet={sideSheet}
          setSideSheet={setSideSheet}
          onSave={handleNewProduct}
          onCloseComplete={handleSlideSheetCloseComplete}
        />
      )}
    </PageWrapper>
  )
}

export default withErrorBoundary(ToBuy)
