import React from 'react'
import {SelectField} from 'evergreen-ui'
import {
  TO_BUY_FILTER_OPTIONS as FILTER_OPTIONS,
  SPACING,
} from '../../../constants'
import FiltersPopoverButton from '../../../components/FiltersPopoverButton'

function Filters({value, handleFilterChange}: any) {
  return (
    <FiltersPopoverButton
      content={
        <SelectField
          label="List type"
          marginBottom={0}
          value={value}
          onChange={handleFilterChange}
        >
          <option value={FILTER_OPTIONS.ACTIVE}>Active</option>
          <option value={FILTER_OPTIONS.HAVE_TO_BUY}>Have to buy</option>
          <option value={FILTER_OPTIONS.BOUGHT}>Bought</option>
          <option value={FILTER_OPTIONS.FROZEN}>Frozen</option>
        </SelectField>
      }
      isIndicatorShown={value !== FILTER_OPTIONS.ACTIVE}
      marginRight={SPACING}
    />
  )
}

export default React.memo(Filters)
