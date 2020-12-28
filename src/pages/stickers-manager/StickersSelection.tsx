import React from 'react'
import {Menu, IconButton, Position, MoreIcon, EditIcon} from 'evergreen-ui'
import {
  useLocale,
  useDatabase,
  useTasksAfterUpdate,
  useCancellablePromise,
  withErrorBoundary,
} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import {
  PUT_STICKERS_SELECTION_ITEM,
  DELETE_STICKERS_SELECTION_ITEM,
} from '../../constants/events'
import Table from '../../components/Table'
import EditableCellInput from '../../components/EditableCellInput'
import Popover from '../../components/Popover'
import {PageWrapper} from '../../layouts'
import DeleteStickersSelection from './DeleteStickersSelection'
import SelectProduct from '../common/select-product'
import SelectProductCount from '../common/select-product-count'

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

interface StickersSelectionProps {
  stickersSelectionId: string
  completeStickersSelectionDelete: () => void
  setControlPanel: (comp: React.ReactNode) => void
}

function StickersSelection({
  stickersSelectionId,
  completeStickersSelectionDelete,
  setControlPanel,
}: StickersSelectionProps) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.STICKERS_MANAGER
  const {TABLE} = PAGE_CONST
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

  const [editCell, setEditCell] = React.useState<any>(null)

  const gridOuterRef = React.useRef<any>()

  const [addTask] = useTasksAfterUpdate([], [loadedItems.items])

  const deleteSaleItem = React.useCallback(
    (id: string) => {
      db.sendEvent({
        type: DELETE_STICKERS_SELECTION_ITEM,
        payload: {id},
      }).then(() => {
        const foundIndex = itemsRef.current.findIndex((x: any) => x.id === id)
        if (foundIndex > -1) {
          itemsRef.current.splice(foundIndex, 1)
          setLoadedItems({items: [...itemsRef.current]})
        }
      })
    },
    [db, setLoadedItems],
  )

  const serializeItem = React.useCallback(
    (item: any, indexInTable: number) => {
      function updateItem(cellUpdate: any) {
        const updatedItem = {...item, ...cellUpdate}

        const key = Object.keys(cellUpdate)[0]

        if (key === 'price') {
          updatedItem[key] = Number(updatedItem[key])
        }

        // in case nothing changed
        if (item[key] === cellUpdate[key]) {
          return setEditCell(null)
        }

        if (
          key === 'selectedAcquisitions' &&
          JSON.stringify(item[key]) === JSON.stringify(cellUpdate[key])
        ) {
          return
        }

        db.sendEvent({
          type: PUT_STICKERS_SELECTION_ITEM,
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

          setLoadedItems(updatedItems)
        })
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

      const aqIdsCell = item.selectedAcquisitions
        .map((x: any) => x._acquisitionId.split('-')[0])
        .join(', ')

      return {
        id: item.id,
        cells: [
          nameCell,
          modelCell,
          {
            value: (
              <SelectProductCount
                selectedAcquisitions={item.selectedAcquisitions}
                updateSelectedAcquisitions={updateItem}
                gridOuterRef={gridOuterRef}
              >
                {item.count}
              </SelectProductCount>
            ),
          },
          item._productId.split('-')[0],
          aqIdsCell,
        ],
        optionsMenu,
      }
    },
    [TABLE, db, addTask, deleteSaleItem],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchStickersSelectionItems = React.useCallback(() => {
    const queryFetch = makeCancellablePromise(
      db.getRows({
        storeName: SN.STICKERS,
        matchProperties: {_stickersSelectionId: stickersSelectionId},
        sort: 'asc',
      }),
    )

    queryFetch.then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)

      const updatedLoadedItems = {
        hasNextPage: false,
        items: newItemsSerialized,
      }

      setLoadedItems(updatedLoadedItems)
    })
  }, [makeCancellablePromise, stickersSelectionId, db, serializeItem])

  const refetchAll = React.useCallback(() => {
    fetchStickersSelectionItems()
  }, [fetchStickersSelectionItems])

  const handleSelectedProduct = React.useCallback(
    ({productId, acquisitionId}: any) => {
      const productToAdd = {
        _stickersSelectionId: stickersSelectionId,
        toPrintStickersCount: 1,
        _productId: productId,
        _acquisitionId: acquisitionId,
      }

      db.sendEvent({
        type: PUT_STICKERS_SELECTION_ITEM,
        payload: productToAdd,
        consumer: 'client',
      }).then(refetchAll)
    },
    [stickersSelectionId, db, refetchAll],
  )

  React.useEffect(() => {
    setControlPanel(
      <>
        <DeleteStickersSelection
          stickersSelectionId={stickersSelectionId}
          completeStickersSelectionDelete={completeStickersSelectionDelete}
        />
        <SelectProduct
          key={stickersSelectionId}
          handleSelectedProduct={handleSelectedProduct}
        />
      </>,
    )
  }, [
    stickersSelectionId,
    setControlPanel,
    completeStickersSelectionDelete,
    handleSelectedProduct,
  ])

  const columns = React.useMemo(() => {
    const {COLUMNS} = TABLE
    return [
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH},
      {label: COLUMNS.MODEL.TITLE, width: COLUMNS.MODEL.WIDTH},
      {label: COLUMNS.COUNT.TITLE, width: 80},
      {label: COLUMNS.PRODUCT_ID.TITLE, width: COLUMNS.PRODUCT_ID.WIDTH},
      {
        label: COLUMNS.ACQUISITIONS_IDS.TITLE,
        width: COLUMNS.ACQUISITIONS_IDS.WIDTH,
        canGrow: true,
      },
      {label: 'OPTIONS', width: 50},
    ]
  }, [TABLE])

  return (
    <PageWrapper>
      <Table
        columns={columns}
        rows={loadedItems.items}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={fetchStickersSelectionItems}
        gridOuterRef={gridOuterRef}
      />

      <EditableCellInput
        anchor={editCell}
        gridOuterRef={gridOuterRef.current}
      />
    </PageWrapper>
  )
}

export default withErrorBoundary(StickersSelection)
