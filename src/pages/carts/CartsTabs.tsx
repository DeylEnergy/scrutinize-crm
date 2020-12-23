import React from 'react'
import {Pane, Tab, AddIcon} from 'evergreen-ui'
import {v4 as uuidv4} from 'uuid'
import Block from '../../components/Block'
import Cart from './Cart'
import {
  useLocale,
  useDatabase,
  useAccount,
  useCancellablePromise,
  getTestId,
} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN, SPACING} from '../../constants'
import {ADD_CART} from '../../constants/events'
import {
  TabsControlsWrapper,
  ControlButtonsWrapper,
  FreeWidthTaker,
  HorizontallyScrollable,
} from '../../layouts'

export default function CartsTabs({
  state,
  setState,
  fetchComputedCartSum,
  isDialogOpenCompleted,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS
  const {CARTS_LIST, ADD_NEW_CART} = PAGE_CONST.CONTROLS

  const [{user}] = useAccount()

  const db = useDatabase()

  const makeCancellablePromise = useCancellablePromise()

  const {tabs, selectedCartId} = state

  const [controlPanel, setControlPanel] = React.useState<any>()

  const horizontallyScrollableRef = React.useRef<HTMLDivElement | null>(null)

  const excludeCart = React.useCallback((tabs: any, selectedCartId: string) => {
    const updatedTabs = tabs.filter((x: any) => x.cartId !== selectedCartId)

    let updatedSelectedCartId = null
    if (updatedTabs.length) {
      const currentFocusIndex = tabs.findIndex(
        (x: any) => x.cartId === selectedCartId,
      )

      let nextFocusIndex = currentFocusIndex - 1

      if (currentFocusIndex === 0) {
        nextFocusIndex = 0
      }

      updatedSelectedCartId = updatedTabs[nextFocusIndex].cartId
    }

    return {selectedCartId: updatedSelectedCartId, tabs: updatedTabs}
  }, [])

  const handleNewCart = React.useCallback(() => {
    const lastTabId = tabs.length

    const datetime = Date.now()
    const uId = uuidv4()
    const cartId = `${datetime}_${uId}`
    const updatedTabs = [
      ...tabs,
      {
        cartId,
        label: `${CARTS_LIST.CART_TITLE} #${lastTabId + 1}`,
      },
    ]
    setState({
      selectedCartId: cartId,
      tabs: updatedTabs,
    })

    db.sendEvent({
      type: ADD_CART,
      payload: {
        activeCartId: cartId,
        userId: user.id,
      },
    }).then((result: any) => {
      if (result) {
        if (horizontallyScrollableRef.current) {
          horizontallyScrollableRef.current.scrollTo(
            horizontallyScrollableRef.current.scrollWidth,
            0,
          )
        }

        return
      }

      // highly unlikely, though in case db rejected new cart
      setTimeout(() => {
        const stateUpdate = excludeCart(updatedTabs, cartId)
        setState(stateUpdate)
      }, 1000)
    })
  }, [tabs, CARTS_LIST, setState, db, user.id, excludeCart])

  const completeCartDelete = React.useCallback(() => {
    const stateUpdate = excludeCart(tabs, selectedCartId)
    setState(stateUpdate)
  }, [excludeCart, tabs, selectedCartId, setState])

  React.useEffect(() => {
    const queryFetch = makeCancellablePromise(
      db.getRows({
        storeName: SN.SALES,
        indexName: IN.ACTIVE_CART_ID,
        format: 'cartIds',
        dataCollecting: false,
      }),
    )

    queryFetch.then((rows: any) => {
      setState({
        selectedCartId: rows[0],
        tabs: rows.map((cartId: string, index: number) => ({
          label: `${CARTS_LIST.CART_TITLE} #${index + 1}`,
          cartId,
        })),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Block ratio={0}>
      <Pane height="100%" display="flex" flexDirection="column">
        <TabsControlsWrapper>
          <HorizontallyScrollable ref={horizontallyScrollableRef}>
            {tabs.map(({label, cartId}: any) => (
              <Tab
                key={label}
                id={label}
                onSelect={() => {
                  setState({selectedCartId: cartId})
                }}
                isSelected={cartId === state.selectedCartId}
                aria-controls={`panel-${label}`}
                flexShrink={0}
              >
                {label}
              </Tab>
            ))}
          </HorizontallyScrollable>
          <ControlButtonsWrapper>
            <Tab
              onSelect={handleNewCart}
              marginLeft={0}
              {...getTestId('add-new-cart')}
            >
              <AddIcon color="green" marginRight={SPACING / 2} />{' '}
              {ADD_NEW_CART.TITLE}
            </Tab>
          </ControlButtonsWrapper>
          <FreeWidthTaker />
          <ControlButtonsWrapper>{controlPanel}</ControlButtonsWrapper>
        </TabsControlsWrapper>
        <Pane role="tabpanel" height="calc(100vh - 54vh)">
          {isDialogOpenCompleted && state.selectedCartId && (
            <Cart
              key={state.selectedCartId}
              cartId={state.selectedCartId}
              fetchComputedCartSum={fetchComputedCartSum}
              completeCartDelete={completeCartDelete}
              setControlPanel={setControlPanel}
            />
          )}
        </Pane>
      </Pane>
    </Block>
  )
}
