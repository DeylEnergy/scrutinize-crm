import React from 'react'
import {toaster} from 'evergreen-ui'
import QrScannerDialog from '../../components/QrScannerDialog'
import GlobalContext from '../../contexts/globalContext'
import {useScannerListener, recognizeQRCode} from '../../utilities'
import {STORE_NAME as SN} from '../../constants'
import {PUT_SALE} from '../../constants/events'
import codePrefixes from '../../constants/codePrefixes'

function GlobalQRScannerControl(props: any) {
  const {worker} = React.useContext(GlobalContext)

  const handleNewScannedProduct = React.useCallback(
    (scanResult: any) => {
      const [prefix, data] = recognizeQRCode(scanResult?.value)
      if (prefix === codePrefixes.acquisitions) {
        worker
          .getRow({storeName: SN.ACQUISITIONS, key: data})
          .then((aq: any) => {
            const productToAdd = {
              count: 1,
              _productId: aq._productId,
            }

            worker
              .sendEvent({
                type: PUT_SALE,
                payload: productToAdd,
                consumer: 'client',
              })
              .then((result: any) => {
                const [name, model] = result._product.nameModel
                toaster.success(`${name} ${model} was added.`)
              })
          })
      } else {
        toaster.warning('Unknown type of QR code.')
      }
    },
    [worker],
  )

  useScannerListener({
    onChange: handleNewScannedProduct,
  })

  return <QrScannerDialog {...props} />
}

export default GlobalQRScannerControl
