import React from 'react'
import {Pane, Tablist, Tab, AddIcon} from 'evergreen-ui'
import {v4 as uuidv4} from 'uuid'
import Block from '../../components/Block'
import Cart from './Cart'
import {useLocale, useDatabase, useAccount} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'
import {ADD_CART} from '../../constants/events'

export default function CartsTabs({
  state,
  setState,
  fetchComputedCartSum,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS
  const {CARTS_LIST} = PAGE_CONST.CONTROLS

  const [{user}] = useAccount()

  const db = useDatabase()

  const {tabs, selectedCartId} = state

  const excludeCart = React.useCallback((tabs: any, selectedCartId: string) => {
    const updatedTabs = tabs.filter((x: any) => x.cartId !== selectedCartId)

    let updatedSelectedCartId = null
    if (updatedTabs.length) {
      updatedSelectedCartId = updatedTabs[updatedTabs.length - 1].cartId
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
        return
      }

      // highly unlikely, though in case db rejected new cart
      setTimeout(() => {
        const stateUpdate = excludeCart(updatedTabs, cartId)
        setState(stateUpdate)
      }, 1000)
    })
  }, [tabs, excludeCart, setState])

  const completeCartDelete = React.useCallback(() => {
    const stateUpdate = excludeCart(tabs, selectedCartId)
    setState(stateUpdate)
  }, [tabs, selectedCartId])

  React.useEffect(() => {
    db.getRows({
      storeName: SN.SALES,
      indexName: IN.ACTIVE_CART_ID,
      format: 'cartIds',
      dataCollecting: false,
    }).then((rows: any) => {
      setState({
        selectedCartId: rows[0],
        tabs: rows.map((cartId: string, index: number) => ({
          label: `${CARTS_LIST.CART_TITLE} #${index + 1}`,
          cartId,
        })),
      })
    })
  }, [])

  return (
    <Block ratio={0}>
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          <>
            {tabs.map(({label, cartId}: any) => (
              <Tab
                key={label}
                id={label}
                onSelect={() => {
                  setState({selectedCartId: cartId})
                }}
                isSelected={cartId === state.selectedCartId}
                aria-controls={`panel-${label}`}
              >
                {label}
              </Tab>
            ))}
            <Tab onSelect={handleNewCart}>
              <span>
                <AddIcon color="green" position="relative" top="3px" /> Add Cart
              </span>
            </Tab>
          </>
        </Tablist>
        <Pane role="tabpanel" height="calc(100vh - 54vh)">
          {state.selectedCartId && (
            <Cart
              key={state.selectedCartId}
              cartId={state.selectedCartId}
              fetchComputedCartSum={fetchComputedCartSum}
              completeCartDelete={completeCartDelete}
            />
          )}
        </Pane>
      </Pane>
    </Block>
  )
}
