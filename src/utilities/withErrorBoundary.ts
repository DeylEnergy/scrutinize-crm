import {withErrorBoundary as withEB} from 'react-error-boundary'
import ErrorBoundaryFallback from '../components/ErrorBoundaryFallback'

export default function withErrorBoundary(Component: any) {
  return withEB(Component, {
    FallbackComponent: ErrorBoundaryFallback,
  })
}
