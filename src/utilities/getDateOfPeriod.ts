export default function getDateOfPeriod(period: string) {
  const [year, month] = period.split('/').map((x: any) => Number(x))

  const date = new Date(`${month}/1/${year}`)

  return {date, datetime: date.getTime(), month, year}
}
