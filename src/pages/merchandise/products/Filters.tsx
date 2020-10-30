import React from 'react'
import {SelectField} from 'evergreen-ui'
import {
  PRODUCTS_FILTER_OPTIONS as FILTER_OPTIONS,
  SPACING,
} from '../../../constants'
import FiltersPopoverButton from '../../../components/FiltersPopoverButton'

function Filters({value, handleFilterChange}: any) {
  return (
    <FiltersPopoverButton
      content={
        <SelectField
          label="Products type"
          value={value}
          onChange={handleFilterChange}
          marginBottom={0}
        >
          <option value={FILTER_OPTIONS.ALL}>All</option>
          <option value={FILTER_OPTIONS.IN_STOCK}>In stock</option>
          <option value={FILTER_OPTIONS.SOLD_OUT}>Sold out</option>
        </SelectField>
      }
      isIndicatorShown={value !== FILTER_OPTIONS.IN_STOCK}
      marginLeft={SPACING}
    />
  )
}

export default React.memo(Filters)
