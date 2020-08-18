import React from 'react'
import styled from 'styled-components'
import AutoSizer from 'react-virtualized-auto-sizer'
import {VariableSizeGrid as Grid, GridChildComponentProps} from 'react-window'
import {Divider, DIVIDER_VARIANT, Small, Subtitle} from '../elements'
// @ts-ignore
import InfiniteLoader from 'react-window-infinite-loader'
import {Spinner} from 'evergreen-ui'
import Tooltip from './Tooltip'
import {useUpdate} from '../utilities'

const ROW_HEIGHT = 40
const STICKY_COLUMN_WIDTH = 50
const HEADER_SUBTITLE_PADDING = 11

type Column = {
  label: string
  width: number
}

type HeaderColumns = Array<Column>

type HeaderCell = {
  label: string
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
`

const TableCellContent = styled.div`
  width: 100%;
  height: 100%;
  /* spacing is 8 * 1.5 */
  padding: 10px 12px;
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
  ...props
}: {
  style?: React.CSSProperties
  sticky?: boolean
  children: React.ReactNode
}) => (
  <StyledHeaderCell {...props}>
    <Subtitle variant="SECONDARY" padding={HEADER_SUBTITLE_PADDING}>
      {children}
    </Subtitle>
    <CellDividers />
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

function CellDividers() {
  return (
    <>
      <Divider absolute variant={DIVIDER_VARIANT.VERTICAL} />
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

  const cellOnDoubleClick = isItemAvailable
    ? isCellContentObject
      ? cellContent.onDoubleClick
      : cellData.onDoubleClick
    : null
  const columnLabel = columns[columnIndex].label

  const customCellContentStyle =
    (isCellContentObject && cellContent.style) || {}

  return (
    <TableCell
      // @ts-ignore
      // onClick={() => tableContext.setSelectedRow(style.top)}
      onDoubleClick={cellOnDoubleClick}
      // @ts-ignore
      selected={tableContext.selectedRow === style.top}
      style={{
        ...style,
      }}
    >
      <TableCellContent style={customCellContentStyle}>
        <Tooltip content={isCellContentObject && cellContent.tooltipContent}>
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

      <CellDividers />
    </TableCell>
  )
}

function StickyHeader({
  columns,
  stickyColumnWidth,
  headers,
}: {
  columns: HeaderColumns
  stickyColumnWidth: number
  headers: HeaderCells
}) {
  const headerColumnsSum: number = columns.reduce(
    (acc: number, cur: Column): number => acc + cur.width,
    0,
  )

  const headerContainerStyle = {
    height: ROW_HEIGHT,
    width: headerColumnsSum + stickyColumnWidth,
  }

  const stickyHeaderColumnStyle = {
    width: stickyColumnWidth,
  }

  return (
    <Header style={headerContainerStyle}>
      <HeaderCell sticky style={stickyHeaderColumnStyle}>
        #
      </HeaderCell>
      <ScrollableHeader>
        {headers.map(({label, left, width}, i) => (
          <HeaderCell
            style={{
              position: 'absolute',
              left,
              width,
            }}
            key={i}
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
}: {
  stickyColumnRows: Array<{label: number; top: number}>
  gridHeight: any
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
            height: ROW_HEIGHT,
            top,
          }}
          key={i}
        >
          <TableCellContent>
            <Small variant="SECONDARY">{label}</Small>
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

function createStickyColumns(minRow: number, maxRow: number) {
  const rows = []

  for (let i = minRow; i <= maxRow; i++) {
    rows.push({label: i + 1, top: i * ROW_HEIGHT})
  }

  return rows
}

const innerElementTypeRender = (columns: HeaderColumns, rows: any) => ({
  children,
  //@ts-ignore
  style,
}: {
  children: React.ReactElement
}) => {
  const [minColumn, maxColumn, minRow, maxRow] = getVisibleArea(children)

  const headers = createHeaders(columns, minColumn, maxColumn)

  const stickyColumnRows = createStickyColumns(minRow, maxRow)

  return (
    <GridContainer
      height={style.height + ROW_HEIGHT}
      width={style.width + STICKY_COLUMN_WIDTH}
    >
      <StickyHeader
        columns={columns}
        stickyColumnWidth={STICKY_COLUMN_WIDTH}
        headers={headers}
      />
      <StickyColumn
        stickyColumnRows={stickyColumnRows}
        gridHeight={style.height}
      />
      <GridData
        style={{
          ...style,
          top: ROW_HEIGHT,
          left: STICKY_COLUMN_WIDTH,
        }}
      >
        {children}
      </GridData>
    </GridContainer>
  )
}

const GRID_PARENT_STYLE = {
  // Black / 20
  border: '1px solid #dbdde0',
}

interface TableProps {
  columns: {
    label: string
    width: number
  }[]

  rows: {
    cells: any[]
    onDoubleClick: () => void
    optionsMenu?: React.ReactNode
  }[]

  hasNextPage: any

  isItemLoaded: any

  loadMoreItems: any
}

function Table({
  rows,
  columns,
  hasNextPage,
  isItemLoaded,
  loadMoreItems,
}: TableProps) {
  const [selectedRow, setSelectedRow] = React.useState(null)
  const [isFirstFetched, setIsFirstFetched] = React.useState(false)
  const firstMountDatetime = React.useRef(Date.now())

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

  const innerElementType = innerElementTypeRender(columns, rows)

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
              // minimumBatchSize={20}
            >
              {({onItemsRendered, ref}: any) => {
                return (
                  <Grid
                    rowCount={itemCount}
                    columnCount={columns.length}
                    columnWidth={columnIndex => columns[columnIndex].width}
                    rowHeight={() => ROW_HEIGHT}
                    height={height}
                    width={width}
                    innerElementType={innerElementType}
                    style={
                      isFirstFetched && rows.length
                        ? GRID_PARENT_STYLE
                        : {display: 'none'}
                    }
                    itemData={{rows, columns, isItemLoaded}}
                    onItemsRendered={({
                      visibleRowStartIndex,
                      visibleRowStopIndex,
                      overscanRowStartIndex,
                      overscanRowStopIndex,
                    }) => {
                      onItemsRendered({
                        overscanStartIndex: overscanRowStartIndex,
                        overscanStopIndex: overscanRowStopIndex,
                        visibleStartIndex: visibleRowStartIndex,
                        visibleStopIndex: visibleRowStopIndex,
                      })
                    }}
                    ref={ref}
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
        {isFirstFetched && !rows.length && <FlashBlock>No data.</FlashBlock>}
      </>
    </TableContext.Provider>
  )
}

export default React.memo(Table)
