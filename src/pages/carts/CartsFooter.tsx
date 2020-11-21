import React from 'react'
import {Button, Pane} from 'evergreen-ui'
import CartParticipants from './CartParticipants'
import QrScannerPopover from '../../components/QrScannerPopover'
import {useLocale, useGlobalScanner, useScannerListener} from '../../utilities'
import {SPACING} from '../../constants'

const FOOTER_SUM_STYLE = {
  marginRight: SPACING,
}

function CartsFooter({
  selectedCartId,
  tabs,
  currentCartSum,
  handleCheckoutOpen,
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
            <span style={FOOTER_SUM_STYLE}>
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
            disabled={!currentCartSum}
            tabIndex={0}
            marginLeft={8}
            appearance="primary"
            onClick={handleCheckoutOpen}
          >
            {CONTROLS.CONFIRM.BUTTON_TITLE}
          </Button>
        </Pane>
      </Pane>
    </>
  )
}

export default React.memo(CartsFooter)
