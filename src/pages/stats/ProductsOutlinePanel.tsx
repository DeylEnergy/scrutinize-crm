import React from 'react'
import styled from 'styled-components'
import {Pane, Tooltip, CubeIcon, KeyShiftIcon} from 'evergreen-ui'
import {useLocale, useDatabase} from '../../utilities'
import {SPACING, STORE_NAME as SN} from '../../constants'

const PRODUCT_NUMBERS_ICON_COLOR = '#50a3f1'
const POTENTIAL_INCOME_SUM_ICON_COLOR = '#04bb04'
const POTENTIAL_SALE_SUM_ICON_COLOR = '#ffb600'

const OutlineItem = styled.span`
  display: flex;
  align-items: end;
  margin-right: ${SPACING}px;
`

function ProductsOutlinePanel() {
  const [locale] = useLocale()
  const {STRING_FORMAT} = locale.vars.GENERAL
  const {PRODUCTS_OUTLINE_PANEL} = locale.vars.PAGES.STATS.CONTROLS

  const db = useDatabase()

  const [panelItems, setPanelItems] = React.useState<any>([])

  React.useEffect(() => {
    db.perform({storeName: SN.STATS, action: 'currentProductsOutline'}).then(
      (result: any) => {
        if (!result) {
          return
        }

        const {
          activeProductsNumber,
          potentialIncomeSum,
          potentialSaleSum,
        } = result

        const currentPanelItems = [
          {
            icon: (
              <CubeIcon color={PRODUCT_NUMBERS_ICON_COLOR} marginRight={4} />
            ),
            label: PRODUCTS_OUTLINE_PANEL.PRODUCTS_NUMBER,
            value: activeProductsNumber,
          },
          {
            icon: (
              <KeyShiftIcon
                color={POTENTIAL_INCOME_SUM_ICON_COLOR}
                marginRight={4}
              />
            ),
            label: PRODUCTS_OUTLINE_PANEL.POTENTIAL_INCOME_SUM,
            value:
              potentialIncomeSum &&
              Number(potentialIncomeSum).toLocaleString(STRING_FORMAT),
          },
          {
            icon: (
              <KeyShiftIcon
                color={POTENTIAL_SALE_SUM_ICON_COLOR}
                marginRight={4}
              />
            ),
            label: PRODUCTS_OUTLINE_PANEL.POTENTIAL_SALE_SUM,
            value:
              potentialSaleSum &&
              Number(potentialSaleSum).toLocaleString(STRING_FORMAT),
          },
        ]
        setPanelItems(currentPanelItems)
      },
    )
  }, [db, STRING_FORMAT, PRODUCTS_OUTLINE_PANEL])

  return (
    <Pane display="inline-flex" alignItems="flex-end" paddingTop={4}>
      {Boolean(panelItems.length) &&
        panelItems.map(
          ({icon, label, value}: any, id: number) =>
            Boolean(value) && (
              <Tooltip content={label} key={id} showDelay={500}>
                <OutlineItem>
                  {icon} {value}
                </OutlineItem>
              </Tooltip>
            ),
        )}
    </Pane>
  )
}

export default React.memo(ProductsOutlinePanel)
