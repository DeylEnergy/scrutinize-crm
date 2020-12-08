import React from 'react'
import {
  Avatar,
  Pane,
  Popover,
  Menu,
  Button,
  IconButton,
  Position,
  AddIcon,
  MoreIcon,
  EditIcon,
} from 'evergreen-ui'
import SearchInput from '../../../components/SearchInput'
import Table from '../../../components/Table'
import UpdateUser from './UpdateUser'
import {STORE_NAME as SN, INDEX_NAME as IN, SPACING} from '../../../constants'
import {
  useLocale,
  useDatabase,
  useCancellablePromise,
  withErrorBoundary,
} from '../../../utilities'
import {PUT_USER} from '../../../constants/events'
import {PageWrapper, ControlWrapper} from '../../../layouts'

const FETCH_ITEM_LIMIT = 20

const LOADED_ITEMS_DEFAULT = {
  hasNextPage: true,
  items: [],
  lastKey: null,
}

const SIDE_SHEET_DEFAULT = {
  value: null,
  isShown: false,
}

const NEW_USER_VALUE = {
  id: null,
  name: '',
  permissions: [],
}

function Users() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.USERS
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

  const [searchQuery, setSearchQuery] = React.useState('')

  const [sideSheet, setSideSheet] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    SIDE_SHEET_DEFAULT,
  )

  const serializeItem = React.useCallback(item => {
    const editSideSheet = () => {
      setSideSheet({
        value: JSON.parse(JSON.stringify(item)),
        isShown: true,
      })
    }
    const avatarCell = {
      value: <Avatar src={item.avatar} name={item.name} size={32} />,
      style: {
        padding: '4px 0px',
        textAlign: 'center',
      },
    }

    return {
      id: item.id,
      isDisabled: Boolean(item.returned),
      cells: [avatarCell, item.name, item?._group?.name, item.phone, item.note],
      onDoubleClick: editSideSheet,
      optionsMenu: (
        <Popover
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item onSelect={editSideSheet} icon={EditIcon}>
                  Edit
                </Menu.Item>
              </Menu.Group>
            </Menu>
          }
          position={Position.BOTTOM_RIGHT}
        >
          <IconButton icon={MoreIcon} height={24} appearance="minimal" />
        </Popover>
      ),
    }
  }, [])

  const isItemLoaded = React.useCallback(
    index => {
      return !loadedItems.hasNextPage || !!loadedItems.items[index]
    },
    [loadedItems.hasNextPage, loadedItems.items],
  )

  const fetchItems = React.useCallback(
    ({lastKey, searchQuery = ''}: any) => {
      const queryFetch = makeCancellablePromise(
        db.getRows({
          storeName: SN.USERS,
          indexName: IN.NAME,
          limit: FETCH_ITEM_LIMIT,
          lastKey,
          filterBy: 'consist',
          filterParams: {searchQuery},
        }),
      )
      queryFetch.then((newItems: any) => {
        if (!newItems) {
          return
        }

        const newItemsSerialized = newItems.map(serializeItem)
        setLoadedItems({
          hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
          items: [...(lastKey ? itemsRef.current : []), ...newItemsSerialized],
          lastKey: newItems.length && newItems[newItems.length - 1].name,
        })
      })
    },
    [makeCancellablePromise, db, serializeItem],
  )

  const {lastKey} = loadedItems

  const loadMoreItems = React.useCallback(() => {
    fetchItems({lastKey, searchQuery})
  }, [fetchItems, lastKey, searchQuery])

  React.useEffect(() => {
    fetchItems({searchQuery})
  }, [fetchItems, searchQuery])

  const handleSearchQuery = React.useCallback(
    (value: string) => {
      setSearchQuery(value)
    },
    [setSearchQuery],
  )

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const handleUpdateUser = React.useCallback(
    updateUser => {
      db.sendEvent({
        type: PUT_USER,
        payload: updateUser,
        consumer: 'client',
      }).then((result: any) => {
        if (!result) {
          return
        }

        const items = itemsRef.current

        if (!updateUser.id) {
          items.push(serializeItem(result))
        } else {
          const foundIndex = items.findIndex((x: any) => x.id === result.id)
          items[foundIndex] = serializeItem(result)
        }

        setLoadedItems({items: [...items]})
        setTimeout(() => setSideSheet({isShown: false}))
      })
    },
    [db, serializeItem],
  )

  const handleNewGroupClick = React.useCallback(
    () => setSideSheet({isShown: true, value: NEW_USER_VALUE}),
    [],
  )

  const columns = React.useMemo(() => {
    const {COLUMNS} = PAGE_CONST.TABLE
    return [
      {label: '', width: 70},
      {label: COLUMNS.NAME.TITLE, width: COLUMNS.NAME.WIDTH, canGrow: true},
      {label: COLUMNS.GROUP.TITLE, width: COLUMNS.GROUP.WIDTH},
      {label: COLUMNS.PHONE_NUMBER.TITLE, width: COLUMNS.PHONE_NUMBER.WIDTH},
      {label: COLUMNS.NOTE.TITLE, width: COLUMNS.NOTE.WIDTH, canGrow: true},
      {label: 'OPTIONS', width: 50},
    ]
  }, [PAGE_CONST])

  return (
    <PageWrapper>
      <ControlWrapper>
        <SearchInput
          width={250}
          placeholder={PAGE_CONST.CONTROLS.SEARCH_PLACEHOLDER}
          value={searchQuery}
          handleSearchQuery={handleSearchQuery}
        />
        <Button
          height={20}
          marginLeft={SPACING}
          appearance="primary"
          intent="success"
          iconBefore={AddIcon}
          onClick={handleNewGroupClick}
        >
          {PAGE_CONST.CONTROLS.ADD_USER.BUTTON_TITLE}
        </Button>
      </ControlWrapper>
      <Pane flex={1}>
        <Table
          columns={columns}
          rows={loadedItems.items}
          hasNextPage={loadedItems.hasNextPage}
          isItemLoaded={isItemLoaded}
          loadMoreItems={loadMoreItems}
        />
      </Pane>
      {sideSheet.value && (
        <UpdateUser
          sideSheet={sideSheet}
          handleUpdateUser={handleUpdateUser}
          onCloseComplete={handleSlideSheetCloseComplete}
        />
      )}
    </PageWrapper>
  )
}

export default withErrorBoundary(Users)
