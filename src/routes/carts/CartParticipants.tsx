import React from 'react'
import {Button, Pane, FollowerIcon, FollowingIcon} from 'evergreen-ui'
import AsyncSelectMenu from '../../components/AsyncSelectMenu'
import {handleAsync} from '../../utilities'
import GlobalContext from '../../contexts/globalContext'
import {STORE_NAME as SN} from '../../constants'

function CartParticipants({selectedCartId}: any) {
  const {worker} = React.useContext(GlobalContext)
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
    worker
      .perform({
        storeName: SN.SALES,
        action: 'getCartParticipants',
        params: {cartId: selectedCartId},
      })
      .then(({_user, _userId, _customer, _customerId}: any) => {
        setHasLoaded(true)
        setCartParticipants({
          _userName: _user?.name,
          _userId,
          _customerName: _customer?.name,
          _customerId,
        })
      })
  }, [])

  const updateCartParticipants = React.useCallback(
    (updatedParticipant: any) => {
      return worker.sendEvent({
        type: 'putCartParticipants',
        payload: {
          __cartId__: selectedCartId,
          ...updatedParticipant,
        },
      })
    },
    [selectedCartId],
  )

  const handleUserSelect = React.useCallback(async ({value, label}: any) => {
    const [, error] = await handleAsync(
      updateCartParticipants({_userId: value}),
    )

    if (!error) {
      setCartParticipants({_userId: value, _userName: label})
    }
  }, [])

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
    [],
  )

  const salespersonButton = React.useMemo(() => {
    return (
      <Button
        appearance="minimal"
        style={{marginRight: 8}}
        iconBefore={FollowerIcon}
      >
        {cartParticipants?._userName || 'Salesperson'}
      </Button>
    )
  }, [cartParticipants?._userName])

  const customerButton = React.useMemo(() => {
    return (
      <Button appearance="minimal" iconBefore={FollowingIcon} intent="warning">
        {cartParticipants?._customerName || 'Customer'}
      </Button>
    )
  }, [cartParticipants?._customerName])

  if (!hasLoaded) {
    return null
  }

  return (
    <>
      <AsyncSelectMenu
        selected={cartParticipants._userId}
        title="Select Salesperson"
        onSelect={handleUserSelect}
        storeName={SN.USERS}
      >
        {salespersonButton}
      </AsyncSelectMenu>
      <AsyncSelectMenu
        selected={cartParticipants._customerId}
        title="Select Customer"
        onSelect={handleCustomerSelect}
        storeName={SN.CUSTOMERS}
      >
        {customerButton}
      </AsyncSelectMenu>
    </>
  )
}

export default React.memo(CartParticipants)
