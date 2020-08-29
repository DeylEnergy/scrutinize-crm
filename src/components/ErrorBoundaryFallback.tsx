import React from 'react'
import {Alert} from 'evergreen-ui'
import GlobalContext from '../contexts/globalContext'

export default function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: any) {
  const {worker} = React.useContext(GlobalContext)

  React.useEffect(() => {
    if (worker) {
      worker.sendEvent({type: 'saveError', payload: error})
    }
  }, [])

  const handleReset = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    resetErrorBoundary()
  }

  return (
    <Alert intent="danger" title="Error">
      Something went wrong. Please try{' '}
      <a href="#reload" onClick={handleReset}>
        to reload
      </a>
      .
    </Alert>
  )
}
