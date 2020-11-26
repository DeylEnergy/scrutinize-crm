import React from 'react'
import {Button, FollowerIcon, FollowingIcon} from 'evergreen-ui'
import AsyncSelectMenu from '../../components/AsyncSelectMenu'
import {useLocale, useDatabase, handleAsync} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import SelectCustomer from './SelectCustomer'

function CartParticipants({selectedCartId}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS
  const {CONTROLS} = PAGE_CONST
  const db = useDatabase()
  const [hasLoaded, setHasLoaded] = React.useState(false)
  const [cartParticipants, setCartParticipants] = React.useReducer(
    // @ts-ignore
    (s, v) => ({
      ...s,
      ...v,
    }),
    {},
  )

  React.useEffect(() => {
    db.perform({
      storeName: SN.SALES,
      action: 'getCartParticipants',
      params: {cartId: selectedCartId},
    }).then(({_user, _userId, _customer, _customerId}: any) => {
      setHasLoaded(true)
      setCartParticipants({
        _userName: _user?.name,
        _userId,
        _customerName: _customer?.name,
        _customerId,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db])

  const updateCartParticipants = React.useCallback(
    (updatedParticipant: any) => {
      return db.sendEvent({
        type: 'putCartParticipants',
        payload: {
          __cartId__: selectedCartId,
          ...updatedParticipant,
        },
      })
    },
    [db, selectedCartId],
  )

  const handleUserSelect = React.useCallback(
    async ({value, label}: any) => {
      const [, error] = await handleAsync(
        updateCartParticipants({_userId: value}),
      )

      if (!error) {
        setCartParticipants({_userId: value, _userName: label})
      }
    },
    [updateCartParticipants],
  )

  const handleCustomerSelect = React.useCallback(
    async ({value, label}: any) => {
      const [, error] = await handleAsync(
        updateCartParticipants({_customerId: value}),
      )

      if (!error) {
        setCartParticipants({
          _customerId: value,
          _customerName: label,
        })
      }
    },
    [updateCartParticipants],
  )

  const salespersonButton = React.useMemo(() => {
    return (
      <Button
        appearance="minimal"
        style={{marginRight: 8}}
        iconBefore={FollowerIcon}
      >
        {cartParticipants?._userName || CONTROLS.SALESPERSON.BUTTON_TITLE}
      </Button>
    )
  }, [CONTROLS, cartParticipants])

  const customerButton = React.useMemo(() => {
    return (
      <Button appearance="minimal" iconBefore={FollowingIcon} intent="warning">
        {cartParticipants?._customerName || CONTROLS.CUSTOMER.BUTTON_TITLE}
      </Button>
    )
  }, [CONTROLS, cartParticipants])

  if (!hasLoaded) {
    return null
  }

  return (
    <>
      <AsyncSelectMenu
        selected={cartParticipants._userId}
        title={CONTROLS.SALESPERSON.POPOVER_TITLE}
        onSelect={handleUserSelect}
        storeName={SN.USERS}
      >
        {salespersonButton}
      </AsyncSelectMenu>
      <SelectCustomer
        customerId={cartParticipants._customerId}
        handleCustomerSelect={handleCustomerSelect}
        storeName={SN.CUSTOMERS}
      >
        {customerButton}
      </SelectCustomer>
    </>
  )
}

export default React.memo(CartParticipants)
