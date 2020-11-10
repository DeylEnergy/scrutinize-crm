import React from 'react'
import {Button, Pane} from 'evergreen-ui'
import CartParticipants from './CartParticipants'
import QrScannerPopover from '../../components/QrScannerPopover'
import {useLocale, useGlobalScanner, useScannerListener} from '../../utilities'

function CartsFooter({
  selectedCartId,
  tabs,
  currentCartSum,
  openCheckoutDialog,
}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.CARTS
  const {CONTROLS} = PAGE_CONST

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
              <b>{CONTROLS.TOTAL_SUM.TITLE}:</b>{' '}
              {Number(currentCartSum).toLocaleString(STRING_FORMAT)}
            </span>
          )}
          <QrScannerPopover
            isShown={isQRScannerShown}
            setIsShown={setIsQRScannerShown}
            buttonTitle={CONTROLS.SCANNER.BUTTON_TITLE}
          />
          <Button
            tabIndex={0}
            marginLeft={8}
            appearance="primary"
            onClick={openCheckoutDialog}
          >
            {CONTROLS.CONFIRM.BUTTON_TITLE}
          </Button>
        </Pane>
      </Pane>
    </>
  )
}

export default React.memo(CartsFooter)
