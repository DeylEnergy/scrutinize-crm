import {getLocaleTimeString} from './index'

const OPTIONS_DEFAULT = {
  numeric: 'auto' as 'auto',
}

const LOCALE_DEFAULT = 'en-US'

function getMidnightDatetime(datetime: number) {
  return new Date(datetime).setHours(0, 0, 0, 0)
}

function getPassedDaysNumber(previous: number) {
  const currentMidnight = getMidnightDatetime(Date.now())
  const previousMidnight = getMidnightDatetime(previous)

  const DAY_MS = 86400000

  return Math.ceil((currentMidnight - previousMidnight) / DAY_MS)
}

function getLocalizedDateTime(datetime: number, locale: string) {
  const isPastYear =
    new Date().getFullYear() !== new Date(datetime).getFullYear()

  const localizedDate = new Intl.DateTimeFormat(locale, {
    year: isPastYear ? 'numeric' : undefined,
    month: 'short',
    day: 'numeric',
  })

  // @ts-ignore
  const {time} = getLocaleTimeString(datetime, locale)

  return `${localizedDate.format(datetime)}, ${time}`
}

export default function getRelativeDateTime({
  datetime,
  locale = LOCALE_DEFAULT,
  options = OPTIONS_DEFAULT,
}: {
  datetime: number
  locale?: string
  // @ts-ignore
  options?: Intl.RelativeTimeFormatOptions
}) {
  const hasNotIntlSupport = !Boolean(window.Intl)

  if (hasNotIntlSupport) {
    const localeTimeString = getLocaleTimeString(datetime, locale)
    // @ts-ignore
    const {date, time} = localeTimeString
    return `${date}, ${time}`
  }

  const daysPassed = getPassedDaysNumber(datetime)

  // @ts-ignore
  const {time} = getLocaleTimeString(datetime, locale)

  if (daysPassed > 1) {
    return getLocalizedDateTime(datetime, locale)
  }

  // @ts-ignore
  const relativeLib = new Intl.RelativeTimeFormat(locale, options)
  const relativeDayWord = relativeLib.format(-daysPassed, 'day')

  return `${relativeDayWord}, ${time}`
}
