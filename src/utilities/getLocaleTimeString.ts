export default function getLocaleTimeString(datetime: number, format: string) {
  if (!datetime) {
    return null
  }

  const dateObj = new Date(datetime)

  return {
    date: dateObj.toLocaleDateString(format),
    time: dateObj.toLocaleTimeString(format),
  }
}
