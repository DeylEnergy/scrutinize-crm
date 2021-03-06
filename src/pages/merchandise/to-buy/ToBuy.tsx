import React from 'react'
import {v4 as uuidv4} from 'uuid'
import {
  useTasksAfterUpdate,
  useLocalStorage,
  useUpdate,
  clipLongId,
} from '../../../utilities'
import {
  Button,
  Menu,
  Position,
  IconButton,
  MoreIcon,
  TrashIcon,
  SnowflakeIcon,
} from 'evergreen-ui'
import {TO_BUY_FILTER_OPTIONS as FILTER_OPTIONS} from '../../../constants'
import RIGHTS from '../../../constants/rights'
import {PUT_ACQUISITION, DELETE_TO_BUY_ITEM} from '../../../constants/events'
import Table from '../../../components/Table'
import CellCheckbox from '../../../components/CellCheckbox'
import EditableCellInput from '../../../components/EditableCellInput'
import AsyncSelectMenu from '../../../components/AsyncSelectMenu'
import Popover from '../../../components/Popover'
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
  useCancellablePromise,
  getTestId,
  withErrorBoundary,
} from '../../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'

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

const CELL_TEST_ID_PREFIX = 'to-buy-item'

function ToBuy() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.TO_BUY_LIST
  const {TABLE} = PAGE_CONST
  const [{permissions}] = useAccount()
  const db = useDatabase()

  const makeCancellablePromise = useCancellablePromise()

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
    const performedFetch = makeCancellablePromise(
      db.perform({storeName: SN.ACQUISITIONS, action: 'computeBuyList'}),
    )

    performedFetch.then(setComputedBuyList)
  }, [makeCancellablePromise, db])

  React.useEffect(() => {
    // fetch computation of buy list
    fetchComputedOfToBuyList()
  }, [db, fetchComputedOfToBuyList])

  const handleItemDelete = React.useCallback(
    (aqId: string) => {
      db.sendEvent({type: DELETE_TO_BUY_ITEM, payload: {id: aqId}}).then(
        (result: any) => {
          if (!result) {
            return
          }

          setLoadedItems({
            items: itemsRef.current.filter((x: any) => x.id !== aqId),
          })
        },
      )
    },
    [db],
  )

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

      const shortProductId = clipLongId(
        item._productId ?? `new_${item.futureProductId}`,
      )

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
        testId: `${CELL_TEST_ID_PREFIX}-checkbox_${shortProductId}`,
      }

      const nameModel =
        item?._product?.nameModel || item?._legacyProductNameModel

      const name = item.name || nameModel[0]
      const nameCell = {
        value: name,
        onDoubleClick: handleCellDblClick.bind(null, 'name', name, 'string'),
        tooltipContent: item.name && item._productId && (
          <>
            <b>{TOOLTIP.NAME_BEFORE}:</b> {item._product.nameModel[0]}
          </>
        ),
        testId: `${CELL_TEST_ID_PREFIX}-name_${shortProductId}`,
      }

      const model = item.model || nameModel[1]
      const modelCell = {
        value: model,
        onDoubleClick: handleCellDblClick.bind(null, 'model', model, 'string'),
        tooltipContent: item.model && item._productId && (
          <>
            <b>{TOOLTIP.MODEL_BEFORE}:</b> {item._product.nameModel[1]}
          </>
        ),
        testId: `${CELL_TEST_ID_PREFIX}-model_${shortProductId}`,
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
        testId: `${CELL_TEST_ID_PREFIX}-price_${shortProductId}`,
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
        testId: `${CELL_TEST_ID_PREFIX}-count_${shortProductId}`,
      }

      const sumCell = {
        value: Number(item.sum).toLocaleString(STRING_FORMAT),
        testId: `${CELL_TEST_ID_PREFIX}-sum_${shortProductId}`,
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
            selected={item._supplierId}
            title={CELLS.SUPPLIER.POPOVER_TITLE}
            onSelect={handleSupplierPick}
            storeName="suppliers"
          >
            <Button
              style={SELECT_MENU_STYLE}
              disabled={!canEditCells}
              {...getTestId(
                `${CELL_TEST_ID_PREFIX}-select-supplier_${shortProductId}`,
              )}
            >
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
            selected={item._userId}
            title={CELLS.EXECUTOR.POPOVER_TITLE}
            onSelect={handleExecutorPick}
            storeName="users"
          >
            <Button
              style={SELECT_MENU_STYLE}
              disabled={!canEditCells}
              {...getTestId(
                `${CELL_TEST_ID_PREFIX}-select-executor_${shortProductId}`,
              )}
            >
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

      const toggleFrozen = () => {
        updateItem({isFrozen: !item.isFrozen})
      }

      const shortProductIdCell = item._productId ? shortProductId : '-'

      const optionsMenu = (
        <Popover
          content={({close}: any) => (
            <Menu>
              <Menu.Group>
                {!item.isFrozen && item._productId && (
                  <Menu.Item
                    onSelect={() => {
                      close()
                      toggleFrozen()
                    }}
                    icon={SnowflakeIcon}
                  >
                    {TABLE.OPTIONS.FREEZE}
                  </Menu.Item>
                )}
                {item.isFrozen && (
                  <Menu.Item
                    onSelect={() => {
                      close()
                      toggleFrozen()
                    }}
                    icon={SnowflakeIcon}
                  >
                    {TABLE.OPTIONS.UNFREEZE}
                  </Menu.Item>
                )}
                {!item._productId && (
                  <Menu.Item
                    onSelect={() => {
                      close()
                      handleItemDelete(item.id)
                    }}
                    icon={TrashIcon}
                    intent="danger"
                  >
                    {TABLE.OPTIONS.REMOVE}
                  </Menu.Item>
                )}
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
          shortProductIdCell,
        ],
        optionsMenu,
      }
    },
    [
      permissions,
      TABLE,
      STRING_FORMAT,
      db,
      filterBy,
      addTask,
      fetchComputedOfToBuyList,
      handleItemDelete,
    ],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchAcquisitions = React.useCallback(() => {
    const queryFetch = makeCancellablePromise(
      db.getRows({
        storeName: SN.ACQUISITIONS,
        indexName: IN.NEEDED_SINCE_DATETIME,
        direction: 'prev',
        sort: 'asc',
        filterBy,
      }),
    )

    queryFetch.then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)

      const updatedLoadedItems = {
        ...loadedItems,
        hasNextPage: false,
        items: newItemsSerialized,
      }

      setLoadedItems(updatedLoadedItems)
    })
  }, [makeCancellablePromise, db, filterBy, serializeItem, loadedItems])

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
    [db, fetchComputedOfToBuyList, serializeItem],
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
    [db, fetchComputedOfToBuyList, serializeItem],
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
      {label: 'OPTIONS', width: 50},
    ]
  }, [PAGE_CONST])

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
