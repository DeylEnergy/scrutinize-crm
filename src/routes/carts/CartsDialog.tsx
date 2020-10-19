import React from 'react'
import {Dialog} from 'evergreen-ui'
import CartsTabs from './CartsTabs'
import {useDatabase} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import CheckoutDialog from './CheckoutDialog'
import CartsFooter from './CartsFooter'

const TABS = {
  selectedCartId: null,
  tabs: [],
}

export default function CartsDialog({isShown, setIsShown}: any) {
  const db = useDatabase()
  // @ts-ignore
  const [state, setState] = React.useReducer((s, v) => ({...s, ...v}), TABS)

  const {selectedCartId, currentCartSum, tabs} = state

  const [isCheckoutDialogShown, setIsCheckoutDialogShown] = React.useState(
    false,
  )

  const openCheckoutDialog = React.useCallback(() => {
    setIsCheckoutDialogShown(true)
  }, [])

  const closeCheckoutDialog = React.useCallback(() => {
    setIsCheckoutDialogShown(false)
  }, [])

  const handleCheckoutSuccess = React.useCallback(() => {
    const updatedCarts = tabs.filter((x: any) => x.cartId !== selectedCartId)
    let updatedSelectedCartId = null
    if (updatedCarts.length) {
      updatedSelectedCartId = updatedCarts[0].cartId
    }

    setState({
      selectedCartId: updatedSelectedCartId,
      tabs: updatedCarts,
    })
    setTimeout(closeCheckoutDialog, 500)
  }, [selectedCartId, tabs])

  const fetchComputedCartSum = React.useCallback(() => {
    db.perform({
      storeName: SN.SALES,
      action: 'computeCartSum',
      params: {__cartId__: selectedCartId},
    }).then((cartSum: number) => setState({currentCartSum: cartSum}))
  }, [db, selectedCartId])

  return (
    <>
      <Dialog
        isShown={isShown}
        title="Carts"
        onCloseComplete={() => setIsShown(false)}
        width="100%"
        footer={
          <CartsFooter
            selectedCartId={selectedCartId}
            tabs={tabs}
            currentCartSum={currentCartSum}
            openCheckoutDialog={openCheckoutDialog}
          />
        }
      >
        <CartsTabs
          state={state}
          setState={setState}
          fetchComputedCartSum={fetchComputedCartSum}
        />
      </Dialog>
      <CheckoutDialog
        isShown={isCheckoutDialogShown}
        handleClose={closeCheckoutDialog}
        handleCheckoutSuccess={handleCheckoutSuccess}
        totalSum={currentCartSum}
        cartId={selectedCartId}
      />
    </>
  )
}
