import React from 'react'
import styled from 'styled-components'
import AutoSizer from 'react-virtualized-auto-sizer'
import {VariableSizeGrid as Grid, GridChildComponentProps} from 'react-window'
import {Divider, DIVIDER_VARIANT, Small, Subtitle} from '../elements'
// @ts-ignore
import InfiniteLoader from 'react-window-infinite-loader'
import {Spinner} from 'evergreen-ui'
import Tooltip from './Tooltip'
import CellTextWrapper from './CellTextWrapper'
import {useLocale, useUpdate, useOneTime, getTestId} from '../utilities'

const ROW_HEIGHT = 40
const STICKY_COLUMN_WIDTH = 50
const CELL_CONTENT_SIDES_STYLE = {padding: '0px 12px'}
const HEADER_CELL_WRAPPER_STYLE = {top: 0, lineHeight: 'normal'}

function noop() {}

type Column = {
  label?: string
  width: number
}

type HeaderColumns = Array<Column>

type HeaderCell = {
  label?: string
  width: number
  left: number
}

type HeaderCells = Array<HeaderCell>

// @ts-ignore
const TableContext = React.createContext()

const TableCell = styled.div<{selected: boolean}>`
  background: ${props => (props.selected ? '#E5F2FF' : 'white')};
  display: flex;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
`

const TableCellContent = styled.div`
  width: 100%;
  height: 100%;
  /* spacing is 8 * 1.5 */
  padding: ${CELL_CONTENT_SIDES_STYLE.padding};
  display: flex;
`

const Header = styled.div`
  background: #f9f9fa;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 3;
  display: flex;
`

const StyledHeaderCell = styled.div<{sticky?: boolean}>`
  width: 100%;
  height: 100%;
  display: flex;
  /* Black / 5 */

  background: #f9f9fa;
  ${props =>
    props.sticky &&
    `
    position: sticky;
    top: 0;
    left: 0;
    z-index: 3;
  `}
`
const HeaderCell = ({
  children,
  isLastColumn,
  ...props
}: {
  style?: React.CSSProperties
  sticky?: boolean
  children: React.ReactNode
  isLastColumn?: boolean
}) => (
  <StyledHeaderCell {...props}>
    <CellTextWrapper style={HEADER_CELL_WRAPPER_STYLE}>
      <Subtitle variant="SECONDARY" style={CELL_CONTENT_SIDES_STYLE}>
        {children}
      </Subtitle>
    </CellTextWrapper>
    <CellDividers isLastColumn={isLastColumn} />
  </StyledHeaderCell>
)

const ScrollableHeader = styled.div`
  position: relative;
`

const StickyColumnContainer = styled.div`
  position: sticky;
  z-index: 2;
`

type GridContainerProps = {
  height: number
  width: number
}

const GridContainer = styled.div<GridContainerProps>`
  position: relative;
  ${({height, width}) => `
    height: ${height}px;
    width: ${width}px
  `}
`
const GridData = styled.div`
  position: absolute;
  top: 50px;
`

function CellDividers({isLastColumn = false}: any) {
  return (
    <>
      {!isLastColumn && <Divider absolute variant={DIVIDER_VARIANT.VERTICAL} />}
      <Divider absolute variant={DIVIDER_VARIANT.HORIZONTAL} />
    </>
  )
}

function Cell({data, columnIndex, rowIndex, style}: GridChildComponentProps) {
  const tableContext = React.useContext(TableContext)

  const {columns, rows, isItemLoaded} = data

  const isItemAvailable = isItemLoaded(rowIndex)

  const cellData = rows[rowIndex]
  const cellContent = !isItemAvailable ? '...' : cellData.cells[columnIndex]

  const isCellContentObject =
    cellContent !== null && typeof cellContent === 'object'

  const cellOnClick = isItemAvailable
    ? (isCellContentObject && cellContent.onClick) || cellData.onClick
    : null

  const cellOnDoubleClick = isItemAvailable
    ? (isCellContentObject && cellContent.onDoubleClick) ||
      cellData.onDoubleClick
    : null

  const cellTestProps = getTestId(cellContent?.testId)

  const columnLabel = columns[columnIndex].label

  const customCellContentStyle = isItemAvailable
    ? (isCellContentObject && cellContent.style) || cellData.style
    : {}

  const isTextCell = isItemAvailable
    ? cellContent?.isTextCell ?? cellData?.isTextCell ?? true
    : true

  return (
    <TableCell
      // @ts-ignore
      onClick={cellOnClick}
      onDoubleClick={cellOnDoubleClick}
      // @ts-ignore
      selected={tableContext.selectedRow === style.top}
      style={{
        ...style,
      }}
      {...cellTestProps}
    >
      <TableCellContent
        style={{
          ...(cellData?.isDisabled ? {opacity: 0.5} : {}),
          ...customCellContentStyle,
        }}
      >
        <Tooltip
          content={isCellContentObject && cellContent.tooltipContent}
          isTextCell={isTextCell}
        >
          <Small variant="SECONDARY">
            {isItemAvailable &&
            columnLabel === 'OPTIONS' &&
            cellData.optionsMenu
              ? cellData.optionsMenu
              : isCellContentObject
              ? cellContent.value
              : cellContent}
          </Small>
        </Tooltip>
      </TableCellContent>

      <CellDividers isLastColumn={columnIndex === columns.length - 1} />
    </TableCell>
  )
}

