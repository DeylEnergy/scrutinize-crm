import React from 'react'
import ScannerListenerContext from '../contexts/scannerListenerContext'
import useUpdate from './useUpdate'

export default function useScannerListener({onChange}: {onChange?: any} = {}) {
  const ctx = React.useContext(ScannerListenerContext)
  const [currentState] = ctx

  useUpdate(() => {
    if (onChange && currentState) {
      onChange(currentState)
    }
  }, [onChange, currentState])

  return ctx
}
