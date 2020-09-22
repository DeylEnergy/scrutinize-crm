import React from 'react'
import {toaster} from 'evergreen-ui'
import Header from './layouts/Header'
import MerchandisePage from './routes/merchandise'
import SalesPage from './routes/sales'
import StatsPage from './routes/stats'
import UsersControlPage from './routes/users-control'
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import GlobalContext from './contexts/globalContext'
import AccountContext from './contexts/accountContext'
// @ts-ignore
import workerize from 'workerize-loader!./worker' // eslint-disable-line import/no-webpack-loader-syntax
import RIGHTS from './constants/rights'
import {useAccount} from './utilities'

const fns: any = workerize()

function displayDanger(err: any) {
  toaster.danger('Error', {
    description: err.message || `${err}`,
  })
}

function handleError(err: any) {
  displayDanger(err)
  fns.sendEvent({type: 'saveError', payload: err}).catch(displayDanger)
}

const worker = (() => {
  // this way every caught exception will be displayed inside the toaster
  return Object.keys(fns).reduce((total: any, cur: any) => {
    total[cur] = (...args: any) => fns[cur](...args).catch(handleError)
    return total
  }, {})
})()

console.log(worker)

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
          <Route path="/">
            <div style={{flex: 1, padding: '8px 16px'}}>Home</div>
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

const PERMISSIONS_MOCK = [
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
]

function AppProvider() {
  const globalContextValue = React.useRef({
    worker,
  })
  // TODO: implement auth logic
  const [groupPermissions, setGroupPermissions] = React.useState({
    permissions: PERMISSIONS_MOCK,
  })

  return (
    <GlobalContext.Provider value={globalContextValue.current}>
      <AccountContext.Provider value={[groupPermissions, setGroupPermissions]}>
        <App />
      </AccountContext.Provider>
    </GlobalContext.Provider>
  )
}

export default AppProvider
