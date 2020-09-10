export default function getPeriodOfDate(date: Date) {
  const currentMonth = String(date.getMonth() + 1).padStart(2, '0')
  const currentYear = date.getFullYear()
  const currentMonthYear = `${currentMonth}/${currentYear}`

  return currentMonthYear
}
