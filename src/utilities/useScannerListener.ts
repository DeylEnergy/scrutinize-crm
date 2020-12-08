import React from 'react'
import ScannerListenerContext from '../contexts/scannerListenerContext'
import useUpdate from './useUpdate'

function noop() {}

export default function useScannerListener({
  onChange = noop,
}: {onChange?: any} = {}) {
  const ctx = React.useContext(ScannerListenerContext)
  const [currentState] = ctx
  const onChangeCb = React.useRef(onChange)

  useUpdate(() => {
    onChangeCb.current = onChange
  }, [onChange])

  useUpdate(() => {
    if (currentState) {
      onChangeCb.current(currentState)
    }
  }, [currentState])

  return ctx
}
