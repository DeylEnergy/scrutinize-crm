import React from 'react'
import {useHistory} from 'react-router-dom'
import {Pane, Alert, SelectField, Button, Checkbox, toaster} from 'evergreen-ui'
import Block from '../../components/Block'
import {
  useLocale,
  useDatabase,
  useDelay,
  useLocalStorage,
  handleAsync,
  withErrorBoundary,
} from '../../utilities'
import {SPACING, IS_SETUP_FINISHED_LOCAL_STATE} from '../../constants'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

const LIST_STYLE = {
  margin: SPACING / 2,
  padding: 0,
}

const FINISH_SETUP_MIN_DELAY = 3000

function Settings() {
  const [locale, setLocale] = useLocale()
  const {INPUTS, CONTROLS, ALERTS, TOASTER} = locale.vars.PAGES.SETUP

  const db = useDatabase()

  const history = useHistory()

  const [isProcessing, {handleDelay}] = useDelay(false, FINISH_SETUP_MIN_DELAY)

  const [isDummyData, setIsDummyData] = React.useState(false)

  const [, setIsSetupFinished] = useLocalStorage(
    IS_SETUP_FINISHED_LOCAL_STATE,
    false,
  )

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

  const handleDummyDataImport = React.useCallback(() => {
    return import('../../dummyData.json').then((fileContent: any) => {
      return db.importObjectStoresData(fileContent).then((result: any) => {
        if (!result) {
          return Promise.reject('Error on file processing.')
        }

        return result
      })
    })
  }, [db])

  const referToMainPage = React.useCallback(() => {
    history.push('/')
  }, [history])

  const handleInstallationComplete = React.useCallback(async () => {
    handleDelay({isProgressing: true})
    if (isDummyData) {
      const [hasBeenImported] = await handleAsync(handleDummyDataImport())

      if (hasBeenImported) {
        toaster.success(TOASTER.IMPORT_SUCCESS)
      } else {
        toaster.danger(TOASTER.IMPORT_FAIL)
        return handleDelay({isProgressing: false})
      }
    }

    setIsSetupFinished(true)
    handleDelay({isProgressing: false, cb: referToMainPage})
  }, [
    isDummyData,
    handleDummyDataImport,
    setIsSetupFinished,
    referToMainPage,
    handleDelay,
    TOASTER,
  ])

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
        <Button
          appearance="primary"
          width="auto"
          isLoading={isProcessing}
          onClick={handleInstallationComplete}
        >
          {CONTROLS.FINISH_BUTTON_TITLE}
        </Button>
      </Pane>
    </Block>
  )
}

export default withErrorBoundary(Settings)
