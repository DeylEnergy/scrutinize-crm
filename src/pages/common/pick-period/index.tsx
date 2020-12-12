import React from 'react'
import {SelectField} from 'evergreen-ui'
import {useLocale, useDatabase, reversePeriodView} from '../../../utilities'
import {STORE_NAME as SN} from '../../../constants'

export const FILTER_PARAMS_DEFAULT = {
  period: 'all',
  from: null,
  to: null,
}

function PickPeriod({period, onChange}: any) {
  const [locale] = useLocale()
  const {PICK_PERIOD} = locale.vars.PAGES.COMMON

  const db = useDatabase()

  const [options, setOptions] = React.useState([])

  React.useEffect(() => {
    db.getRows({
      storeName: SN.STATS,
      direction: 'prev',
      format: 'periods',
    }).then(setOptions)
  }, [db])

  return (
    <SelectField
      label={PICK_PERIOD.TITLE}
      marginBottom={0}
      value={period}
      onChange={(e: any) => {
        const selectedPeriod = e.target.value
        const {from, to}: any =
          options.find((x: any) => x.label === selectedPeriod) || {}
        onChange({from, to, period: selectedPeriod})
      }}
    >
      <option value="all">{PICK_PERIOD.OPTION_ALL_TIME}</option>
      {options.map((x: any) => (
        <option key={x.label} value={x.label}>
          {reversePeriodView(x.label)}
        </option>
      ))}
    </SelectField>
  )
}

export default React.memo(PickPeriod)
