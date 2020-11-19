import React from 'react'
import {
  IconButton,
  CaretDownIcon,
  TrashIcon,
  toaster,
  Button,
  Pane,
} from 'evergreen-ui'
import {useLocale, useTasksAfterUpdate} from '../../utilities'
import Table from '../../components/Table'
import ModalPopover from '../../components/ModalPopover'
import EditableCellInput from '../../components/EditableCellInput'

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const CELL_STYLE = {justifyContent: 'center'}

function SelectedAcquisitions({selectedAcquisitions, latestData}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.CARTS.TABLE.CELLS.SELECT_COUNT
  const {TABLE} = PAGE_CONST

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

  const serializeItem = React.useCallback(
    (item: any, indexInTable: number) => {
      const updateItem = (cellUpdate: any) => {
        const updatedItem = {...item, ...cellUpdate}

        const key = Object.keys(cellUpdate)[0]

        if (key === 'count') {
          updatedItem[key] = Number(updatedItem[key])

          if (updatedItem.count === 0) {
            toaster.warning(TABLE.TOOLTIP.COUNT_CANNOT_BE_ZERO)
            return setEditCell(null)
          }
        }

        const items = itemsRef.current
        const foundIndex = items.findIndex(
          (x: any) => x.id === item._acquisitionId,
        )

        items[foundIndex] = serializeItem(updatedItem, indexInTable)

        latestData.current = latestData.current.map((x: any) =>
          x._acquisitionId === item._acquisitionId ? updatedItem : x,
        )

        const updatedItems = {items: [...items]}
        addTask(() => setEditCell(null))

        setLoadedItems(updatedItems)
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

      const deleteItem = () => {
        if (itemsRef.current?.length === 1) {
          return toaster.warning(TABLE.TOOLTIP.SINGLE_ITEM_DELETE_ERROR)
        }

        const updatedItems = itemsRef.current.filter(
          (x: any) => x.id !== item._acquisitionId,
        )
        setLoadedItems({items: updatedItems})

        latestData.current = latestData.current.filter(
          (x: any) => x._acquisitionId !== item._acquisitionId,
        )
      }

      const countCell = {
        value: item.count,
        onDoubleClick: handleCellDblClick.bind(
          null,
          'count',
          item.count,
          'number',
        ),
      }

      const deleteCell = {
        value: (
          <IconButton
            intent="danger"
            marginBottom={0}
            appearance="minimal"
            height={24}
            icon={TrashIcon}
            onClick={deleteItem}
          />
        ),
        isTextCell: false,
        style: CELL_STYLE,
      }

      return {
        id: item._acquisitionId,
        cells: [item._acquisitionId.split('-')[0], countCell, deleteCell],
      }
    },
    [STRING_FORMAT, TABLE],
  )

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchAcquisitions = React.useCallback(() => {
    const itemsSerialized = selectedAcquisitions.map(serializeItem)
    const updatedLoadedItems = {
      ...loadedItems,
      hasNextPage: false,
      items: itemsSerialized,
      lastKey: null,
    }

    setLoadedItems(updatedLoadedItems)
  }, [loadedItems.items])

  const columns = React.useMemo(() => {
    const {COLUMNS} = TABLE
    return [
      {width: COLUMNS.ACQUISITION_ID.WIDTH, canGrow: true},
      {width: COLUMNS.COUNT.WIDTH},
      {width: COLUMNS.DELETE.WIDTH},
    ]
  }, [TABLE])

  return (
    <>
      <Table
        columns={columns}
        rows={loadedItems.items}
        rowHeight={32}
        isHeaderShown={false}
        hasNextPage={loadedItems.hasNextPage}
        isItemLoaded={isItemLoaded}
        loadMoreItems={fetchAcquisitions}
        isRowNumberShown={false}
        gridOuterRef={gridOuterRef}
      />
      <EditableCellInput
        anchor={editCell}
        gridOuterRef={gridOuterRef.current}
      />
    </>
  )
}

function SelectCount({
  selectedAcquisitions,
  updateSelectedAcquisitions,
  gridOuterRef,
  children,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS.TABLE.CELLS.SELECT_COUNT

  const latestData = React.useRef<any>(selectedAcquisitions)

  const handleCloseComplete = React.useCallback(() => {
    updateSelectedAcquisitions({selectedAcquisitions: latestData.current})

    if (gridOuterRef.current) {
      gridOuterRef.current.style.pointerEvents = 'auto'
    }
  }, [updateSelectedAcquisitions])

  const handleOpen = React.useCallback(() => {
    if (gridOuterRef.current) {
      gridOuterRef.current.style.pointerEvents = 'none'
    }
  }, [])

  return (
    <ModalPopover
      title={PAGE_CONST.MODAL_TITLE}
      component={
        <SelectedAcquisitions
          selectedAcquisitions={selectedAcquisitions}
          updateSelectedAcquisitions={updateSelectedAcquisitions}
          latestData={latestData}
        />
      }
      height={200}
      width={200}
      popoverProps={{
        onOpen: handleOpen,
        onCloseComplete: handleCloseComplete,
      }}
    >
      <Button
        height={28}
        display="flex"
        justifyContent="space-around"
        iconAfter={CaretDownIcon}
        width={'100%'}
      >
        {children}
      </Button>
    </ModalPopover>
  )
}

export default SelectCount