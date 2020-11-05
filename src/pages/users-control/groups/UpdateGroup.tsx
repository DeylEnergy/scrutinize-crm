import React from 'react'
import {Pane, Heading, Checkbox} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {SPACING} from '../../../constants'
import RIGHTS from '../../../constants/rights'
import {useLocale} from '../../../utilities'

function UpdateGroup({sideSheet, onCloseComplete, handleUpdateGroup}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.USER_GROUPS
  const {DRAWER} = PAGE_CONST

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

  const permissionsList = React.useMemo(() => {
    const {PERMISSIONS} = DRAWER

    const PRODUCT_PERMISSIONS = [
      [RIGHTS.CAN_SEE_PRODUCTS, PERMISSIONS.PRODUCTS.CAN_SEE_PRODUCTS],
      [RIGHTS.CAN_EDIT_PRODUCTS, PERMISSIONS.PRODUCTS.CAN_EDIT_PRODUCTS],
    ]

    const TO_BUY_LIST_PERMISSIONS = [
      [RIGHTS.CAN_SEE_TO_BUY_LIST, PERMISSIONS.TO_BUY_LIST.CAN_SEE_TO_BUY_LIST],
      [
        RIGHTS.CAN_EDIT_ITEMS_IN_TO_BUY_LIST,
        PERMISSIONS.TO_BUY_LIST.CAN_EDIT_ITEMS_IN_TO_BUY_LIST,
      ],
      [
        RIGHTS.CAN_ADD_ITEM_TO_BUY_LIST,
        PERMISSIONS.TO_BUY_LIST.CAN_ADD_ITEM_TO_BUY_LIST,
      ],
      [
        RIGHTS.CAN_PRINT_TO_BUY_LIST,
        PERMISSIONS.TO_BUY_LIST.CAN_PRINT_TO_BUY_LIST,
      ],
      [
        RIGHTS.CAN_COMPLETE_TO_BUY_LIST,
        PERMISSIONS.TO_BUY_LIST.CAN_COMPLETE_TO_BUY_LIST,
      ],
    ]

    const ACQUISITIONS_PERMISSIONS = [
      [
        RIGHTS.CAN_SEE_ACQUISITIONS,
        PERMISSIONS.ACQUISITIONS.CAN_SEE_ACQUISITIONS,
      ],
    ]

    const SALES_PERMISSIONS = [
      [RIGHTS.CAN_SEE_SALES, PERMISSIONS.SALES.CAN_SEE_SALES],
      [RIGHTS.CAN_RETURN_SALES_ITEMS, PERMISSIONS.SALES.CAN_RETURN_SALES_ITEMS],
    ]

    const USERS_PERMISSIONS = [
      [RIGHTS.CAN_SEE_USERS, PERMISSIONS.USERS.CAN_SEE_USERS],
      [RIGHTS.CAN_SEE_USER_PROFILE, PERMISSIONS.USERS.CAN_SEE_USER_PROFILE],
      [
        RIGHTS.CAN_SEE_OTHER_USER_SECRET_KEYS,
        PERMISSIONS.USERS.CAN_SEE_OTHER_USER_SECRET_KEYS,
      ],
    ]

    const USERS_GROUP = [
      [RIGHTS.CAN_SEE_USERS_GROUP, PERMISSIONS.USER_GROUPS.CAN_SEE_USER_GROUPS],
    ]

    const STATS_PERMISSIONS = [
      [RIGHTS.CAN_SEE_STATS, PERMISSIONS.STATS.CAN_SEE_STATS],
    ]

    const CARTS_PERMISSIONS = [
      [RIGHTS.CAN_SEE_CARTS, PERMISSIONS.CARTS.CAN_SEE_CARTS],
    ]

    const CASHBOX_PERMISSIONS = [
      [RIGHTS.CAN_SEE_CASHBOX, PERMISSIONS.CASHBOX.CAN_SEE_CASHBOX],
      [
        RIGHTS.CAN_PERFORM_CASHBOX_OPERATIONS,
        PERMISSIONS.CASHBOX.CAN_PERFORM_CASHBOX_OPERATIONS,
      ],
    ]

    return [
      ...PRODUCT_PERMISSIONS,
      ...TO_BUY_LIST_PERMISSIONS,
      ...ACQUISITIONS_PERMISSIONS,
      ...SALES_PERMISSIONS,
      ...USERS_PERMISSIONS,
      ...USERS_GROUP,
      ...STATS_PERMISSIONS,
      ...CARTS_PERMISSIONS,
      ...CASHBOX_PERMISSIONS,
    ]
  }, [DRAWER])

  return (
    <SideSheet
      title={groupExists ? DRAWER.TITLE_EDIT_GROUP : DRAWER.TITLE_NEW_GROUP}
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onCloseComplete={onCloseComplete}
      canSave={true}
    >
      <TextInputField
        value={name}
        onChange={handleName}
        label={DRAWER.INPUTS.GROUP_NAME}
        placeholder={`${DRAWER.INPUTS.GROUP_NAME}...`}
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
        {permissionsList.map(([value, label]: any) => (
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
