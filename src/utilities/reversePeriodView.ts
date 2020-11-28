export default function reversePeriodView(period: string) {
  return period
    .split('/')
    .reverse()
    .join('/')
}