function StickyHeader({
  columns,
  stickyColumnWidth,
  headers,
  rowHeight,
}: {
  columns: HeaderColumns
  stickyColumnWidth: number
  headers: HeaderCells
  rowHeight: number
}) {
  const headerColumnsSum: number = columns.reduce(
    (acc: number, cur: Column): number => acc + cur.width,
    0,
  )

  const headerContainerStyle = {
    height: rowHeight,
    width: headerColumnsSum + stickyColumnWidth,
  }

  const stickyHeaderColumnStyle = {
    width: stickyColumnWidth,
  }

  return (
    <Header style={headerContainerStyle}>
      {Boolean(stickyColumnWidth) && (
        <HeaderCell sticky style={stickyHeaderColumnStyle}>
          #
        </HeaderCell>
      )}
      <ScrollableHeader>
        {headers.map(({label, left, width}, i) => (
          <HeaderCell
            style={{
              position: 'absolute',
              left,
              width,
            }}
            key={i}
            isLastColumn={i === columns.length - 1}
          >
            {label === 'OPTIONS' ? '' : label}
          </HeaderCell>
        ))}
      </ScrollableHeader>
    </Header>
  )
}

function StickyColumn({
  stickyColumnRows,
  gridHeight,
  rowHeight,
}: {
  stickyColumnRows: Array<{label: number; top: number}>
  gridHeight: any
  rowHeight: number
}) {
  const tableContext = React.useContext(TableContext)

  const columnContainerStyle = {
    left: 0,
    height: gridHeight,
    width: STICKY_COLUMN_WIDTH,
  }

  return (
    <StickyColumnContainer style={columnContainerStyle}>
      {stickyColumnRows.map(({label, top}, i) => (
        <TableCell
          // @ts-ignore
          // onClick={() => tableContext.setSelectedRow(top)}
          onDoubleClick={() =>
            console.log('Hey dude i am gonna open modal for rowId', top)
          }
          // @ts-ignore
          selected={tableContext.selectedRow === top}
          style={{
            position: 'absolute',
            height: rowHeight,
            top,
          }}
          key={i}
        >
          <TableCellContent>
            <CellTextWrapper>
              <Small variant="SECONDARY">{label}</Small>
            </CellTextWrapper>
          </TableCellContent>

          <CellDividers />
        </TableCell>
      ))}
    </StickyColumnContainer>
  )
}

