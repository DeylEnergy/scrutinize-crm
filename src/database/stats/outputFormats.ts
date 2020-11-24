import {getDateOfPeriod} from '../../utilities'

export function periods(rows: any[]) {
  const result = rows.map((x: any) => {
    const {datetime, date, month, year} = getDateOfPeriod(x.period)
    const to = datetime
    let from
    if (month === 12) {
      from = getDateOfPeriod(`1/${year + 1}`)?.datetime - 1
    } else {
      from = date.setMonth(month) - 1
    }

    return {label: x.period, from, to}
  })

  return result
}
