import React from 'react'
import {Pane, SmallPlusIcon, SmallMinusIcon, toaster} from 'evergreen-ui'
import {
  useLocale,
  useDatabase,
  useAccount,
  withErrorBoundary,
} from '../../utilities'
import {SPACING, STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {UPDATE_CASHBOX} from '../../constants/events'
import RIGHTS from '../../constants/rights'
import Table from '../../components/Table'
import {PageWrapper} from '../../layouts'
import NewCashboxOperation from './NewCashboxOperation'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const OPERATION_ICON_STYLE = {
  position: 'relative' as 'relative',
  top: 3,
}

function CashboxHistory({}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CASHBOX
  const {TABLE} = PAGE_CONST

  const db = useDatabase()

  const [{user, permissions}] = useAccount()

  const [loadedItems, setLoadedItems] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    LOADED_ITEMS_DEFAULT,
  )

  const [currentBalance, setCurrentBalance] = React.useState('')

  const fetchCurrentBalance = React.useCallback(() => {
    db.getRow({storeName: SN.BUDGET, key: 1}).then((budget: any) => {
      setCurrentBalance(budget.cashboxValue)
    })
  }, [db])

  React.useEffect(() => {
    fetchCurrentBalance()
  }, [fetchCurrentBalance])

  const serializeItem = React.useCallback((item: any) => {
    const datetime = new Date(item.datetime)
    const datetimeCell = {
      value: `${datetime.toLocaleDateString()} ${datetime.toLocaleTimeString()}`,
    }

    const operationIcon =
      item.action === 'ADD' ? (
        <SmallPlusIcon color="green" {...OPERATION_ICON_STYLE} />
      ) : (
        <SmallMinusIcon color="red" {...OPERATION_ICON_STYLE} />
      )

    const amountCell = {
      value: (
        <>
          {operationIcon}
          {item.actionValue}
        </>
      ),
      tooltipContent: (
        <>
          <div>
            <b>{TABLE.TOOLTIP.AMOUNT_BEFORE}</b>: {item.beforeValue}
          </div>
          <div>
            <b>{TABLE.TOOLTIP.AMOUNT_AFTER}</b>: {item.afterValue}
          </div>
        </>
      ),
    }

    return {
      id: item.id,
      cells: [datetimeCell, amountCell, item?._user?.name],
    }
  }, [])

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchCashboxHistory = React.useCallback(() => {
    db.getRows({
      storeName: SN.CASHBOX_HISTORY,
      indexName: IN.DATETIME,
      direction: 'prev',
      limit: FETCH_ITEM_LIMIT,
      lastKey: loadedItems.lastKey,
    }).then((newItems: any) => {
      const newItemsSerialized = newItems.map(serializeItem)

      const updatedLoadedItems = {
        ...loadedItems,
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...loadedItems.items, ...newItemsSerialized],
        lastKey: newItems.length && newItems[newItems.length - 1].datetime,
      }

      setLoadedItems(updatedLoadedItems)
    })
  }, [loadedItems.items])

  const handleCashboxOperation = React.useCallback(
    ({actionType, sumValue}: any) => {
      if (!user?.id) {
        const errMsg = PAGE_CONST.TOASTER.NOT_AUTHORIZED_TO_PERFORM
        toaster.danger(errMsg)
        return Promise.reject(errMsg)
      }

      return db
        .sendEvent({
          type: UPDATE_CASHBOX,
          payload: {
            action: actionType,
            value: sumValue,
            _userId: user?.id,
          },
        })
        .then(({updatedCashboxValue, newCashboxOperation}: any) => {
          const newCashboxOperationFlattened = serializeItem(
            newCashboxOperation,
          )
          setLoadedItems({
            items: [newCashboxOperationFlattened, ...loadedItems.items],
          })
          setCurrentBalance(updatedCashboxValue)
        })
    },
    [loadedItems.items, setLoadedItems, serializeItem, user],
  )

  const columns = React.useMemo(() => {
    const {COLUMNS} = TABLE
    return [
      {label: COLUMNS.TIME, width: 150},
      {label: COLUMNS.AMOUNT, width: 120},
      {label: COLUMNS.PERFORMER, width: 165},
    ]
  }, [TABLE])

  return (
    <PageWrapper>
      <Pane
        display="flex"
        justifyContent="space-between"
        marginBottom={SPACING}
      >
        <Pane>
          <strong>{PAGE_CONST.CONTROLS.CURRENT_BALANCE.TITLE}: </strong>{' '}
          {currentBalance}
        </Pane>
        {permissions?.includes(RIGHTS.CAN_PERFORM_CASHBOX_OPERATIONS) && (
          <NewCashboxOperation
            currentBalance={currentBalance}
            handleCashboxOperation={handleCashboxOperation}
          />
        )}
      </Pane>
      <Pane flex={1}>
        <Table
          columns={columns}
          rows={loadedItems.items}
          hasNextPage={loadedItems.hasNextPage}
          isItemLoaded={isItemLoaded}
          loadMoreItems={fetchCashboxHistory}
          isRowNumberShown={false}
        />
      </Pane>
    </PageWrapper>
  )
}

export default withErrorBoundary(CashboxHistory)
