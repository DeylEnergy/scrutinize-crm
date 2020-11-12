import React from 'react'
import {Pane, Alert, SelectField, Button, Checkbox} from 'evergreen-ui'
import Block from '../../components/Block'
import {useLocale, withErrorBoundary} from '../../utilities'
import {SPACING} from '../../constants'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

const LIST_STYLE = {
  margin: SPACING / 2,
  padding: 0,
}

function Settings() {
  const [locale, setLocale] = useLocale()
  const {INPUTS, CONTROLS, TOASTER, ALERTS} = locale.vars.PAGES.SETUP

  const [isDummyData, setIsDummyData] = React.useState(false)

  const handleLanguageChange = React.useCallback(
    (e: any) => {
      setLocale(e.target.value)
    },
    [setLocale],
  )

  const handleDummyDataChange = React.useCallback(
    (e: any) => {
      setIsDummyData(e.target.checked)
    },
    [setIsDummyData],
  )

  return (
    <Block ratio={1}>
      <Pane style={PAGE_WRAPPER_STYLE}>
        <Alert
          intent="none"
          title={ALERTS.WELCOME.TITLE}
          marginBottom={SPACING}
        >
          <ul style={LIST_STYLE}>
            <li>{ALERTS.WELCOME.FIRST_ITEM}</li>
            <li>{ALERTS.WELCOME.SECOND_ITEM}</li>
          </ul>
        </Alert>
        <SelectField
          label={INPUTS.LANGUAGE}
          width={200}
          marginBottom={SPACING}
          value={locale.language}
          onChange={handleLanguageChange}
        >
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </SelectField>
        <Checkbox
          label={INPUTS.GENERATE_DUMMY_DATA}
          checked={isDummyData}
          onChange={handleDummyDataChange}
          marginBottom={SPACING * 1.5}
          width="auto"
        />
        <Button appearance="primary" width="auto" onClick={() => {}}>
          {CONTROLS.FINISH_BUTTON_TITLE}
        </Button>
      </Pane>
    </Block>
  )
}

export default withErrorBoundary(Settings)
