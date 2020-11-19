import React from 'react'
import {Dialog} from 'evergreen-ui'
import CartsTabs from './CartsTabs'
import {useLocale, useDatabase} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import CheckoutDialog from './CheckoutDialog'
import CartsFooter from './CartsFooter'

const TABS = {
  selectedCartId: null,
  tabs: [],
}

export default function CartsDialog({isShown, setIsShown}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS
  const {DIALOG} = PAGE_CONST

  const db = useDatabase()
  // @ts-ignore
  const [state, setState] = React.useReducer((s, v) => ({...s, ...v}), TABS)

  const {selectedCartId, currentCartSum, tabs} = state

  const [isCheckoutDialogShown, setIsCheckoutDialogShown] = React.useState(
    false,
  )

  const handleCheckoutOpen = React.useCallback(() => {
    setIsCheckoutDialogShown(true)
  }, [])

  const handleCheckoutCompleteClose = React.useCallback(() => {
    setState({
      selectedCartId: tabs?.[0]?.cartId,
    })
  }, [tabs, setState])

  const handleCheckoutSuccess = React.useCallback(() => {
    const updatedCarts = tabs.filter((x: any) => x.cartId !== selectedCartId)
    setState({
      tabs: updatedCarts,
    })
    setIsCheckoutDialogShown(false)
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
        shouldCloseOnOverlayClick={false}
        isShown={isShown}
        title={DIALOG.TITLE}
        onCloseComplete={() => setIsShown(false)}
        width="100%"
        footer={
          <CartsFooter
            selectedCartId={selectedCartId}
            tabs={tabs}
            currentCartSum={currentCartSum}
            handleCheckoutOpen={handleCheckoutOpen}
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
        key={selectedCartId}
        isShown={isCheckoutDialogShown}
        handleCheckoutCompleteClose={handleCheckoutCompleteClose}
        handleCheckoutSuccess={handleCheckoutSuccess}
        totalSum={currentCartSum}
        cartId={selectedCartId}
      />
    </>
  )
}
