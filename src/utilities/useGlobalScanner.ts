import React from 'react'
import GlobalScannerContext from '../contexts/globalScannerContext'

export default function useGlobalScanner() {
  const ctx = React.useContext(GlobalScannerContext)

  return ctx
}
