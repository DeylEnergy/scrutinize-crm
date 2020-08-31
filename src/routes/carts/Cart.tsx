import React from 'react'
import styled from 'styled-components'
import {useTasksAfterUpdate} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {PUT_SALE} from '../../constants/events'
import Table from '../../components/Table'
import CellCheckbox from '../../components/CellCheckbox'
import EditableCellInput from '../../components/EditableCellInput'
import AddProduct from './AddProduct'
import GlobalContext from '../../contexts/globalContext'
import {withErrorBoundary} from '../../utilities'

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
  {label: 'Product Id', width: 270},
  {label: 'Note', width: 202},
]

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

  const [editCell, setEditCell] = React.useState<any>(null)

  const [addTask] = useTasksAfterUpdate([], [loadedItems.items])

  React.useEffect(() => {
    // fetch computation of buy list
    fetchComputedCartSum()
  }, [worker])

  const serializeItem = React.useCallback(
    (item: any) => {
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

        worker
          .sendEvent({
            type: PUT_SALE,
            payload: updatedItem,
            consumer: 'client',
          })
          .then((result: any) => {
            const items = itemsRef.current
            const foundIndex = items.findIndex((x: any) => x.id === item.id)

            items[foundIndex] = serializeItem({
              ...result,
              _product: updatedItem._product,
            })

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
            onUpdate={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateItem({isDone: e.target.checked})
            }}
            disabled={item.isFrozen}
          />
        ),
      }

      const inStockTooltip = item._productId && (
        <>
          <b>In stock:</b> {item._product.inStockCount}
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
        value: salePrice,
        onDoubleClick: handleCellDblClick.bind(
          null,
          'salePrice',
          salePrice,
          'number',
        ),
        tooltipContent: item._productId && (
          <>
            <b>Real price:</b> {item._product.realPrice}
          </>
        ),
      }

      const count = item.count
      const countCell = {
        value: count,
        onDoubleClick: handleCellDblClick.bind(null, 'count', count, 'number'),
      }

      const sumCell = {
        value: item.sum,
        tooltipContent: item._productId && (
          <>
            <b>Income:</b> {item.income}
          </>
        ),
      }

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
          '',
        ],
      }
    },
    [addTask],
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
        storeName: SN.SALES,
        indexName: IN.__CART_ID__,
        direction: 'prev',
        matchProperties: {__cartId__: cartId},
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
  }, [loadedItems.items])

  const refetchAll = () => {
    fetchAcquisitions()
    fetchComputedCartSum()
  }

  const handleSelectedProduct = React.useCallback(
    (item: any) => {
      const productToAdd = {
        __cartId__: cartId,
        count: 1,
        _productId: item.value,
      }

      worker
        .sendEvent({
          type: PUT_SALE,
          payload: productToAdd,
          consumer: 'client',
        })
        .then(refetchAll)
    },
    [itemsRef],
  )

  return (
    <Wrapper>
      <Control>
        <AddProduct handleSelectedProduct={handleSelectedProduct} />
      </Control>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={fetchAcquisitions}
      />
      <EditableCellInput anchor={editCell} />
    </Wrapper>
  )
}

export default withErrorBoundary(Cart)