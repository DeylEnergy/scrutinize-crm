import React from 'react'
import styled from 'styled-components'
import {
  Pane,
  Tooltip,
  PieChartIcon,
  BankAccountIcon,
  ArrowDownIcon,
  TintIcon,
} from 'evergreen-ui'
import EditablePopoverInput from '../../../components/EditablePopoverInput'
import GlobalContext from '../../../contexts/globalContext'

function FundPanelItemWrapper({className, children, innerRef, ...props}: any) {
  return (
    <span ref={innerRef} className={className} {...props}>
      {children}
    </span>
  )
}

const StyledFundPanelItemWrapper = styled(FundPanelItemWrapper)`
  display: flex;
  align-items: end;
  margin-right: 8px;
`

function FundPanel({computedBuyList, fetchComputedOfToBuyList}: any) {
  const {worker} = React.useContext(GlobalContext)

  const onSaveBudget = React.useCallback(
    (newBudget: any) => {
      const numberValue = Number(newBudget)
      if (!isNaN(numberValue)) {
        return worker
          .putRow('budget', {value: newBudget, id: 1})
          .then(fetchComputedOfToBuyList)
      }
    },
    [worker],
  )

  const {budget, needed, spent, remains} = computedBuyList

  const fundPanelItems = React.useMemo(() => {
    return [
      {
        icon: <PieChartIcon color="grey" marginRight={4} />,
        label: 'Needed',
        value: needed,
      },
      {
        icon: <BankAccountIcon color="orange" marginRight={4} />,
        label: 'Budget',
        value: budget && (
          <EditablePopoverInput
            value={budget}
            inputType="number"
            onSave={onSaveBudget}
          >
            {budget}
          </EditablePopoverInput>
        ),
      },
      {
        icon: <ArrowDownIcon color="red" marginRight={2} />,
        label: 'Spent',
        value: spent,
      },
      {
        icon: <TintIcon color="blue" marginRight={2} />,
        label: 'Remains',
        value: remains,
      },
    ]
  }, [computedBuyList])

  return (
    <Pane display="inline-flex" alignItems="flex-end">
      {Boolean(fundPanelItems.length) &&
        fundPanelItems.map(
          ({icon, label, value}: any, id: number) =>
            Boolean(value) && (
              <Tooltip content={label} key={id} showDelay={500}>
                <StyledFundPanelItemWrapper>
                  {icon} {value}
                </StyledFundPanelItemWrapper>
              </Tooltip>
            ),
        )}
    </Pane>
  )
}

export default React.memo(FundPanel)
