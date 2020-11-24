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
import GeneralSettings from './GeneralSettings'
import Backup from './Backup'
import {useLocale, useAccount} from '../../utilities'
import {SETTINGS_ROUTE} from '../../constants/routes'
import RIGHTS from '../../constants/rights'

const GENERAL_SETTINGS_PATH = `/${SETTINGS_ROUTE}/general`
const BACKUP_PATH = `/${SETTINGS_ROUTE}/backup`

export default function Settings() {
  const history = useHistory()
  const location = useLocation()
  const [locale] = useLocale()
  const {PAGES} = locale.vars
  const [{permissions}] = useAccount()
  const [redirectToLink, setRedirectToLink] = React.useState('/')

  const canSeeBackup =
    permissions.includes(RIGHTS.CAN_EXPORT_DATA) ||
    permissions.includes(RIGHTS.CAN_IMPORT_DATA)

  const tabs = React.useMemo(() => {
    const allowedTabs = []
    let redirectPath
    if (true) {
      allowedTabs.push({
        label: PAGES.GENERAL_SETTINGS.TITLE,
        path: GENERAL_SETTINGS_PATH,
      })
      redirectPath = GENERAL_SETTINGS_PATH
    }

    if (canSeeBackup) {
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
  }, [PAGES, canSeeBackup])

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
            <Route path={GENERAL_SETTINGS_PATH}>
              <GeneralSettings />
            </Route>
            {canSeeBackup && (
              <Route path={BACKUP_PATH}>
                <Backup />
              </Route>
            )}
            <Redirect to={redirectToLink} />
          </Switch>
        </Pane>
      </Pane>
    </Block>
  )
}
