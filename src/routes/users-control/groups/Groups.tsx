import React from 'react'
import {
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
import Table from '../../../components/Table'
import {STORE_NAME as SN} from '../../../constants'
import {useAccount, useDatabase, withErrorBoundary} from '../../../utilities'
import {PageWrapper, ControlWrapper} from '../../../layouts'
import UpdateGroup from './UpdateGroup'
import {PUT_GROUP} from '../../../constants/events'

const columns = [
  {label: 'Group Name', width: 200},
  {label: 'OPTIONS', width: 50},
]

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

const NEW_GROUP_VALUE = {
  id: null,
  name: '',
  permissions: [],
}

function Groups() {
  const [account, setAccount] = useAccount()
  const db = useDatabase()
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

    return {
      id: item.id,
      cells: [item.name],
      onDoubleClick: editSideSheet,
      optionsMenu: (
        <Popover
          content={
            <Menu>
              <Menu.Group>
                <Menu.Item onSelect={() => {}} icon={EditIcon}>
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

  const loadMoreItems = React.useCallback(() => {
    db.getRows({
      storeName: SN.GROUPS,
      limit: FETCH_ITEM_LIMIT,
    }).then((newItems: any) => {
      if (!newItems) {
        return
      }

      const newItemsSerialized = newItems.map(serializeItem)
      setLoadedItems({
        hasNextPage: FETCH_ITEM_LIMIT === newItems.length,
        items: [...loadedItems.items, ...newItemsSerialized],
        lastKey: newItems.length && newItems[newItems.length - 1].id,
      })
    })
  }, [loadedItems.items, db, serializeItem])

  const handleNewGroupClick = React.useCallback(
    () => setSideSheet({isShown: true, value: NEW_GROUP_VALUE}),
    [],
  )

  const handleSlideSheetCloseComplete = React.useCallback(() => {
    setSideSheet(SIDE_SHEET_DEFAULT)
  }, [])

  const handleUpdateGroup = React.useCallback(
    updatedGroup => {
      db.sendEvent({
        type: PUT_GROUP,
        payload: updatedGroup,
        consumer: 'client',
      }).then((result: any) => {
        if (!result) {
          return
        }

        if (updatedGroup.id === account.groupId) {
          setAccount({
            groupName: updatedGroup.name,
            permissions: updatedGroup.permissions,
          })
        }

        const items = itemsRef.current

        if (!updatedGroup.id) {
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

  return (
    <PageWrapper>
      <ControlWrapper>
        <Button
          height={20}
          appearance="primary"
          intent="success"
          iconBefore={AddIcon}
          onClick={handleNewGroupClick}
        >
          Add
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
        <UpdateGroup
          sideSheet={sideSheet}
          handleUpdateGroup={handleUpdateGroup}
          onCloseComplete={handleSlideSheetCloseComplete}
        />
      )}
    </PageWrapper>
  )
}

export default withErrorBoundary(Groups)
