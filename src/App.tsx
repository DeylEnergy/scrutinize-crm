import React from 'react'
import {toaster} from 'evergreen-ui'
import Header from './layouts/Header'
import MerchandisePage from './pages/merchandise'
import SalesPage from './pages/sales'
import StatsPage from './pages/stats'
import PersonsControlPage from './pages/persons-control'
import SignInPage from './pages/sign-in'
import Settings from './pages/settings'
import Setup from './pages/setup'
import {Switch, Route, Redirect} from 'react-router-dom'
import LocaleContext from './contexts/localeContext'
import SetupContext from './contexts/setupContext'
import DatabaseContext from './contexts/databaseContext'
import AccountContext from './contexts/accountContext'
import GlobalScannerContext from './contexts/globalScannerContext'
import ScannerListenerContext from './contexts/scannerListenerContext'
// @ts-ignore
import createDbWorker from 'workerize-loader!./database' // eslint-disable-line import/no-webpack-loader-syntax
import RIGHTS from './constants/rights'
import {useSetup, useAccount, useLocalStorage} from './utilities'
import GlobalQRScanner from './pages/global-qr-scanner'
// console.log(electron)

function enableDevToolsInProduction() {
  const {remote} = window.require('electron')
  remote.globalShortcut.register('CommandOrControl+Shift+I', () => {
    // @ts-ignore
    remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
  })

  window.addEventListener('beforeunload', () => {
    console.log('stop it')
    remote.globalShortcut.unregisterAll()
  })
}

let Router: any

if (process.env.REACT_APP_WRAPPER === 'electron') {
  Router = require('react-router-dom').HashRouter
  enableDevToolsInProduction()
} else {
  Router = require('react-router-dom').BrowserRouter
}

const fns: any = createDbWorker()

function displayDanger(err: any) {
  toaster.danger('Error', {
    description: err.message || `${err}`,
  })
}

function handleError(err: any) {
  displayDanger(err)
  fns.sendEvent({type: 'saveError', payload: err}).catch(displayDanger)
}

const dbWorker = (() => {
  // this way every caught exception will be displayed inside the toaster
  return Object.keys(fns).reduce((total: any, cur: any) => {
    total[cur] = (...args: any) => fns[cur](...args).catch(handleError)
    return total
  }, {})
})()

console.log(dbWorker)

const APP_WRAPPER_STYLE: any = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100%',
  boxSizing: 'border-box',
}

const App = () => {
  const [{isFinished: isSetupFinished}] = useSetup()

  const [{user, permissions}] = useAccount()

  const canSeeMerchandise =
    permissions?.includes(RIGHTS.CAN_SEE_PRODUCTS) ||
    permissions?.includes(RIGHTS.CAN_SEE_TO_BUY_LIST) ||
    permissions?.includes(RIGHTS.CAN_SEE_ACQUISITIONS)

  const canSeeUsersControl =
    permissions?.includes(RIGHTS.CAN_SEE_USERS) ||
    permissions?.includes(RIGHTS.CAN_SEE_USER_GROUPS)

  return (
    <div style={APP_WRAPPER_STYLE}>
      <Router>
        <Header />
        <Switch>
          {canSeeMerchandise && (
            <Route path="/merchandise">
              <MerchandisePage />
            </Route>
          )}
          {permissions?.includes(RIGHTS.CAN_SEE_SALES) && (
            <Route path="/sales">
              <SalesPage />
            </Route>
          )}
          <Route path="/stats">
            <StatsPage />
          </Route>
          {canSeeUsersControl && (
            <Route path="/persons-control">
              <PersonsControlPage />
            </Route>
          )}
          {!user && (
            <Route path="/sign-in">
              {isSetupFinished ? <SignInPage /> : <Redirect to="/setup" />}
            </Route>
          )}
          <Route path="/settings">
            <Settings />
          </Route>
          {!isSetupFinished && (
            <Route path="/setup">
              <Setup />
            </Route>
          )}
          <Route path="/">
            {user ? (
              <Redirect to="/sales" />
            ) : isSetupFinished ? (
              <Redirect to="/sign-in" />
            ) : (
              <Redirect to="/setup" />
            )}
          </Route>
        </Switch>
      </Router>
      <GlobalQRScanner />
    </div>
  )
}

const ACCOUNT_MOCK = {
  // user: {
  //   name: 'Joe Doe',
  // },
  // permissions: [
  //   'canSeeUsers',
  //   'canSeeUserGroups',
  //   'canSeeSales',
  //   'canSeeProducts',
  //   'canEditProducts',
  //   'canSeeToBuyList',
  //   'canSeeAcquisitions',
  //   'canEditItemsInToBuyItems',
  //   'canAddItemToBuyList',
  //   'canPrintToBuyList',
  //   'canCompleteToBuyList',
  //   'canSeeUserProfile',
  //   'canSeeCarts',
  //   'canSeeStickersManager',
  //   'canSeeStats',
  //   'canSeeCashbox',
  //   'canPerformCashboxOperations',
  //   'canExportData',
  //   'canImportData',
  // ],
  // groupName: 'Administrator',
}

const LOCALE_DEFAULT = 'en'

const SETUP_DEFAULT = {
  isFinished: false,
}

function AppProvider() {
  const [language, setLanguage] = useLocalStorage('LOCALE', LOCALE_DEFAULT)
  const [locale, setLocale] = React.useState<any>(null)

  const [setup, setSetup] = useLocalStorage('SETUP', SETUP_DEFAULT)

  const [account, setAccount] = React.useState(ACCOUNT_MOCK)
  const [globalScanner, setGlobalScanner] = React.useState({
    isShown: false,
    isGlobal: true,
  })

  const [scannerListener, setScannerListener] = React.useState<any>(null)

  React.useEffect(() => {
    console.log(window)
    import(`./locales/${language}`).then(({default: _, ...vars}: any) => {
      setLocale({language, vars})
    })
  }, [language, setLocale])

  if (!locale) {
    return null
  }

  return (
    <LocaleContext.Provider value={[locale, setLanguage]}>
      <SetupContext.Provider value={[setup, setSetup]}>
        <AccountContext.Provider value={[account, setAccount]}>
          <DatabaseContext.Provider value={dbWorker}>
            <GlobalScannerContext.Provider
              value={[globalScanner, setGlobalScanner]}
            >
              <ScannerListenerContext.Provider
                value={[scannerListener, setScannerListener]}
              >
                <App />
              </ScannerListenerContext.Provider>
            </GlobalScannerContext.Provider>
          </DatabaseContext.Provider>
        </AccountContext.Provider>
      </SetupContext.Provider>
    </LocaleContext.Provider>
  )
}

export default AppProvider
