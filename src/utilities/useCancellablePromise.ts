import React from 'react'

function noop() {}

export function makeCancelable(promise: any) {
  let isCanceled = false
  const wrappedPromise = new Promise((resolve, reject) => {
    promise
      .then((val: any) => (isCanceled ? noop() : resolve(val)))
      .catch((error: any) => (isCanceled ? noop() : reject(error)))
  })
  return {
    promise: wrappedPromise,
    cancel() {
      isCanceled = true
    },
  }
}

function useCancellablePromise() {
  const promises = React.useRef<any>()

  React.useEffect(() => {
    promises.current = promises.current || []
    return function cancel() {
      promises.current.forEach((p: any) => p.cancel())
      promises.current = []
    }
  }, [])

  const cancellablePromise = React.useCallback((p: any) => {
    const cPromise = makeCancelable(p)
    promises.current.push(cPromise)
    return cPromise.promise
  }, [])

  return cancellablePromise
}

export default useCancellablePromise
