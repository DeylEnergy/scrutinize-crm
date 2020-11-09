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
import {USERS_CONTROL_ROUTE} from '../../constants/routes'
import {useLocale} from '../../utilities'

const USERS_PATH = `/${USERS_CONTROL_ROUTE}/users`
const GROUPS_PATH = `/${USERS_CONTROL_ROUTE}/group`

export default function UsersControls() {
  const [locale] = useLocale()
  const {USERS: USERS_CONST, USER_GROUPS: USER_GROUPS_CONST} = locale.vars.PAGES

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
    ]
  }, [USERS_CONST, USER_GROUPS_CONST])

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
            <Redirect to={USERS_PATH} />
          </Switch>
        </Pane>
      </Pane>
    </Block>
  )
}
