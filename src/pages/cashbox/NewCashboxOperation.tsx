import React from 'react'
import {
  Button,
  Pane,
  EditIcon,
  Popover,
  Position,
  SelectField,
} from 'evergreen-ui'
import TextInputField from '../../components/TextInputField'
import {SPACING, CASHBOX_OPERATION} from '../../constants'

function Form({currentBalance, handleCashboxOperation, handleSuccess}: any) {
  const [actionType, setActionType] = React.useState(CASHBOX_OPERATION.ADD)
  const [sumValue, setSumValue] = React.useState('')

  const handleActionTypeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => setActionType(e.target.value),
    [setActionType],
  )

  const handleSumValueChange = React.useCallback(
    (value: any) => setSumValue(value),
    [],
  )

  const handleApply = React.useCallback(() => {
    handleCashboxOperation({actionType, sumValue}).then(handleSuccess)
  }, [actionType, sumValue, handleCashboxOperation])

  return (
    <>
      <SelectField
        label="Action"
        marginBottom={SPACING}
        value={actionType}
        onChange={handleActionTypeChange}
      >
        <option value={CASHBOX_OPERATION.SUBTRACT}>Withdraw</option>
        <option value={CASHBOX_OPERATION.ADD}>Add</option>
      </SelectField>
      <TextInputField
        type="number"
        inputHeight={32}
        value={sumValue}
        onChange={handleSumValueChange}
        label="Sum"
        placeholder={`max: ${currentBalance}`}
      />
      <Button
        width="100%"
        appearance="primary"
        intent="success"
        justifyContent="center"
        onClick={handleApply}
      >
        Apply
      </Button>
    </>
  )
}

function NewCashboxOperation({currentBalance, handleCashboxOperation}: any) {
  const [isShown, setIsShown] = React.useState(false)

  const handleBodyClick = React.useCallback(() => {
    setIsShown(false)
  }, [setIsShown])

  const handleSuccess = React.useCallback(() => {
    setIsShown(false)
  }, [setIsShown])

  return (
    <Popover
      isShown={isShown}
      onBodyClick={handleBodyClick}
      shouldCloseOnExternalClick={false}
      bringFocusInside={true}
      content={
        <Pane padding={SPACING}>
          <Form
            currentBalance={currentBalance}
            handleCashboxOperation={handleCashboxOperation}
            handleSuccess={handleSuccess}
          />
        </Pane>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <span>
        <Button
          height={20}
          appearance="primary"
          iconBefore={EditIcon}
          onClick={() => setIsShown(true)}
        >
          Change Balance
        </Button>
      </span>
    </Popover>
  )
}

export default React.memo(NewCashboxOperation)
