import React from 'react'
import {SelectField} from 'evergreen-ui'
import {useLocale} from '../../../utilities'
import {
  TO_BUY_FILTER_OPTIONS as FILTER_OPTIONS,
  SPACING,
} from '../../../constants'
import FiltersPopoverButton from '../../../components/FiltersPopoverButton'

function Filters({value, handleFilterChange}: any) {
  const [locale] = useLocale()
  const {FILTERS} = locale.vars.PAGES.TO_BUY_LIST.CONTROLS
  const {LIST_TYPE} = FILTERS
  return (
    <FiltersPopoverButton
      content={
        <SelectField
          label={LIST_TYPE.TITLE}
          marginBottom={0}
          value={value}
          onChange={handleFilterChange}
        >
          <option value={FILTER_OPTIONS.ACTIVE}>
            {LIST_TYPE.OPTION_ACTIVE}
          </option>
          <option value={FILTER_OPTIONS.HAVE_TO_BUY}>
            {LIST_TYPE.OPTION_HAVE_TO_BUY}
          </option>
          <option value={FILTER_OPTIONS.BOUGHT}>
            {LIST_TYPE.OPTION_BOUGHT}
          </option>
          <option value={FILTER_OPTIONS.FROZEN}>
            {LIST_TYPE.OPTION_FROZEN}
          </option>
        </SelectField>
      }
      isIndicatorShown={value !== FILTER_OPTIONS.ACTIVE}
      marginRight={SPACING}
    />
  )
}

export default React.memo(Filters)
