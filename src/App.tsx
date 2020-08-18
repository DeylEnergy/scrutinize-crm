import React from 'react'
import {toaster} from 'evergreen-ui'
import Header from './layouts/Header'
import MerchandisePage from './routes/merchandise'
import {Switch, Route, BrowserRouter as Router} from 'react-router-dom'
import GlobalContext from './contexts/globalContext'
// @ts-ignore
import workerize from 'workerize-loader!./worker' // eslint-disable-line import/no-webpack-loader-syntax

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
          <Route path="/merchandise">
            <MerchandisePage />
          </Route>
          <Route path="/">
            <div style={{flex: 1, padding: '8px 16px'}}>Home</div>
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

function AppProvider() {
  const globalContextValue = React.useRef({
    worker,
  })

  return (
    <GlobalContext.Provider value={globalContextValue.current}>
      <App />
    </GlobalContext.Provider>
  )
}

export default AppProvider
