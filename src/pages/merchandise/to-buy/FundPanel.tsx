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
import {useLocale, useDatabase, getTestId} from '../../../utilities'
import {PUT_BUDGET} from '../../../constants/events'

const FundPanelItemWrapper = styled.span`
  display: flex;
  align-items: end;
  margin-right: 8px;
`

function FundPanel({computedBuyList, fetchComputedOfToBuyList}: any) {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
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
    [db, fetchComputedOfToBuyList],
  )

  const fundPanelItems = React.useMemo(() => {
    const {budget, needed, spent, remains} = computedBuyList
    return [
      {
        icon: <PieChartIcon color="grey" marginRight={4} />,
        label: FUND_PANEL.NEEDED,
        value: needed && Number(needed).toLocaleString(STRING_FORMAT),
      },
      {
        icon: <BankAccountIcon color="orange" marginRight={4} />,
        label: FUND_PANEL.BUDGET,
        value: (
          <EditablePopoverInput
            value={budget}
            inputType="number"
            onSave={onSaveBudget}
          >
            {Number(budget).toLocaleString(STRING_FORMAT)}
          </EditablePopoverInput>
        ),
      },
      {
        icon: <ArrowDownIcon color="red" marginRight={2} />,
        label: FUND_PANEL.SPENT,
        value: spent && Number(spent).toLocaleString(STRING_FORMAT),
      },
      {
        icon: <TintIcon color="blue" marginRight={2} />,
        label: FUND_PANEL.REMAINS,
        value: remains && Number(remains).toLocaleString(STRING_FORMAT),
      },
    ]
  }, [FUND_PANEL, STRING_FORMAT, computedBuyList, onSaveBudget])

  return (
    <Pane display="inline-flex" alignItems="flex-end">
      {Boolean(fundPanelItems.length) &&
        fundPanelItems.map(
          ({icon, label, value}: any, id: number) =>
            (label === FUND_PANEL.BUDGET || Boolean(value)) && (
              <Tooltip content={label} key={id} showDelay={500}>
                <FundPanelItemWrapper
                  {...getTestId(`to-buy-funds_${label.toLowerCase()}`)}
                >
                  {icon} {value}
                </FundPanelItemWrapper>
              </Tooltip>
            ),
        )}
    </Pane>
  )
}

export default React.memo(FundPanel)
