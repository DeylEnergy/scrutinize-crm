import React from 'react'
import {ErrorBoundary, ErrorBoundaryProps} from 'react-error-boundary'
import ErrorBoundaryFallback from '../components/ErrorBoundaryFallback'

export default function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: ErrorBoundaryProps,
): React.ComponentType<P> {
  function Wrapped(props: any) {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorBoundaryFallback}
        {...errorBoundaryProps}
      >
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  // Format for display in DevTools
  const name = Component.displayName || Component.name || 'Unknown'
  Wrapped.displayName = `withErrorBoundary(${name})`

  return Wrapped
}
