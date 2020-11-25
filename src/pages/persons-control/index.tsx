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
import {useLocale} from '../../utilities'

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

  const history = useHistory()
  const location = useLocation()

  const tabs = React.useMemo(() => {
    return [
      {
        label: USERS_CONST.TITLE,
        path: USERS_PATH,
      },
      {
        label: USER_GROUPS_CONST.TITLE,
        path: GROUPS_PATH,
      },
      {
        label: SUPPLIERS_CONST.TITLE,
        path: SUPPLIERS_PATH,
      },
      {
        label: CUSTOMERS_CONST.TITLE,
        path: CUSTOMERS_PATH,
      },
    ]
  }, [USERS_CONST, USER_GROUPS_CONST, SUPPLIERS_CONST, CUSTOMERS_CONST])

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
            <Route path={USERS_PATH}>
              <Users />
            </Route>
            <Route path={GROUPS_PATH}>
              <Groups />
            </Route>
            <Route path={SUPPLIERS_PATH}>
              <Suppliers />
            </Route>
            <Route path={CUSTOMERS_PATH}>
              <Customers />
            </Route>
            <Redirect to={USERS_PATH} />
          </Switch>
        </Pane>
      </Pane>
    </Block>
  )
}
