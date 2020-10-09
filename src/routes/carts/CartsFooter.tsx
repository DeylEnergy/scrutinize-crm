import React from 'react'
import {Button, Pane} from 'evergreen-ui'
import CartParticipants from './CartParticipants'
import QrScannerDialog from '../../components/QrScannerDialog'
import {useGlobalScanner, useScannerListener} from '../../utilities'

function CartsFooter({
  selectedCartId,
  tabs,
  currentCartSum,
  openCheckoutDialog,
}: any) {
  const [isQRScannerShown, setIsQRScannerShown] = React.useState(false)
  const [, setGlobalScanner] = useGlobalScanner()

  React.useEffect(() => {
    setGlobalScanner({isGlobal: false, isShown: false})
    return () => {
      setGlobalScanner({isGlobal: true, isShown: false})
    }
  }, [setGlobalScanner])

  const sideOffset = 16 * 4

  const footerWidth = `calc(100vw - ${sideOffset}px)`

  return (
    <>
      <Pane display="flex" justifyContent="space-between" width={footerWidth}>
        <Pane display="flex">
          {selectedCartId && (
            <CartParticipants
              key={selectedCartId}
              selectedCartId={selectedCartId}
            />
          )}
        </Pane>

        <Pane>
          {Boolean(tabs.length) && currentCartSum > 0 && (
            <span>
              <b>Total Sum:</b> {currentCartSum}
            </span>
          )}
          <QrScannerDialog
            isShown={isQRScannerShown}
            setIsShown={setIsQRScannerShown}
          />
          <Button
            tabIndex={0}
            marginLeft={8}
            appearance="primary"
            onClick={openCheckoutDialog}
          >
            Confirm
          </Button>
        </Pane>
      </Pane>
    </>
  )
}

export default React.memo(CartsFooter)
