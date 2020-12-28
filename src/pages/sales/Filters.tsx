import React from 'react'
import PickPeriod from '../common/pick-period'
import FiltersPopoverButton from '../../components/FiltersPopoverButton'
import {SPACING} from '../../constants'

export const FILTER_PARAMS_DEFAULT = {
  period: 'all',
  from: null,
  to: null,
}

interface FiltersProps {
  period: string
  handleFilterChange: (params: any) => void
}

function Filters({period, handleFilterChange}: FiltersProps) {
  return (
    <FiltersPopoverButton
      content={<PickPeriod period={period} onChange={handleFilterChange} />}
      isIndicatorShown={period !== FILTER_PARAMS_DEFAULT.period}
      marginLeft={SPACING}
    />
  )
}

export default React.memo(Filters)
