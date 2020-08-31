import React from 'react'
import {Dialog} from 'evergreen-ui'
import GlobalContext from '../../contexts/globalContext'
import {PROCESS_SALE} from '../../constants/events'
import TextInputField from '../../components/TextInputField'

export default function CheckoutDialog({
  isShown,
  handleClose,
  totalSum,
  cartId,
}: any) {
  const {worker} = React.useContext(GlobalContext)

  const [paidSum, setPaidSum] = React.useState<any>('')

  const handlePaidSumChange = (value: any) => {
    setPaidSum(value)
  }

  const changeSum = (Number(paidSum) || 0) - totalSum

  return (
    <>
      <Dialog
        isShown={isShown}
        title="Checkout"
        onCloseComplete={handleClose}
        width={300}
        topOffset="auto"
        isConfirmDisabled={changeSum < 0}
        confirmLabel="Finish"
        onConfirm={() => {
          worker.sendEvent({type: PROCESS_SALE, payload: {cartId}})
        }}
        hasCancel={false}
      >
        <TextInputField
          type="number"
          value={paidSum}
          onChange={handlePaidSumChange}
          label="Paid"
          placeholder="0"
        />
        <TextInputField
          readOnly
          label={changeSum > 0 ? 'Change' : 'Need'}
          value={Math.abs(changeSum)}
          isInvalid={changeSum < 0}
        />
      </Dialog>
    </>
  )
}
