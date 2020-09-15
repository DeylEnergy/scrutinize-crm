import React from 'react'
import {Pane, Tablist, Tab, AddIcon} from 'evergreen-ui'
import {v4 as uuidv4} from 'uuid'
import Block from '../../components/Block'
import Cart from './Cart'
import GlobalContext from '../../contexts/globalContext'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../constants'

export default function CartsTabs({
  state,
  setState,
  fetchComputedCartSum,
}: any) {
  const {worker} = React.useContext(GlobalContext)

  const {tabs} = state

  const handleNewCart = () => {
    const lastTabId = tabs.length

    const cartId = uuidv4()

    return setState({
      selectedCartId: cartId,
      tabs: [
        ...tabs,
        {
          cartId,
          label: `Cart #${lastTabId + 1}`,
        },
      ],
    })
  }

  React.useEffect(() => {
    worker
      .getRows({
        storeName: SN.SALES,
        indexName: IN.__CART_ID__,
        direction: 'prev',
        format: 'cartIds',
        dataCollecting: false,
      })
      .then((rows: any) => {
        if (!rows.length) {
          return handleNewCart()
        }

        setState({
          selectedCartId: rows[0],
          tabs: rows.map((cartId: string, index: number) => ({
            label: `Cart #${index + 1}`,
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
            {tabs.map(({label, cartId}: any, index: number) => (
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
            />
          )}
        </Pane>
      </Pane>
    </Block>
  )
}
