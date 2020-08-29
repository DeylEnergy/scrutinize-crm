import React from 'react'
import styled from 'styled-components'
import {
  useTasksAfterUpdate,
  useLocalStorage,
  useUpdate,
} from '../../../utilities'
import {Button} from 'evergreen-ui'
import {TO_BUY_FILTER_OPTIONS as FILTER_OPTIONS} from '../../../constants'
import {PUT_ACQUISITION} from '../../../constants/events'
import Table from '../../../components/Table'
import CellCheckbox from '../../../components/CellCheckbox'
import EditableCellInput from '../../../components/EditableCellInput'
import AsyncSelectMenu from '../../../components/AsyncSelectMenu'
import FundPanel from './FundPanel'
import AddProduct from './AddProduct'
import Filters from './Filters'
import Options from './Options'
import UpdateProduct from '../products/UpdateProduct'
import GlobalContext from '../../../contexts/globalContext'
import {withErrorBoundary} from '../../../utilities'

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  position: relative;
`

const Control = styled.div`
  position: absolute;
  top: -30px;
  right: 0;
  display: flex;
`

const columns = [
  {label: 'Done', width: 50},
  {label: 'Name', width: 150},
  {label: 'Model', width: 170},
  {label: 'Price', width: 120},
  {label: 'Count', width: 70},
  {label: 'Sum', width: 90},
  {label: 'Sale Price', width: 100},
  {label: 'Lowest Bound', width: 120},
  {label: 'Stickers', width: 100},
  {label: 'Supplier', width: 150},
  {label: 'Executor', width: 150},
  {label: 'Frozen', width: 65},
  {label: 'Date', width: 190},
  {label: 'Product Id', width: 270},
]

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
  const {worker} = React.useContext(GlobalContext)
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

  const [computedBuyList, setComputedBuyList] = React.useState<any>({})

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const [addTask] = useTasksAfterUpdate([], [loadedItems.items])

  const fetchComputedOfToBuyList = React.useCallback(() => {
    worker
      .perform({storeName: 'acquisitions', action: 'computeBuyList'})
      .then(setComputedBuyList)
  }, [worker])

  React.useEffect(() => {
    // fetch computation of buy list
    fetchComputedOfToBuyList()
  }, [worker])

  const serializeItem = React.useCallback(
    (item: any) => {
      function updateItem(cellUpdate: any) {
        const updatedItem = {...item, ...cellUpdate}

        const key = Object.keys(cellUpdate)[0]

        if (key === 'price' || key === 'count' || key === 'lowestBoundCount') {
          updatedItem[key] = Number(updatedItem[key])
        }

        // in case nothing changed
        if (item[key] === cellUpdate[key]) {
          return setEditCell(null)
        }

        worker
          .sendEvent({
            type: PUT_ACQUISITION,
            payload: updatedItem,
            consumer: 'client',
          })
          .then((result: any) => {
            const items = itemsRef.current
            const foundIndex = items.findIndex((x: any) => x.id === item.id)
            if (result.isFrozen && filterBy !== FILTER_OPTIONS.FROZEN) {
              items.splice(foundIndex, 1)
            } else if (!result.isFrozen && filterBy === FILTER_OPTIONS.FROZEN) {
              items.splice(foundIndex, 1)
            } else if (
              result.isDone &&
              filterBy === FILTER_OPTIONS.HAVE_TO_BUY
            ) {
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

      const doneCell = {
        value: (
          <CellCheckbox
            initState={item.isDone}
            onUpdate={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateItem({isDone: e.target.checked})
            }}
            disabled={item.isFrozen}
          />
        ),
      }

      const name = item.name || item._product.nameModel[0]
      const nameCell = {
        value: name,
        onDoubleClick: handleCellDblClick.bind(null, 'name', name, 'string'),
        tooltipContent: item.name && item._productId && (
          <>
            <b>Before:</b> {item._product.nameModel[0]}
          </>
        ),
      }

      const model = item.model || item._product.nameModel[1]
      const modelCell = {
        value: model,
        onDoubleClick: handleCellDblClick.bind(null, 'model', model, 'string'),
        tooltipContent: item.model && item._productId && (
          <>
            <b>Before:</b> {item._product.nameModel[1]}
          </>
        ),
      }

      const price = item.price
      const priceCell = {
        value: price,
        onDoubleClick: handleCellDblClick.bind(null, 'price', price, 'number'),
        tooltipContent: item._productId && (
          <>
            <b>Previous price:</b> {item._product.realPrice}
          </>
        ),
      }

      const count = item.count
      const countCell = {
        value: count,
        onDoubleClick: handleCellDblClick.bind(null, 'count', count, 'number'),
        tooltipContent: item._productId && (
          <>
            <b>In stock:</b> {item._product.inStockCount}
          </>
        ),
      }

      const salePrice =
        item.salePrice || (item._productId && item._product.salePrice)
      const salePriceCell = {
        value: salePrice,
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
            title="Select Supplier"
            onSelect={handleSupplierPick}
            storeName="suppliers"
          >
            <Button style={SELECT_MENU_STYLE}>
              {item._supplier ? item._supplier.name : 'Select supplier..'}
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
            title="Select Executor"
            onSelect={handleExecutorPick}
            storeName="users"
          >
            <Button style={SELECT_MENU_STYLE}>
              {item._user ? item._user.name : 'Select executor...'}
            </Button>
          </AsyncSelectMenu>
        ),
        style: {paddingTop: 4},
      }

      const frozenCell = {
        value: (
          <CellCheckbox
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
          item.sum,
          salePriceCell,
          lowestBoundCountCell,
          toPrintStickersCountCell,
          supplierCell,
          executorCell,
          frozenCell,
          // new Date(item.neededSinceDatetime).toLocaleDateString(),
          item.neededSinceDatetime,
          item._productId,
        ],
      }
    },
    [filterBy],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchAcquisitions = React.useCallback(() => {
    worker
      .getRows({
        storeName: 'acquisitions',
        indexName: 'neededSinceDatetime',
        direction: 'prev',
        filterBy,
      })
      .then((newItems: any) => {
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
      worker
        .sendEvent({
          type: PUT_ACQUISITION,
          payload: productToAdd,
          consumer: 'client',
        })
        .then((product: any) => {
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
        _productId: null,
        _supplierId: null,
        ...input,
      }

      worker
        .sendEvent({
          type: PUT_ACQUISITION,
          payload: updatedRow,
          consumer: 'client',
        })
        .then((result: any) => {
          const items = itemsRef.current
          const newProduct = serializeItem(result)
          setLoadedItems({items: [newProduct, ...items]})
          fetchComputedOfToBuyList()
          requestAnimationFrame(() => {
            setSideSheet({isShown: false})
          })
        })
    },
    [worker],
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

  const hasBoughtItems = computedBuyList.spent > 0

  return (
    <Wrapper>
      <Control>
        <FundPanel
          computedBuyList={computedBuyList}
          fetchComputedOfToBuyList={fetchComputedOfToBuyList}
        />
        <AddProduct
          handleSelectedProduct={handleSelectedProduct}
          handleNewProductDrawer={handleNewProductDrawer}
        />
        <Filters value={filterBy} handleFilterChange={handleFilterChange} />
        <Options refetchAll={refetchAll} hasBoughtItems={hasBoughtItems} />
      </Control>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={fetchAcquisitions}
      />
      <EditableCellInput anchor={editCell} />
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
    </Wrapper>
  )
}

export default withErrorBoundary(ToBuy)
