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
import {useLocale} from '../../utilities'

function Form({currentBalance, handleCashboxOperation, handleSuccess}: any) {
  const [locale] = useLocale()
  const {INPUTS} = locale.vars.PAGES.CASHBOX

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
  }, [handleCashboxOperation, actionType, sumValue, handleSuccess])

  return (
    <>
      <SelectField
        label={INPUTS.ACTION}
        marginBottom={SPACING}
        value={actionType}
        onChange={handleActionTypeChange}
      >
        <option value={CASHBOX_OPERATION.SUBTRACT}>
          {INPUTS.OPTION_WITHDRAW}
        </option>
        <option value={CASHBOX_OPERATION.ADD}>{INPUTS.OPTION_ADD}</option>
      </SelectField>
      <TextInputField
        type="number"
        inputHeight={32}
        value={sumValue}
        onChange={handleSumValueChange}
        label={INPUTS.SUM}
        placeholder={`${INPUTS.SUM_PLACEHOLDER}: ${currentBalance}`}
      />
      <Button
        width="100%"
        appearance="primary"
        intent="success"
        justifyContent="center"
        onClick={handleApply}
      >
        {INPUTS.APPLY_BUTTON_TITLE}
      </Button>
    </>
  )
}

function NewCashboxOperation({currentBalance, handleCashboxOperation}: any) {
  const [locale] = useLocale()
  const {INPUTS} = locale.vars.PAGES.CASHBOX

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
          {INPUTS.CHANGE_BALANCE_BUTTON_TITLE}
        </Button>
      </span>
    </Popover>
  )
}

export default React.memo(NewCashboxOperation)
