import React from 'react'
import {Pane, Tooltip} from 'evergreen-ui'
import {FaShoppingCart} from 'react-icons/fa'
import CartsDialog from './CartsDialog'
import {useLocale} from '../../utilities'

const ICON_STYLE = {
  color: '#ffffff7d',
  size: 24,
  cursor: 'pointer',
}

const Carts = function Carts() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS

  const [isShown, setIsShown] = React.useState(false)

  return (
    <Pane marginRight={16}>
      {isShown && <CartsDialog isShown={isShown} setIsShown={setIsShown} />}
      <Tooltip content={PAGE_CONST.TITLE}>
        <Pane>
          <FaShoppingCart {...ICON_STYLE} onClick={() => setIsShown(true)} />
        </Pane>
      </Tooltip>
    </Pane>
  )
}

export default React.memo(Carts)
