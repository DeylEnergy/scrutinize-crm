import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'
import {
  FaExchangeAlt,
  FaDatabase,
  FaList,
  FaQrcode,
  FaShoppingCart,
  FaUser,
  FaChartBar,
} from 'react-icons/fa'
import {Pane, Tooltip, IconButton} from 'evergreen-ui'
import Carts from '../routes/carts'
import {useAccount} from '../utilities'
import RIGHTS from '../constants/rights'

const Stripe = styled.div`
  color: #fff;
  width: 100%;
  height: 60px;
  background: #255072;
  display: flex;
  align-items: center;
  padding: 0 16px;
`
type ActionsContainerProps = {
  last?: boolean
}
const ActionsContainer = styled.div<ActionsContainerProps>`
  display: flex;
  width: 45%;
  ${({last = false}) =>
    last &&
    `
    justify-content: flex-end;
    flex-grow: 1;
  `};
  a:not(:last-child) {
    margin-right: 16px;
  }
`

const Logo = styled.div`
  width: 5%;
`

const ICON_COLOR = '#ffffff7d'

const ICON_SIZE = 24

const MenuIcon = React.forwardRef(function MenuIcon(
  {
    icon,
    ...props
  }: {
    icon: JSX.Element
    innerRef?: any
  },
  ref: any,
) {
  icon = React.cloneElement(icon, {
    size: ICON_SIZE,
    color: ICON_COLOR,
  })

  return (
    <span ref={ref} {...props}>
      {icon}
    </span>
  )
})

export default function Header() {
  const [{permissions}] = useAccount()

  const canSeeMerchandise =
    permissions?.includes(RIGHTS.CAN_SEE_PRODUCTS) ||
    permissions?.includes(RIGHTS.CAN_SEE_TO_BUY_LIST) ||
    permissions?.includes(RIGHTS.CAN_SEE_ACQUISITIONS)

  const canSeeUsersControl =
    permissions?.includes(RIGHTS.CAN_SEE_USERS) ||
    permissions?.includes(RIGHTS.CAN_SEE_USERS_GROUP)

  return (
    <Stripe>
      <ActionsContainer>
        {canSeeMerchandise && (
          <Link to="/merchandise">
            <Tooltip content="Merchandise">
              <MenuIcon icon={<FaDatabase />} />
            </Tooltip>
          </Link>
        )}
        {permissions?.includes(RIGHTS.CAN_SEE_SALES) && (
          <Link to="/sales">
            <Tooltip content="Sales">
              <MenuIcon icon={<FaList />} />
            </Tooltip>
          </Link>
        )}
        <Link to="/stats">
          <Tooltip content="Statistics">
            <MenuIcon icon={<FaChartBar />} />
          </Tooltip>
        </Link>
        {canSeeUsersControl && (
          <Link to="/users-control">
            <Tooltip content="Users Control">
              <MenuIcon icon={<FaUser />} />
            </Tooltip>
          </Link>
        )}
        <Link to="/">
          <Tooltip content="Stickers manager">
            <MenuIcon icon={<FaQrcode />} />
          </Tooltip>
        </Link>
      </ActionsContainer>
      <Logo>Scrutinize</Logo>
      <ActionsContainer last>
        <Carts />
        <Link to="/">
          <Tooltip content="Scanner">
            <MenuIcon icon={<FaQrcode />} />
          </Tooltip>
        </Link>
      </ActionsContainer>
    </Stripe>
  )
}
