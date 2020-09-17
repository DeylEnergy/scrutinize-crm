import React from 'react'
import {Pane, Heading, Checkbox} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {SPACING} from '../../../constants'

const PRODUCT_PERMISSIONS = [
  ['canSeeProducts', 'Can see products'],
  ['canEditProducts', 'Can edit products'],
]

const TO_BUY_LIST_PERMISSIONS = [
  ['canSeeToBuyList', 'Can see to buy list'],
  ['canEditItemsInToBuyItems', 'Can edit items in to buy list'],
  ['canAddItemToBuyList', 'Can add items to buy list'],
  ['canPrintToBuyList', 'Can print to buy list'],
  ['canCompleteToBuyList', 'Can process to buy list'],
]

const ACQUISITIONS_PERMISSIONS = [
  ['canSeeAcquisitions', 'Can see acquisitions'],
]

const SALES_PERMISSIONS = [
  ['canSeeSales', 'Can see sales'],
  ['canReturnSalesItems', 'Can return sales items'],
]

const USERS_PERMISSIONS = [['canSeeUsers', 'Can see users']]

const USERS_GROUP = [['canSeeUsersGroup', 'Can see users group']]

const PERMISSIONS = [
  ...PRODUCT_PERMISSIONS,
  ...TO_BUY_LIST_PERMISSIONS,
  ...ACQUISITIONS_PERMISSIONS,
  ...SALES_PERMISSIONS,
  ...USERS_PERMISSIONS,
  ...USERS_GROUP,
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
