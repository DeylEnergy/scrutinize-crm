export default function getDateOfPeriod(period: string) {
  const [month, year] = period.split('/').map((x: any) => Number(x))

  const date = new Date(`${month}/1/${year}`)

  return {date, datetime: date.getTime(), month, year}
}
