import React from 'react'
import {Button, Pane, Dialog} from 'evergreen-ui'
import CartsTabs from './CartsTabs'
import GlobalContext from '../../contexts/globalContext'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import CartParticipants from './CartParticipants'

const TABS = {
  selectedCartId: null,
  tabs: [],
}

export default function CartsDialog({isShown, setIsShown}: any) {
  const {worker} = React.useContext(GlobalContext)
  // @ts-ignore
  const [state, setState] = React.useReducer((s, v) => ({...s, ...v}), TABS)

  const {selectedCartId, currentCartSum, tabs} = state

  const fetchComputedCartSum = React.useCallback(() => {
    worker
      .perform({
        storeName: SN.SALES,
        action: 'computeCartSum',
        params: {__cartId__: selectedCartId},
      })
      .then((cartSum: number) => setState({currentCartSum: cartSum}))
  }, [worker, selectedCartId])

  const sideOffset = 16 * 4

  const footerWidth = `calc(100vw - ${sideOffset}px)`

  return (
    <Dialog
      isShown={isShown}
      title="Carts"
      onCloseComplete={() => setIsShown(false)}
      width="100%"
      footer={() => {
        return (
          <>
            <Pane
              display="flex"
              justifyContent="space-between"
              width={footerWidth}
            >
              <Pane display="flex">
                {selectedCartId && (
                  <CartParticipants
                    key={selectedCartId}
                    selectedCartId={selectedCartId}
                  />
                )}
              </Pane>

              <Pane>
                {Boolean(tabs.length) && currentCartSum > 0 && (
                  <span>
                    <b>Total Sum:</b> {currentCartSum}
                  </span>
                )}
                <Button tabIndex={0} marginLeft={8} appearance="primary">
                  Confirm
                </Button>
              </Pane>
            </Pane>
          </>
        )
      }}
    >
      <CartsTabs
        state={state}
        setState={setState}
        fetchComputedCartSum={fetchComputedCartSum}
      />
    </Dialog>
  )
}
