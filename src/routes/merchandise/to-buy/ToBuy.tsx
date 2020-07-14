import React from 'react'
import Table from '../../../components/Table'
import EditableCellInput from '../../../components/EditableCellInput'
import SelectMenu from '../../../components/SelectMenu'
import GlobalContext from '../../../contexts/globalContext'

const columns = [
  {label: 'Date', width: 100},
  {label: 'Name', width: 150},
  {label: 'Model', width: 170},
  {label: 'Price', width: 120},
  {label: 'Count', width: 70},
  {label: 'Sum', width: 90},
  {label: 'Lowest Bound', width: 120},
  {label: 'Supplier', width: 150},
  {label: 'Executor', width: 150},
  {label: 'Product Id', width: 250},
]

const FETCH_ITEM_LIMIT = 10000

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

function useTasksAfterUpdate(initTasks: any[], deps: any[]) {
  const tasks = React.useRef(initTasks)

  const addTask = (newTask: any) => {
    tasks.current = [...tasks.current, newTask]
  }

  React.useEffect(() => {
    const availableTasks = tasks.current
    if (availableTasks.length) {
      for (const task of availableTasks) {
        task()
      }
    }
  }, deps)

  return [addTask]
}

export default function ToBuy() {
  const {worker} = React.useContext(GlobalContext)
  const itemsRef = React.useRef<any>(null)
  const store = React.useRef<any>({
    suppliers: [],
    users: [],
  })

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
    // fetch all suppliers
    worker.getAllFromStore('suppliers').then((suppliers: any) => {
      const options: any = suppliers.map((supplier: any) => ({
        label: supplier.name,
        value: supplier.id,
      }))

      store.current = {...store.current, suppliers: options.slice(0, 1000)}
    })

    // fetch all users
    worker.getAllFromStore('users').then((users: any) => {
      const options = users.map((user: any) => ({
        label: user.name,
        value: user.id,
      }))

      store.current = {...store.current, users: options.slice(0, 1000)}
    })
  }, [worker])

  const serializeItem = React.useCallback((item: any) => {
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

      worker.putRow('acquisitions', updatedItem).then((result: any) => {
        const items = itemsRef.current
        const foundIndex = items.findIndex((x: any) => x.id === item.id)
        items[foundIndex] = serializeItem({
          ...result,
          _product: updatedItem._product,
        })
        const updatedItems = {items: [...items]}
        setLoadedItems(updatedItems)
        addTask(() => setEditCell(null))
      })
    }

    const handleCellDblClick = (
      cellName: string,
      value: string,
      valueType: string,
      e: React.MouseEvent,
    ) => {
      const {top, left, height, width} = e.currentTarget.getBoundingClientRect()

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

    const handleSupplierPick = (_supplierId: number) => {
      if (_supplierId !== item._supplierId) {
        updateItem({_supplierId})
      }
    }

    const handleExecutorPick = (_userId: number) => {
      if (_userId !== item._userId) {
        updateItem({_userId})
      }
    }

    const name = item.name || item._product.nameModel[0]
    const nameCell = {
      value: name,
      onDoubleClick: handleCellDblClick.bind(null, 'name', name, 'string'),
      tooltipContent: item.name && (
        <>
          <b>Before:</b> {item._product.nameModel[0]}
        </>
      ),
    }

    const model = item.model || item._product.nameModel[1]
    const modelCell = {
      value: model,
      onDoubleClick: handleCellDblClick.bind(null, 'model', model, 'string'),
      tooltipContent: item.model && (
        <>
          <b>Before:</b> {item._product.nameModel[1]}
        </>
      ),
    }

    const price = item.price
    const priceCell = {
      value: price,
      onDoubleClick: handleCellDblClick.bind(null, 'price', price, 'number'),
      tooltipContent: (
        <>
          <b>Previous price:</b> {item._product.realPrice}
        </>
      ),
    }

    const count = item.count
    const countCell = {
      value: count,
      onDoubleClick: handleCellDblClick.bind(null, 'count', count, 'number'),
      tooltipContent: (
        <>
          <b>In stock:</b> {item._product.inStockCount}
        </>
      ),
    }

    const lowestBoundCount =
      item.lowestBoundCount || item._product.lowestBoundCount
    const lowestBoundCountCell = {
      value: lowestBoundCount,
      onDoubleClick: handleCellDblClick.bind(
        null,
        'lowestBoundCount',
        lowestBoundCount,
        'number',
      ),
    }

    const supplierCell = {
      value: (
        <SelectMenu
          options={store.current.suppliers}
          selected={
            item._supplier
              ? {value: item._supplierId, label: item._supplier.name}
              : {value: null, label: null}
          }
          title="Select Supplier"
          buttonLabel="Select supplier.."
          onClose={handleSupplierPick}
        />
      ),
      style: {paddingTop: 4},
    }

    const executorCell = {
      value: (
        <SelectMenu
          options={store.current.users}
          selected={
            item._user
              ? {value: item._userId, label: item._user.name}
              : {value: null, label: null}
          }
          title="Select Executor"
          buttonLabel="Select executor.."
          onClose={handleExecutorPick}
        />
      ),
      style: {paddingTop: 4},
    }

    return {
      id: item.id,
      cells: [
        new Date(item.datetime).toLocaleDateString(),
        nameCell,
        modelCell,
        priceCell,
        countCell,
        item.sum,
        lowestBoundCountCell,
        supplierCell,
        executorCell,
        item._productId,
      ],
    }
  }, [])

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const loadMoreItems = React.useCallback(() => {
    worker
      .getAcquisitions({
        storeName: 'acquisitions',
        indexName: 'datetime',
        limit: FETCH_ITEM_LIMIT,
        lowerBoundKey: loadedItems.lastKey,
      })
      .then((newItems: any) => {
        const newItemsSerialized = newItems.map(serializeItem)

        const updatedLoadedItems = {
          ...loadedItems,
          hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
          items: [...loadedItems.items, ...newItemsSerialized],
          lastKey: newItems && newItems[newItems.length - 1].datetime,
        }

        setLoadedItems(updatedLoadedItems)
      })
  }, [loadedItems.items])

  return (
    <>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={loadMoreItems}
      />
      <EditableCellInput anchor={editCell} />
    </>
  )
}
