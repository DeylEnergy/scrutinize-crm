import React from 'react'
import {Pane, Heading, Checkbox} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {SPACING} from '../../../constants'
import RIGHTS from '../../../constants/rights'

const PRODUCT_PERMISSIONS = [
  [RIGHTS.CAN_SEE_PRODUCTS, 'Can see products'],
  [RIGHTS.CAN_EDIT_PRODUCTS, 'Can edit products'],
]

const TO_BUY_LIST_PERMISSIONS = [
  [RIGHTS.CAN_SEE_TO_BUY_LIST, 'Can see to buy list'],
  [RIGHTS.CAN_EDIT_ITEMS_IN_TO_BUY_LIST, 'Can edit items in to buy list'],
  [RIGHTS.CAN_ADD_ITEM_TO_BUY_LIST, 'Can add items to buy list'],
  [RIGHTS.CAN_PRINT_TO_BUY_LIST, 'Can print to buy list'],
  [RIGHTS.CAN_COMPLETE_TO_BUY_LIST, 'Can process to buy list'],
]

const ACQUISITIONS_PERMISSIONS = [
  [RIGHTS.CAN_SEE_ACQUISITIONS, 'Can see acquisitions'],
]

const SALES_PERMISSIONS = [
  [RIGHTS.CAN_SEE_SALES, 'Can see sales'],
  [RIGHTS.CAN_RETURN_SALES_ITEMS, 'Can return sales items'],
]

const USERS_PERMISSIONS = [
  [RIGHTS.CAN_SEE_USERS, 'Can see users'],
  [RIGHTS.CAN_SEE_USER_PROFILE, 'Can see user profile'],
]

const USERS_GROUP = [[RIGHTS.CAN_SEE_USERS_GROUP, 'Can see users group']]

const STATS_PERMISSIONS = [[RIGHTS.CAN_SEE_STATS, 'Can see statistics']]

const CARTS_PERMISSIONS = [[RIGHTS.CAN_SEE_CARTS, 'Can see carts']]

const STICKERS_MANAGER_PERMISSIONS = [
  [RIGHTS.CAN_SEE_STICKERS_MANAGER, 'Can see stickers manager'],
]

const PERMISSIONS = [
  ...PRODUCT_PERMISSIONS,
  ...TO_BUY_LIST_PERMISSIONS,
  ...ACQUISITIONS_PERMISSIONS,
  ...SALES_PERMISSIONS,
  ...USERS_PERMISSIONS,
  ...USERS_GROUP,
  ...STATS_PERMISSIONS,
  ...CARTS_PERMISSIONS,
  ...STICKERS_MANAGER_PERMISSIONS,
]

function UpdateGroup({sideSheet, onCloseComplete, handleUpdateGroup}: any) {
  const doc = sideSheet.value

  const [name, setName] = React.useState(doc.name)

  const [permissions, setPermissions] = React.useState(doc.permissions)

  const handleName = React.useCallback(
    (value: string) => {
      setName(value)
    },
    [setName],
  )

  const saveChanges = React.useCallback(() => {
    handleUpdateGroup({id: doc.id, name, permissions})
  }, [handleUpdateGroup, doc.id, name, permissions])

  const groupExists = Boolean(doc.id)

  return (
    <SideSheet
      title={groupExists ? 'Edit group' : 'Add group'}
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onCloseComplete={onCloseComplete}
      canSave={true}
    >
      <TextInputField
        value={name}
        onChange={handleName}
        label="Group name"
        placeholder="Group name..."
        required
      />
      <Heading
        size={400}
        fontWeight={500}
        color="#425A70"
        marginTop="default"
        marginBottom={-SPACING}
      >
        Permissions
      </Heading>
      <Pane padding={SPACING / 2} paddingTop={0}>
        {PERMISSIONS.map(([value, label]: any) => (
          <Checkbox
            key={value}
            label={label}
            checked={permissions.includes(value)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const isGranted = !e.target.checked
              let updatedPermissions
              if (isGranted) {
                updatedPermissions = permissions.filter((x: any) => x !== value)
              } else {
                updatedPermissions = [...permissions, value]
              }
              setPermissions(updatedPermissions)
            }}
          />
        ))}
      </Pane>
    </SideSheet>
  )
}

export default React.memo(UpdateGroup)
