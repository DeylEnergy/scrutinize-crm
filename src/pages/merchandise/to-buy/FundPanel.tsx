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
import {useLocale, useDatabase} from '../../../utilities'
import {PUT_BUDGET} from '../../../constants/events'

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
  const [locale] = useLocale()
  const {FUND_PANEL} = locale.vars.PAGES.TO_BUY_LIST.CONTROLS

  const db = useDatabase()

  const onSaveBudget = React.useCallback(
    (newBudget: any) => {
      const numberValue = Number(newBudget)
      if (!isNaN(numberValue)) {
        return db
          .sendEvent({type: PUT_BUDGET, payload: {value: newBudget}})
          .then(fetchComputedOfToBuyList)
      }
    },
    [db],
  )

  const {budget, needed, spent, remains} = computedBuyList

  const fundPanelItems = React.useMemo(() => {
    return [
      {
        icon: <PieChartIcon color="grey" marginRight={4} />,
        label: FUND_PANEL.NEEDED,
        value: needed,
      },
      {
        icon: <BankAccountIcon color="orange" marginRight={4} />,
        label: FUND_PANEL.BUDGET,
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
        label: FUND_PANEL.SPENT,
        value: spent,
      },
      {
        icon: <TintIcon color="blue" marginRight={2} />,
        label: FUND_PANEL.REMAINS,
        value: remains,
      },
    ]
  }, [FUND_PANEL, computedBuyList])

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
