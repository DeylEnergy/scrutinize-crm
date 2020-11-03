import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'
import {
  FaDatabase,
  FaList,
  FaQrcode,
  FaChartBar,
  FaUserCog,
} from 'react-icons/fa'
import {Tooltip} from 'evergreen-ui'
import IconButton from '../components/IconButton'
import Carts from '../pages/carts'
import {useAccount} from '../utilities'
import RIGHTS from '../constants/rights'
import Cashbox from '../pages/cashbox'
import UserProfilePopover from './UserProfilePopover'

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
              <IconButton icon={<FaDatabase />} />
            </Tooltip>
          </Link>
        )}
        {permissions?.includes(RIGHTS.CAN_SEE_SALES) && (
          <Link to="/sales">
            <Tooltip content="Sales">
              <IconButton icon={<FaList />} />
            </Tooltip>
          </Link>
        )}
        {permissions?.includes(RIGHTS.CAN_SEE_STATS) && (
          <Link to="/stats">
            <Tooltip content="Statistics">
              <IconButton icon={<FaChartBar />} />
            </Tooltip>
          </Link>
        )}
        {canSeeUsersControl && (
          <Link to="/users-control">
            <Tooltip content="Users Control">
              <IconButton icon={<FaUserCog />} />
            </Tooltip>
          </Link>
        )}
        {/* No manual stickers for the first version. */}
        {/* {permissions?.includes(RIGHTS.CAN_SEE_STICKERS_MANAGER) && (
          <Link to="/">
            <Tooltip content="Stickers manager">
              <IconButton icon={<FaQrcode />} />
            </Tooltip>
          </Link>
        )} */}
      </ActionsContainer>
      <Logo>Scrutinize</Logo>
      <ActionsContainer last>
        {permissions?.includes(RIGHTS.CAN_SEE_CASHBOX) && <Cashbox />}
        {permissions?.includes(RIGHTS.CAN_SEE_CARTS) && <Carts />}
        {permissions?.includes(RIGHTS.CAN_SEE_USER_PROFILE) && (
          <UserProfilePopover />
        )}
      </ActionsContainer>
    </Stripe>
  )
}
