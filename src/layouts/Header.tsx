import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'
import {
  FaExchangeAlt,
  FaDatabase,
  FaList,
  FaQrcode,
  FaShoppingCart,
  FaChartBar,
} from 'react-icons/fa'
import {Tooltip} from 'evergreen-ui'

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

const MenuIcon = ({
  icon,
  innerRef,
  ...props
}: {
  icon: JSX.Element
  innerRef?: any
}) => {
  icon = React.cloneElement(icon, {
    size: ICON_SIZE,
    color: ICON_COLOR,
  })

  return (
    <span ref={innerRef} {...props}>
      {icon}
    </span>
  )
}

export default function Header() {
  return (
    <Stripe>
      <ActionsContainer>
        <Link to="/merchandise">
          <Tooltip content="Merchandise">
            <MenuIcon icon={<FaDatabase />} />
          </Tooltip>
        </Link>
        <Link to="/">
          <Tooltip content="Transactions">
            <MenuIcon icon={<FaExchangeAlt />} />
          </Tooltip>
        </Link>
        <Link to="/">
          <Tooltip content="Logs">
            <MenuIcon icon={<FaList />} />
          </Tooltip>
        </Link>
        <Link to="/">
          <Tooltip content="Statistics">
            <MenuIcon icon={<FaChartBar />} />
          </Tooltip>
        </Link>
        <Link to="/">
          <Tooltip content="Stickers manager">
            <MenuIcon icon={<FaQrcode />} />
          </Tooltip>
        </Link>
      </ActionsContainer>
      <Logo>Scrutinize</Logo>
      <ActionsContainer last>
        <Link to="/">
          <Tooltip content="Cart">
            <MenuIcon icon={<FaShoppingCart />} />
          </Tooltip>
        </Link>
        <Link to="/">
          <Tooltip content="Scanner">
            <MenuIcon icon={<FaQrcode />} />
          </Tooltip>
        </Link>
      </ActionsContainer>
    </Stripe>
  )
}