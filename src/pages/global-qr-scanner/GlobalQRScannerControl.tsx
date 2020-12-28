import React from 'react'
import {toaster} from 'evergreen-ui'
import QrScannerPopover from '../../components/QrScannerPopover'
import {
  useLocale,
  useScannerListener,
  useAccount,
  useDatabase,
  useGlobalScanner,
} from '../../utilities'
import careOfScannedQRCode from '../common/care-of-scanned-qr-code'

function GlobalQRScannerControl(props: any) {
  const [locale] = useLocale()
  const {TOASTER, BUTTON_TITLE} = locale.vars.PAGES.GLOBAL_SCANNER
  const db = useDatabase()
  const [, setAccount] = useAccount()
  const [, setGlobalScanner] = useGlobalScanner()

  const handleNewScannedCode = React.useCallback(
    (scannedCode: any) => {
      if (!scannedCode) {
        return
      }

      const handleProductScanned = (acquisitionData: any) => {
        const [name, model] = acquisitionData._product.nameModel
        toaster.success(`${name} ${model} ${TOASTER.PRODUCT_ADDED_TO_CART}`)
      }

      const handleUserAuthorized = (userData: any) => {
        const {user, group} = userData
        setAccount({
          user,
          permissions: group.permissions,
          groupName: group.name,
          groupId: group.id,
        })
        setGlobalScanner((prev: any) => ({...prev, isShown: false}))
        toaster.success(`${user.name} ${TOASTER.SUCCESSFULLY_AUTHORIZED}`)
      }

      careOfScannedQRCode({
        db,
        scannedCode,
        onProductScanned: handleProductScanned,
        onUserAuthorized: handleUserAuthorized,
        onUnknownScanned: () => toaster.warning(TOASTER.UNKNOWN_QR_CODE),
        onUnknownAcquisitionScanned: () =>
          toaster.warning(TOASTER.UNKNOWN_ACQUISITION),
      })
    },
    [TOASTER, db, setAccount, setGlobalScanner],
  )

  useScannerListener({
    onChange: handleNewScannedCode,
  })

  return <QrScannerPopover buttonTitle={BUTTON_TITLE} {...props} />
}

export default GlobalQRScannerControl
