import React from 'react'
import {SelectField} from 'evergreen-ui'
import {useLocale} from '../../../utilities'
import {
  PRODUCTS_FILTER_OPTIONS as FILTER_OPTIONS,
  SPACING,
} from '../../../constants'
import FiltersPopoverButton from '../../../components/FiltersPopoverButton'

function Filters({value, handleFilterChange}: any) {
  const [locale] = useLocale()
  const {LIST_TYPE} = locale.vars.PAGES.PRODUCTS.CONTROLS.FILTERS

  return (
    <FiltersPopoverButton
      content={
        <SelectField
          label={LIST_TYPE.TITLE}
          value={value}
          onChange={handleFilterChange}
          marginBottom={0}
        >
          <option value={FILTER_OPTIONS.ALL}>{LIST_TYPE.OPTION_ALL}</option>
          <option value={FILTER_OPTIONS.IN_STOCK}>
            {LIST_TYPE.OPTION_IN_STOCK}
          </option>
          <option value={FILTER_OPTIONS.SOLD_OUT}>
            {LIST_TYPE.OPTION_SOLD_OUT}
          </option>
        </SelectField>
      }
      isIndicatorShown={value !== FILTER_OPTIONS.IN_STOCK}
      marginLeft={SPACING}
    />
  )
}

export default React.memo(Filters)
