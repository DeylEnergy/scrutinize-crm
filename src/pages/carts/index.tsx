import React from 'react'
import {Pane, Tooltip} from 'evergreen-ui'
import {FaShoppingCart} from 'react-icons/fa'
import CartsDialog from './CartsDialog'

const ICON_STYLE = {
  color: '#ffffff7d',
  size: 24,
  cursor: 'pointer',
}

const Carts = function Carts() {
  const [isShown, setIsShown] = React.useState(false)

  return (
    <Pane marginRight={16}>
      {isShown && <CartsDialog isShown={isShown} setIsShown={setIsShown} />}
      <Tooltip content="Cart">
        <Pane>
          <FaShoppingCart {...ICON_STYLE} onClick={() => setIsShown(true)} />
        </Pane>
      </Tooltip>
    </Pane>
  )
}

export default React.memo(Carts)