const FlashBlock = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`

// @ts-ignore
function getVisibleArea(children) {
  return children.reduce(
    (
      // @ts-ignore
      [minColumn, maxColumn, minRow, maxRow],
      // @ts-ignore
      {props: {columnIndex, rowIndex}},
    ) => {
      if (columnIndex < minColumn) {
        minColumn = columnIndex
      }

      if (columnIndex > maxColumn) {
        maxColumn = columnIndex
      }

      if (rowIndex < minRow) {
        minRow = rowIndex
      }

      if (rowIndex > maxRow) {
        maxRow = rowIndex
      }

      return [minColumn, maxColumn, minRow, maxRow]
    },
    [
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ],
  )
}

function createHeaders(
  columns: HeaderColumns,
  minColumn: number,
  maxColumn: number,
) {
  const headers = []
  let lastLeftPosition = columns
    .slice(0, minColumn)
    .reduce((total, current) => {
      return total + current.width
    }, 0)

  for (let i = minColumn; i <= maxColumn; i++) {
    const column = columns[i]
    headers.push({
      label: column.label,
      left: lastLeftPosition,
      width: column.width,
    })
    lastLeftPosition += column.width
  }

  return headers
}

function createStickyColumns(
  minRow: number,
  maxRow: number,
  rowHeight: number,
) {
  const rows = []

  for (let i = minRow; i <= maxRow; i++) {
    rows.push({label: i + 1, top: i * rowHeight})
  }

  return rows
}

const innerElementTypeRender = (
  columns: HeaderColumns,
  rows: any,
  rowHeight: number,
  isHeaderShown: boolean,
  isRowNumberShown: boolean,
) => ({
  children,
  //@ts-ignore
  style,
}: {
  children: React.ReactElement
}) => {
  const [minColumn, maxColumn, minRow, maxRow] = getVisibleArea(children)

  let headers: HeaderCells = []
  if (isHeaderShown) {
    headers = createHeaders(columns, minColumn, maxColumn)
  }

  const stickyColumnRows = createStickyColumns(minRow, maxRow, rowHeight)

  const extraColumnWidth = isRowNumberShown ? STICKY_COLUMN_WIDTH : 0

  const extraGridHeight = isHeaderShown ? rowHeight : 0

  return (
    <GridContainer
      height={style.height + extraGridHeight}
      width={style.width + extraColumnWidth}
    >
      {isHeaderShown && (
        <StickyHeader
          columns={columns}
          stickyColumnWidth={extraColumnWidth}
          headers={headers}
          rowHeight={rowHeight}
        />
      )}
      {isRowNumberShown && (
        <StickyColumn
          stickyColumnRows={stickyColumnRows}
          gridHeight={style.height}
          rowHeight={rowHeight}
        />
      )}
      <GridData
        style={{
          ...style,
          top: extraGridHeight,
          left: extraColumnWidth,
        }}
      >
        {children}
      </GridData>
    </GridContainer>
  )
}

const GRID_PARENT_STYLE = {
  outline: '1px solid #dbdde0',
}

interface TableProps {
  columns: {
    label?: string
    width: number
    canGrow?: boolean
  }[]

  rows: {
    cells: any[]
    onDoubleClick: () => void
    optionsMenu?: React.ReactNode
    isDisabled?: boolean
  }[]

  rowHeight?: number

  isHeaderShown?: boolean

  isRowNumberShown?: boolean

  hasNextPage: any

  isItemLoaded: any

  loadMoreItems: any

  onFirstFetchComplete?: (rows: any) => void

  gridOuterRef?: any

  loaderRef?: any
}

function Table({
  rows,
  columns,
  rowHeight = ROW_HEIGHT,
  isHeaderShown = true,
  isRowNumberShown = true,
  hasNextPage,
  isItemLoaded,
  loadMoreItems,
  onFirstFetchComplete = noop,
  gridOuterRef,
  loaderRef,
}: TableProps) {
  const [locale] = useLocale()
  const COMPONENT_CONST = locale.vars.GENERAL.COMPONENTS.TABLE

  const [adjustedColumns, setAdjustedColumns] = React.useState(columns)
  const [selectedRow, setSelectedRow] = React.useState<any>({
    rows,
    columns: adjustedColumns,
    isItemLoaded,
  })
  const [isFirstFetched, setIsFirstFetched] = React.useState(false)
  const firstMountDatetime = React.useRef(Date.now())

  const gridComponentRef = React.useRef<any>()

  const outerRef = React.useRef<any>()

  const infiniteLoaderRef = React.useRef<any>()

  const stretchColumns = React.useCallback(() => {
    requestAnimationFrame(() => {
      if (isFirstFetched) {
        return
      }

      const gridEl = outerRef.current
      if (gridEl) {
        const gridDimensions = gridEl.getBoundingClientRect()
        const gridScrollWidth = gridEl?.offsetWidth - gridEl?.clientWidth
        const gridWidth = gridDimensions.width - gridScrollWidth

        const columnsTotalWidth = columns.reduce(
          (a, b) => a + b.width,
          isRowNumberShown ? STICKY_COLUMN_WIDTH : 0,
        )

        if (gridWidth > columnsTotalWidth) {
          let totalExtraWidth = gridWidth - columnsTotalWidth

          const growableColumnsCount = columns.reduce(
            (a, b) => (b.canGrow ? a + 1 : a),
            0,
          )

          const extraWidthForEachColumn = totalExtraWidth / growableColumnsCount

          const columnsUpdate = JSON.parse(JSON.stringify(columns))
          for (const column of columnsUpdate) {
            if (column.canGrow) {
              let extraWidthForThisColumn = extraWidthForEachColumn
              if (totalExtraWidth < extraWidthForEachColumn) {
                extraWidthForThisColumn = totalExtraWidth
              }
              column.width += extraWidthForThisColumn
              totalExtraWidth -= extraWidthForThisColumn
            }
          }

          setAdjustedColumns(columnsUpdate)
          requestAnimationFrame(() => {
            if (gridComponentRef.current) {
              gridComponentRef.current.resetAfterColumnIndex(0)
            }
          })
        }
      }
    })
  }, [isFirstFetched, columns, isRowNumberShown])

  useUpdate(() => {
    let deferred: any
    if (!isFirstFetched) {
      const fetchedPassedMs = Date.now() - firstMountDatetime.current

      const deferMs = fetchedPassedMs >= 700 ? 0 : 700 - fetchedPassedMs

      deferred = setTimeout(() => {
        setIsFirstFetched(true)
      }, deferMs)
    }

    return () => {
      clearTimeout(deferred)
    }
  }, [rows])

  useOneTime(
    isFirstFetched,
    () => {
      onFirstFetchComplete(rows)
    },
    [isFirstFetched, setIsFirstFetched, onFirstFetchComplete, rows],
  )

  if (
    gridOuterRef?.hasOwnProperty('current') &&
    gridOuterRef.current !== outerRef.current
  ) {
    gridOuterRef.current = outerRef.current
  }

  if (
    loaderRef?.hasOwnProperty('current') &&
    loaderRef.current !== infiniteLoaderRef.current
  ) {
    loaderRef.current = infiniteLoaderRef.current
  }

  const innerElementType = innerElementTypeRender(
    adjustedColumns,
    rows,
    rowHeight,
    isHeaderShown,
    isRowNumberShown,
  )

  const itemCount = hasNextPage ? rows.length + 1 : rows.length

  return (
    // @ts-ignore
    <TableContext.Provider value={{selectedRow, setSelectedRow}}>
      <>
        <AutoSizer>
          {({height, width}) => (
            <InfiniteLoader
              isItemLoaded={isItemLoaded}
              itemCount={itemCount}
              loadMoreItems={loadMoreItems}
              ref={infiniteLoaderRef}
            >
              {({onItemsRendered, ref}: any) => {
                return (
                  <Grid
                    // @ts-ignore
                    rowCount={itemCount}
                    columnCount={adjustedColumns.length}
                    columnWidth={columnIndex =>
                      adjustedColumns[columnIndex].width
                    }
                    rowHeight={() => rowHeight}
                    height={height}
                    width={width}
                    innerElementType={innerElementType}
                    style={
                      isFirstFetched && rows.length
                        ? GRID_PARENT_STYLE
                        : {visibility: 'hidden'}
                    }
                    itemData={{
                      rows,
                      columns: adjustedColumns,
                      rowHeight,
                      isItemLoaded,
                    }}
                    onItemsRendered={({
                      visibleRowStartIndex,
                      visibleRowStopIndex,
                      overscanRowStartIndex,
                      overscanRowStopIndex,
                    }) => {
                      stretchColumns()
                      onItemsRendered({
                        overscanStartIndex: overscanRowStartIndex,
                        overscanStopIndex: overscanRowStopIndex,
                        visibleStartIndex: visibleRowStartIndex,
                        visibleStopIndex: visibleRowStopIndex,
                      })
                    }}
                    ref={(componentRef: any) => {
                      ref(componentRef)
                      gridComponentRef.current = componentRef
                    }}
                    outerRef={outerRef}
                  >
                    {Cell}
                  </Grid>
                )
              }}
            </InfiniteLoader>
          )}
        </AutoSizer>
        {!isFirstFetched && (
          <FlashBlock>
            <Spinner size={32} />
          </FlashBlock>
        )}
        {isFirstFetched && !rows.length && (
          <FlashBlock>{COMPONENT_CONST.NO_DATA}</FlashBlock>
        )}
      </>
    </TableContext.Provider>
  )
}

export default React.memo(Table)
