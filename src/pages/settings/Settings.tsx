import React from 'react'
import {Pane, SelectField, Button, toaster} from 'evergreen-ui'
import {useLocale, withErrorBoundary} from '../../utilities'
import {SPACING} from '../../constants'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

function Settings() {
  const [locale, setLocale] = useLocale()
  const systemLanguage = locale.language
  const PAGE_CONST = locale.vars.PAGES.SETTINGS

  const [language, setLanguage] = React.useState(locale.language)

  const handleLanguageChange = React.useCallback(
    (e: any) => {
      setLanguage(e.target.value)
    },
    [setLanguage],
  )

  const handleSave = React.useCallback(() => {
    if (language === systemLanguage) {
      return
    }

    setLocale(language)
    toaster.success(PAGE_CONST.TOASTER.CHANGES_SAVED)
  }, [systemLanguage, language, setLocale, PAGE_CONST])

  return (
    <Pane style={PAGE_WRAPPER_STYLE}>
      <SelectField
        label={PAGE_CONST.INPUTS.LANGUAGE}
        width={200}
        marginBottom={SPACING * 1.5}
        value={language}
        onChange={handleLanguageChange}
      >
        <option value="en">English</option>
        <option value="ru">Русский</option>
      </SelectField>

      <Button appearance="primary" width="auto" onClick={handleSave}>
        {PAGE_CONST.CONTROLS.SAVE_BUTTON_TITLE}
      </Button>
    </Pane>
  )
}

export default withErrorBoundary(Settings)
