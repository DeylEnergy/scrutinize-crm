import React from 'react'
import {Dialog} from 'evergreen-ui'
import CartsTabs from './CartsTabs'
import {
  useLocale,
  useDatabase,
  useCancellablePromise,
  getTestId,
} from '../../utilities'
import {SPACING, STORE_NAME as SN} from '../../constants'
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

  const makeCancellablePromise = useCancellablePromise()

  // @ts-ignore
  const [state, setState] = React.useReducer((s, v) => ({...s, ...v}), TABS)

  const {selectedCartId, currentCartSum, tabs} = state

  const [isCheckoutDialogShown, setIsCheckoutDialogShown] = React.useState(
    false,
  )

  const [isDialogOpenCompleted, setIsDialogOpenCompleted] = React.useState(
    false,
  )

  const handleOpenCompleted = React.useCallback(() => {
    setIsDialogOpenCompleted(true)
  }, [setIsDialogOpenCompleted])

  const handleCloseComplete = React.useCallback(() => {
    setIsShown(false)
    setIsDialogOpenCompleted(false)
  }, [setIsShown, setIsDialogOpenCompleted])

  const handleCheckoutOpen = React.useCallback(() => {
    setIsCheckoutDialogShown(true)
  }, [])

  const handleCheckoutClose = React.useCallback(() => {
    setIsCheckoutDialogShown(false)
    setState({currentCartSum: 0})
  }, [])

  const handleDialogTabSwitch = React.useCallback(() => {
    setState({
      selectedCartId: tabs?.[0]?.cartId,
    })
  }, [tabs, setState])

  const handleCheckoutSuccess = React.useCallback(() => {
    const updatedCarts = tabs.filter((x: any) => x.cartId !== selectedCartId)
    setState({
      tabs: updatedCarts,
    })
    handleCheckoutClose()
  }, [selectedCartId, tabs, handleCheckoutClose])

  const fetchComputedCartSum = React.useCallback(() => {
    const performedFetch = makeCancellablePromise(
      db.perform({
        storeName: SN.SALES,
        action: 'computeCartSum',
        params: {__cartId__: selectedCartId},
      }),
    )

    // @ts-ignore
    performedFetch.then((cartSum: number) =>
      setState({currentCartSum: cartSum}),
    )
  }, [makeCancellablePromise, db, selectedCartId])

  return (
    <>
      <Dialog
        shouldCloseOnOverlayClick={false}
        isShown={isShown}
        title={DIALOG.TITLE}
        onOpenComplete={handleOpenCompleted}
        onCloseComplete={handleCloseComplete}
        width="100%"
        footer={
          <CartsFooter
            selectedCartId={selectedCartId}
            tabs={tabs}
            currentCartSum={currentCartSum}
            handleCheckoutOpen={handleCheckoutOpen}
          />
        }
        contentContainerProps={{paddingTop: SPACING * 1.5}}
        // @ts-ignore
        overlayProps={{...getTestId('carts-dialog')}}
      >
        <CartsTabs
          state={state}
          setState={setState}
          fetchComputedCartSum={fetchComputedCartSum}
          isDialogOpenCompleted={isDialogOpenCompleted}
        />
      </Dialog>
      <CheckoutDialog
        key={selectedCartId}
        isShown={isCheckoutDialogShown}
        handleCheckoutClose={handleCheckoutClose}
        handleDialogTabSwitch={handleDialogTabSwitch}
        handleCheckoutSuccess={handleCheckoutSuccess}
        totalSum={currentCartSum}
        cartId={selectedCartId}
      />
    </>
  )
}
