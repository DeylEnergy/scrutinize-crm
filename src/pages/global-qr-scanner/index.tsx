import React from 'react'
import {useGlobalScanner} from '../../utilities'
import GlobalQRScannerControl from './GlobalQRScannerControl'

function GlobalQRScanner() {
  const [globalScanner, setGlobalScanner] = useGlobalScanner()

  const {isShown, isGlobal} = globalScanner

  const handleIsShown = React.useCallback(
    (isOpen: any) => {
      setGlobalScanner({...globalScanner, isShown: isOpen})
    },
    [globalScanner, setGlobalScanner],
  )

  return (
    isGlobal && (
      <GlobalQRScannerControl
        isGlobal={true}
        isShown={isShown}
        setIsShown={handleIsShown}
      />
    )
  )
}

export default GlobalQRScanner
