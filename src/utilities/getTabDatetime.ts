export default function getTabDatetime(value: string) {
  const [datetime] = value.split('_')
  return Number(datetime)
}
