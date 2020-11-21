import React from 'react'
import {Alert} from 'evergreen-ui'
import {useDatabase} from '../utilities'

export default function ErrorBoundaryFallback({
  error,
  resetErrorBoundary,
}: any) {
  const db = useDatabase()

  React.useEffect(() => {
    if (db) {
      db.sendEvent({type: 'saveError', payload: error})
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
