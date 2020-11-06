import React from 'react'
import {toaster} from 'evergreen-ui'
import QrScannerPopover from '../../components/QrScannerPopover'
import {
  useLocale,
  useScannerListener,
  recognizeQRCode,
  useAccount,
  useDatabase,
  useGlobalScanner,
} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import {PUT_SALE} from '../../constants/events'
import codePrefixes from '../../constants/codePrefixes'

function GlobalQRScannerControl(props: any) {
  const [locale] = useLocale()
  const {TOASTER} = locale.vars.PAGES.GLOBAL_SCANNER
  const db = useDatabase()
  const [, setAccount] = useAccount()
  const [, setGlobalScanner] = useGlobalScanner()

  const handleNewScannedProduct = React.useCallback(
    (scanResult: any) => {
      const [prefix, data]: any = recognizeQRCode(scanResult?.value)
      if (prefix === codePrefixes.acquisitions) {
        db.getRow({storeName: SN.ACQUISITIONS, key: data}).then((aq: any) => {
          const productToAdd = {
            count: 1,
            _productId: aq._productId,
          }

          db.sendEvent({
            type: PUT_SALE,
            payload: productToAdd,
            consumer: 'client',
          }).then((result: any) => {
            const [name, model] = result._product.nameModel
            toaster.success(`${name} ${model} ${TOASTER.PRODUCT_ADDED_TO_CART}`)
          })
        })
      } else if (prefix === codePrefixes.users) {
        const [userName, secretKey] = data.split('__')

        db.perform({
          storeName: SN.USERS,
          action: 'authorization',
          params: {userName, secretKey},
        }).then((result: any) => {
          if (!result) {
            return
          }

          const {user, group} = result
          setAccount({
            user,
            permissions: group.permissions,
            groupName: group.name,
            groupId: group.id,
          })
          setGlobalScanner((prev: any) => ({...prev, isShown: false}))
          toaster.success(`${user.name} ${TOASTER.SUCCESSFULLY_AUTHORIZED}`)
        })
      } else {
        toaster.warning(TOASTER.UNKNOWN_QR_CODE)
      }
    },
    [db],
  )

  useScannerListener({
    onChange: handleNewScannedProduct,
  })

  return <QrScannerPopover {...props} />
}

export default GlobalQRScannerControl
