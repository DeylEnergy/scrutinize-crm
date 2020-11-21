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
import Products from './products/Products'
import ToBuy from './to-buy/ToBuy'
import Acquisitions from './acquisitions/Acquisitions'
import {useLocale, useAccount} from '../../utilities'
import {MERCHANDISE_ROUTE} from '../../constants/routes'
import RIGHTS from '../../constants/rights'

const PRODUCTS_PATH = `/${MERCHANDISE_ROUTE}/products`
const TO_BUY_LIST_PATH = `/${MERCHANDISE_ROUTE}/
to-buy-list`
const ACQUISITIONS_PATH = `/${MERCHANDISE_ROUTE}/acquisitions`

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
    if (permissions.includes(RIGHTS.CAN_SEE_PRODUCTS)) {
      allowedTabs.push({
        label: PAGES.PRODUCTS.TITLE,
        path: PRODUCTS_PATH,
      })
      redirectPath = PRODUCTS_PATH
    }

    if (permissions.includes(RIGHTS.CAN_SEE_TO_BUY_LIST)) {
      allowedTabs.push({
        label: PAGES.TO_BUY_LIST.TITLE,
        path: TO_BUY_LIST_PATH,
      })
      if (!redirectPath) {
        redirectPath = TO_BUY_LIST_PATH
      }
    }

    if (permissions.includes(RIGHTS.CAN_SEE_ACQUISITIONS)) {
      allowedTabs.push({
        label: PAGES.ACQUISITIONS.TITLE,
        path: ACQUISITIONS_PATH,
      })
      if (!redirectPath) {
        redirectPath = ACQUISITIONS_PATH
      }
    }

    if (redirectPath) {
      setRedirectToLink(redirectPath)
    }

    return allowedTabs
  }, [permissions, setRedirectToLink])

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
            <Route path={PRODUCTS_PATH}>
              {permissions.includes(RIGHTS.CAN_SEE_PRODUCTS) && <Products />}
            </Route>
            {permissions.includes(RIGHTS.CAN_SEE_TO_BUY_LIST) && (
              <Route path={TO_BUY_LIST_PATH}>
                <ToBuy />
              </Route>
            )}
            {permissions.includes(RIGHTS.CAN_SEE_ACQUISITIONS) && (
              <Route path={ACQUISITIONS_PATH}>
                <Acquisitions />
              </Route>
            )}
            <Redirect to={redirectToLink} />
          </Switch>
        </Pane>
      </Pane>
    </Block>
  )
}
