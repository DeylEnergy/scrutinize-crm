import React from 'react'
import styled from 'styled-components'
import {Dialog, Pane, Tablist, Tab, Alert} from 'evergreen-ui'
import {
  useLocale,
  useDatabase,
  useAccount,
  useDelay,
  getTestId,
} from '../../utilities'
import {PROCESS_SALE, PROCESS_RETURN_ITEMS} from '../../constants/events'
import TextInputField from '../../components/TextInputField'
import {SPACING} from '../../constants'
import RIGHTS from '../../constants/rights'

function Sale({handlePaidSumChange, paidSum, changeSum}: any) {
  const [locale] = useLocale()
  const {INPUTS} = locale.vars.PAGES.CARTS.DIALOG.CHECKOUT.SALE

  return (
    <>
      <TextInputField
        type="number"
        value={paidSum}
        onChange={handlePaidSumChange}
        label={INPUTS.PAID}
        placeholder="0"
        {...getTestId('cart-checkout-paid-input')}
      />
      <TextInputField
        readOnly
        label={changeSum > 0 ? INPUTS.CHANGE : INPUTS.NEED}
        value={Math.abs(changeSum)}
        isInvalid={changeSum < 0}
        {...getTestId('cart-checkout-change-input')}
      />
    </>
  )
}

const H2_RETURN_STYLE = `
  margin: 0;
  text-align:center;
`

const ReturnLabel = styled.h2`
  ${H2_RETURN_STYLE}
  color: #244361;
  margin-bottom: 4px;
`

const ReturnSum = styled.h2`
  ${H2_RETURN_STYLE}
  color: #d9822c;
  text-decoration: underline;
`

function Return({totalSum}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const PAGE_CONST = locale.vars.PAGES.CARTS.DIALOG.CHECKOUT.RETURN

  return (
    <>
      <ReturnLabel>{PAGE_CONST.SUM_TO_RETURN}:</ReturnLabel>
      <ReturnSum>{Number(totalSum).toLocaleString(STRING_FORMAT)}</ReturnSum>
      <Alert
        intent="warning"
        title={PAGE_CONST.ALERT.TITLE}
        marginTop={SPACING}
      />
    </>
  )
}

const CONTENT_CONTAINER_STYLE = {
  padding: SPACING,
  height: 190,
}

const MIN_CONFIRM_DELAY_MS = 1000

export default function CheckoutDialog({
  isShown,
  handleCheckoutClose,
  handleDialogTabSwitch,
  handleCheckoutSuccess,
  cartId,
  totalSum,
}: any) {
  const [locale] = useLocale()
  const {CHECKOUT} = locale.vars.PAGES.CARTS.DIALOG

  const [{permissions}] = useAccount()

  const db = useDatabase()

  const [isConfirmLoading, {handleDelay}] = useDelay(
    false,
    MIN_CONFIRM_DELAY_MS,
  )

  const [isCartCompleted, setIsCartCompleted] = React.useState(false)

  const [selectedAction, setSelectedAction] = React.useState(PROCESS_SALE)

  const [paidSum, setPaidSum] = React.useState<any>('')

  const handlePaidSumChange = React.useCallback(
    (value: any) => {
      setPaidSum(value)
    },
    [setPaidSum],
  )

  const changeSum = (Number(paidSum) || 0) - totalSum

  const tabs = React.useMemo(() => {
    const allowedTabs = [
      {
        label: CHECKOUT.SALE.TITLE,
        action: PROCESS_SALE,
      },
    ]

    if (permissions.includes(RIGHTS.CAN_RETURN_SALES_ITEMS)) {
      allowedTabs.push({
        label: CHECKOUT.RETURN.TITLE,
        action: PROCESS_RETURN_ITEMS,
      })
    }

    return allowedTabs
  }, [CHECKOUT, permissions])

  const handleConfirm = React.useCallback(() => {
    handleDelay({isProgressing: true})
    db.sendEvent({type: selectedAction, payload: {cartId}}).then(() => {
      const handleSuccess = () => {
        setIsCartCompleted(true)
        handleCheckoutSuccess()
      }
      handleDelay({isProgressing: false, cb: handleSuccess})
    })
  }, [cartId, db, handleCheckoutSuccess, handleDelay, selectedAction])

  const handleCompleteClose = React.useCallback(() => {
    if (isCartCompleted) {
      handleDialogTabSwitch()
    } else {
      handleCheckoutClose()
    }
  }, [isCartCompleted, handleDialogTabSwitch, handleCheckoutClose])

  const handleCancel = React.useCallback(
    (close: () => void) => {
      if (isConfirmLoading) {
        return
      }

      close()
    },
    [isConfirmLoading],
  )

  return (
    <Dialog
      shouldCloseOnOverlayClick={false}
      isShown={isShown}
      title={CHECKOUT.TITLE}
      onCloseComplete={handleCompleteClose}
      onCancel={handleCancel}
      width={300}
      topOffset="auto"
      isConfirmLoading={isConfirmLoading}
      isConfirmDisabled={
        selectedAction === PROCESS_SALE && totalSum > 0 && changeSum < 0
      }
      confirmLabel={CHECKOUT.CONFIRM_BUTTON_TITLE}
      onConfirm={handleConfirm}
      hasCancel={false}
      contentContainerProps={CONTENT_CONTAINER_STYLE}
      // @ts-ignore
      overlayProps={{...getTestId('cart-checkout-dialog')}}
    >
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          {tabs.map(({label, action}: any) => (
            <Tab
              key={label}
              id={label}
              isSelected={action === selectedAction}
              onSelect={() => {
                setSelectedAction(action)
              }}
              aria-controls={`panel-${label}`}
              {...getTestId(`cart-checkout-tab_${label}`)}
            >
              {label}
            </Tab>
          ))}
        </Tablist>
        <Pane
          role="tabpanel"
          height="100%"
          paddingLeft={SPACING}
          paddingRight={SPACING}
        >
          {selectedAction === PROCESS_SALE && (
            <Sale
              handlePaidSumChange={handlePaidSumChange}
              paidSum={paidSum}
              changeSum={changeSum}
            />
          )}
          {selectedAction === PROCESS_RETURN_ITEMS && (
            <Return totalSum={totalSum} />
          )}
        </Pane>
      </Pane>
    </Dialog>
  )
}
