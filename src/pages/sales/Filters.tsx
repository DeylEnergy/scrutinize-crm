import React from 'react'
import {SelectField} from 'evergreen-ui'
import FiltersPopoverButton from '../../components/FiltersPopoverButton'
import {useLocale, useDatabase} from '../../utilities'
import {STORE_NAME as SN, SPACING} from '../../constants'

export const FILTER_PARAMS_DEFAULT = {
  period: 'all',
  from: null,
  to: null,
}

function Options({period, handleFilterChange}: any) {
  const [locale] = useLocale()
  const {FILTERS} = locale.vars.PAGES.SALES.CONTROLS
  const {PERIOD} = FILTERS
  const db = useDatabase()
  const [periodOptions, setPeriodOptions] = React.useState([])

  React.useEffect(() => {
    db.getRows({
      storeName: SN.STATS,
      direction: 'prev',
      format: 'periods',
    }).then(setPeriodOptions)
  }, [])

  return (
    <SelectField
      label="Period"
      marginBottom={0}
      value={period}
      onChange={(e: any) => {
        const selectedPeriod = e.target.value
        const {from, to}: any =
          periodOptions.find((x: any) => x.label === selectedPeriod) || {}
        handleFilterChange({from, to, period: selectedPeriod})
      }}
    >
      <option value="all">{PERIOD.OPTION_ALL_TIME}</option>
      {periodOptions.map((x: any) => (
        <option key={x.label} value={x.label}>
          {x.label}
        </option>
      ))}
    </SelectField>
  )
}

interface FiltersProps {
  period: string
  handleFilterChange: (params: any) => void
}

function Filters({period, handleFilterChange}: FiltersProps) {
  return (
    <FiltersPopoverButton
      content={
        <Options period={period} handleFilterChange={handleFilterChange} />
      }
      isIndicatorShown={period !== FILTER_PARAMS_DEFAULT.period}
      marginLeft={SPACING}
    />
  )
}

export default React.memo(Filters)
