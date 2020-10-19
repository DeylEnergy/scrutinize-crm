import React from 'react'
import {toaster} from 'evergreen-ui'
import Header from './layouts/Header'
import MerchandisePage from './routes/merchandise'
import SalesPage from './routes/sales'
import StatsPage from './routes/stats'
import UsersControlPage from './routes/users-control'
import SignInPage from './routes/sign-in'
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import DatabaseContext from './contexts/databaseContext'
import AccountContext from './contexts/accountContext'
import GlobalScannerContext from './contexts/globalScannerContext'
import ScannerListenerContext from './contexts/scannerListenerContext'
// @ts-ignore
import createDbWorker from 'workerize-loader!./worker' // eslint-disable-line import/no-webpack-loader-syntax
import RIGHTS from './constants/rights'
import {useAccount} from './utilities'
import GlobalQRScanner from './routes/global-qr-scanner'

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

const App = () => {
  const [{permissions}] = useAccount()

  const canSeeMerchandise =
    permissions?.includes(RIGHTS.CAN_SEE_PRODUCTS) ||
    permissions?.includes(RIGHTS.CAN_SEE_TO_BUY_LIST) ||
    permissions?.includes(RIGHTS.CAN_SEE_ACQUISITIONS)

  const canSeeUsersControl =
    permissions?.includes(RIGHTS.CAN_SEE_USERS) ||
    permissions?.includes(RIGHTS.CAN_SEE_USERS_GROUP)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
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
            <Route path="/users-control">
              <UsersControlPage />
            </Route>
          )}
          <Route path="/sign-in">
            <SignInPage />
          </Route>
          <Route path="/">
            <div style={{flex: 1, padding: '8px 16px'}}>Home</div>
          </Route>
        </Switch>
      </Router>
      <GlobalQRScanner />
    </div>
  )
}

const ACCOUNT_MOCK = {
  user: {
    name: 'Joe Doe',
  },
  permissions: [
    'canSeeUsers',
    'canSeeUsersGroup',
    'canSeeSales',
    'canSeeProducts',
    'canEditProducts',
    'canSeeToBuyList',
    'canSeeAcquisitions',
    'canEditItemsInToBuyItems',
    'canAddItemToBuyList',
    'canPrintToBuyList',
    'canCompleteToBuyList',
    'canSeeUserProfile',
    'canSeeCarts',
    'canSeeStickersManager',
    'canSeeStats',
  ],
  groupName: 'Administrator',
}

function AppProvider() {
  // TODO: implement auth logic
  const [account, setAccount] = React.useState(ACCOUNT_MOCK)
  const [globalScanner, setGlobalScanner] = React.useState({
    isShown: false,
    isGlobal: true,
  })

  const [scannerListener, setScannerListener] = React.useState<any>(null)

  return (
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
  )
}

export default AppProvider
