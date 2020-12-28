export default function getCurrentPeriod() {
  const currentDate = new Date()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const year = currentDate.getFullYear()
  return `${month}/${year}`
}
