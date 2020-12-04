import React from 'react'
import {
  Switch,
  Route,
  Redirect,
  useHistory,
  useLocation,
} from 'react-router-dom'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../components/Block'
import Users from './users/Users'
import Groups from './groups/Groups'
import Suppliers from './suppliers/Suppliers'
import Customers from './customers/Customers'
import {PERSONS_CONTROL_ROUTE} from '../../constants/routes'
import {useLocale, useAccount} from '../../utilities'
import RIGHTS from '../../constants/rights'

const USERS_PATH = `/${PERSONS_CONTROL_ROUTE}/users`
const GROUPS_PATH = `/${PERSONS_CONTROL_ROUTE}/group`
const SUPPLIERS_PATH = `/${PERSONS_CONTROL_ROUTE}/suppliers`
const CUSTOMERS_PATH = `/${PERSONS_CONTROL_ROUTE}/customers`

export default function PersonsControl() {
  const [locale] = useLocale()
  const {
    USERS: USERS_CONST,
    USER_GROUPS: USER_GROUPS_CONST,
    SUPPLIERS: SUPPLIERS_CONST,
    CUSTOMERS: CUSTOMERS_CONST,
  } = locale.vars.PAGES

  const [{permissions}] = useAccount()

  const history = useHistory()
  const location = useLocation()

  const [redirectToLink, setRedirectToLink] = React.useState('/')

  const tabs = React.useMemo(() => {
    const allowedTabs = []
    let redirectPath
    if (permissions.includes(RIGHTS.CAN_SEE_USERS)) {
      allowedTabs.push({
        label: USERS_CONST.TITLE,
        path: USERS_PATH,
      })
      redirectPath = USERS_PATH
    }

    if (permissions.includes(RIGHTS.CAN_SEE_USER_GROUPS)) {
      allowedTabs.push({
        label: USER_GROUPS_CONST.TITLE,
        path: GROUPS_PATH,
      })
      if (!redirectPath) {
        redirectPath = GROUPS_PATH
      }
    }

    if (permissions.includes(RIGHTS.CAN_SEE_SUPPLIERS)) {
      allowedTabs.push({
        label: SUPPLIERS_CONST.TITLE,
        path: SUPPLIERS_PATH,
      })
      if (!redirectPath) {
        redirectPath = SUPPLIERS_PATH
      }
    }

    if (permissions.includes(RIGHTS.CAN_SEE_CUSTOMERS)) {
      allowedTabs.push({
        label: CUSTOMERS_CONST.TITLE,
        path: CUSTOMERS_PATH,
      })
      if (!redirectPath) {
        redirectPath = CUSTOMERS_PATH
      }
    }

    if (redirectPath) {
      setRedirectToLink(redirectPath)
    }

    return allowedTabs
  }, [
    USERS_CONST,
    USER_GROUPS_CONST,
    SUPPLIERS_CONST,
    CUSTOMERS_CONST,
    permissions,
  ])

  return (
    <Block ratio={1}>
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          {tabs.map(({label, path}: any) => (
            <Tab
              key={label}
              id={label}
              isSelected={path === location.pathname}
              onSelect={() => {
                history.push(path)
              }}
              aria-controls={`panel-${label}`}
            >
              {label}
            </Tab>
          ))}
        </Tablist>
        <Pane role="tabpanel" height="100%">
          <Switch>
            {permissions.includes(RIGHTS.CAN_SEE_USERS) && (
              <Route path={USERS_PATH}>
                <Users />
              </Route>
            )}
            {permissions.includes(RIGHTS.CAN_SEE_USER_GROUPS) && (
              <Route path={GROUPS_PATH}>
                <Groups />
              </Route>
            )}
            {permissions.includes(RIGHTS.CAN_SEE_SUPPLIERS) && (
              <Route path={SUPPLIERS_PATH}>
                <Suppliers />
              </Route>
            )}
            {permissions.includes(RIGHTS.CAN_SEE_CUSTOMERS) && (
              <Route path={CUSTOMERS_PATH}>
                <Customers />
              </Route>
            )}
            <Redirect to={redirectToLink} />
          </Switch>
        </Pane>
      </Pane>
    </Block>
  )
}
