import React from 'react'
import styled from 'styled-components'
import {Link} from 'react-router-dom'
import {FaDatabase, FaList, FaChartBar, FaUserCog, FaCog} from 'react-icons/fa'
import {Tooltip} from 'evergreen-ui'
import IconButton from '../components/IconButton'
import Carts from '../pages/carts'
import {useLocale, useAccount} from '../utilities'
import RIGHTS from '../constants/rights'
import StickersManager from '../pages/stickers-manager'
import Cashbox from '../pages/cashbox'
import UserProfile from '../pages/user-profile'

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
  flex: 1;
  ${({last = false}) => last && `justify-content: flex-end;`};
  a:not(:last-child) {
    margin-right: 16px;
  }
`

const Logo = styled.div``

export default function Header() {
  const [locale] = useLocale()
  const {PAGES} = locale.vars
  const [{permissions}] = useAccount()

  const canSeeMerchandise =
    permissions?.includes(RIGHTS.CAN_SEE_PRODUCTS) ||
    permissions?.includes(RIGHTS.CAN_SEE_TO_BUY_LIST) ||
    permissions?.includes(RIGHTS.CAN_SEE_ACQUISITIONS)

  const canSeeUsersControl =
    permissions?.includes(RIGHTS.CAN_SEE_USERS) ||
    permissions?.includes(RIGHTS.CAN_SEE_USER_GROUPS)

  const canSeeSettings =
    permissions?.includes(RIGHTS.CAN_EXPORT_DATA) ||
    permissions?.includes(RIGHTS.CAN_IMPORT_DATA)

  const isElectronApp = process.env.REACT_APP_WRAPPER === 'electron'

  return (
    <Stripe>
      <ActionsContainer>
        {canSeeMerchandise && (
          <Link to="/merchandise">
            <Tooltip content={PAGES.MERCHANDISE.TITLE}>
              <IconButton icon={<FaDatabase />} testId="merchandise-icon" />
            </Tooltip>
          </Link>
        )}
        {permissions?.includes(RIGHTS.CAN_SEE_SALES) && (
          <Link to="/sales">
            <Tooltip content={PAGES.SALES.TITLE}>
              <IconButton icon={<FaList />} testId="sales-icon" />
            </Tooltip>
          </Link>
        )}
        {permissions?.includes(RIGHTS.CAN_SEE_STATS) && (
          <Link to="/stats">
            <Tooltip content={PAGES.STATS.TITLE}>
              <IconButton icon={<FaChartBar />} testId="stats-icon" />
            </Tooltip>
          </Link>
        )}
        {canSeeUsersControl && (
          <Link to="/persons-control">
            <Tooltip content={PAGES.PERSONS_CONTROL.TITLE}>
              <IconButton icon={<FaUserCog />} testId="persons-control-icon" />
            </Tooltip>
          </Link>
        )}
        {canSeeSettings && (
          <Link to="/settings">
            <Tooltip content={PAGES.SETTINGS.TITLE}>
              <IconButton icon={<FaCog />} testId="settings-icon" />
            </Tooltip>
          </Link>
        )}
      </ActionsContainer>
      <Logo>{!isElectronApp && 'Scrutinize'}</Logo>

      <ActionsContainer last>
        {permissions?.includes(RIGHTS.CAN_SEE_STICKERS_MANAGER) && (
          <StickersManager />
        )}
        {permissions?.includes(RIGHTS.CAN_SEE_CASHBOX) && <Cashbox />}
        {permissions?.includes(RIGHTS.CAN_SEE_CARTS) && <Carts />}
        {permissions?.includes(RIGHTS.CAN_SEE_USER_PROFILE) && <UserProfile />}
      </ActionsContainer>
    </Stripe>
  )
}
