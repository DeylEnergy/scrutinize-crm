import React from 'react'
import {toaster} from 'evergreen-ui'
import QrScannerDialog from '../../components/QrScannerDialog'
import {
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
            toaster.success(`${name} ${model} was added.`)
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
          toaster.success(`${user.name} successfully authorized.`)
        })
      } else {
        toaster.warning('Unknown type of QR code.')
      }
    },
    [db],
  )

  useScannerListener({
    onChange: handleNewScannedProduct,
  })

  return <QrScannerDialog {...props} />
}

export default GlobalQRScannerControl
