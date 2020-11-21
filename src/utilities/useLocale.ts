import React from 'react'
import LocaleContext from '../contexts/localeContext'

export default function useLocale() {
  const [locale, setLocale] = React.useContext(LocaleContext)

  return [locale, setLocale]
}
