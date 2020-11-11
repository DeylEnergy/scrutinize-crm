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
import Settings from './Settings'
import Backup from './Backup'
import {useLocale, useAccount} from '../../utilities'
import {SETTINGS_ROUTE} from '../../constants/routes'
import RIGHTS from '../../constants/rights'
// TODO: rights for settings

const SETTINGS_PATH = `/${SETTINGS_ROUTE}/general`
const BACKUP_PATH = `/${SETTINGS_ROUTE}/backup`

export default function Merchandise() {
  const history = useHistory()
  const location = useLocation()
  const [locale] = useLocale()
  const {PAGES} = locale.vars
  const [{permissions}] = useAccount()
  const [redirectToLink, setRedirectToLink] = React.useState('/')

  const tabs = React.useMemo(() => {
    const allowedTabs = []
    let redirectPath
    if (true) {
      allowedTabs.push({
        label: PAGES.SETTINGS.TITLE,
        path: SETTINGS_PATH,
      })
      redirectPath = SETTINGS_PATH
    }

    if (true) {
      allowedTabs.push({
        label: PAGES.BACKUP.TITLE,
        path: BACKUP_PATH,
      })
      if (!redirectPath) {
        redirectPath = BACKUP_PATH
      }
    }

    if (redirectPath) {
      setRedirectToLink(redirectPath)
    }

    return allowedTabs
  }, [PAGES, permissions, setRedirectToLink])

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
            <Route path={SETTINGS_PATH}>
              <Settings />
            </Route>
            (
            <Route path={BACKUP_PATH}>
              <Backup />
            </Route>
            <Redirect to={redirectToLink} />
          </Switch>
        </Pane>
      </Pane>
    </Block>
  )
}
