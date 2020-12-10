import React from 'react'
import {v4 as uuidv4} from 'uuid'
import {useHistory} from 'react-router-dom'
import {
  Pane,
  Alert,
  IconButton,
  EyeOpenIcon,
  Tooltip,
  SelectField,
  Button,
  Checkbox,
  toaster,
} from 'evergreen-ui'
import Block from '../../components/Block'
import TextInputField from '../../components/TextInputField'
import {
  useLocale,
  useSetup,
  useDatabase,
  useAccount,
  useDelay,
  useUpdate,
  handleAsync,
  withErrorBoundary,
} from '../../utilities'
import {SPACING, STORE_NAME as SN} from '../../constants'
import {PUT_OWNER_USER} from '../../constants/events'
import SeeSecretKeyPopover from '../../components/SeeSecretKeyPopover'

const PAGE_WRAPPER_STYLE = {padding: `0 ${SPACING}px`}

const LIST_STYLE = {
  margin: SPACING / 2,
  padding: 0,
}

const FINISH_SETUP_MIN_DELAY = 3000

const BUDGET_STORE_DEFAULT = {
  id: 1,
  value: 0,
  cashboxValue: 0,
}

function Setup() {
  const [locale, setLocale] = useLocale()
  const {
    INPUTS,
    CONTROLS,
    ALERTS,
    TOASTER,
    TOOLTIP,
    MISC,
  } = locale.vars.PAGES.SETUP

  const [, setSetup] = useSetup()

  const db = useDatabase()

  const [, setAccount] = useAccount()

  const history = useHistory()

  const [ownerData, setOwnerData] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    null,
    () => ({
      groupName: MISC.OWNER_GROUP_NAME,
      userId: uuidv4(),
      userName: '',
      secretKey: uuidv4(),
    }),
  )

  const [hasSavedSecretKey, setHasSavedSecretKey] = React.useState(false)

  const [isProcessing, {handleDelay}] = useDelay(false, FINISH_SETUP_MIN_DELAY)

  const [isDummyData, setIsDummyData] = React.useState(false)

  const handleLanguageChange = React.useCallback(
    (e: any) => {
      setLocale(e.target.value)
    },
    [setLocale],
  )

  const handleOwnerNameChange = React.useCallback(
    (value: string) => setOwnerData({userName: value}),
    [],
  )

  const handleHasSavedSecretKeyChange = React.useCallback((e: any) => {
    setHasSavedSecretKey(e.target.checked)
  }, [])

  const handleDummyDataChange = React.useCallback(
    (e: any) => {
      setIsDummyData(e.target.checked)
    },
    [setIsDummyData],
  )

  const registerOwnerUser = React.useCallback(() => {
    return db
      .sendEvent({
        type: PUT_OWNER_USER,
        payload: ownerData,
      })
      .then((accountData: any) => {
        if (!accountData) {
          return Promise.reject(TOASTER.REGISTER_OWNER_FAIL)
        }

        return accountData
      })
  }, [db, ownerData, TOASTER])

  const createBudgetStore = React.useCallback(() => {
    return db
      .putRow(SN.BUDGET, BUDGET_STORE_DEFAULT)
      .then((budgetData: any) => {
        if (!budgetData) {
          return Promise.reject(TOASTER.BUDGET_STORE_FAIL)
        }

        return budgetData
      })
  }, [db, TOASTER])

  const handleDummyDataImport = React.useCallback(() => {
    return import('../../dummyData.json').then((fileContent: any) => {
      return db.importObjectStoresData(fileContent).then((result: any) => {
        if (!result) {
          return Promise.reject(TOASTER.IMPORT_FAIL)
        }

        return result
      })
    })
  }, [db, TOASTER])

  const signIn = React.useCallback(
    (accountData: any) => {
      const {user, group} = accountData
      setAccount({
        user,
        permissions: group.permissions,
        groupName: group.name,
        groupId: group.id,
      })
    },
    [setAccount],
  )

  const startUsingApp = React.useCallback(
    (accountData: any) => {
      signIn(accountData)
      setSetup({isFinished: true})
      history.push('/')
    },
    [history, signIn, setSetup],
  )

  const handleInstallationComplete = React.useCallback(async () => {
    handleDelay({isProgressing: true})

    const [accountData, ownerRegisterError] = await handleAsync(
      registerOwnerUser(),
    )

    if (ownerRegisterError) {
      return handleDelay({
        isProgressing: false,
        cb: () => toaster.danger(ownerRegisterError),
      })
    }

    const [, budgetStoreError] = await handleAsync(createBudgetStore())

    if (budgetStoreError) {
      return handleDelay({
        isProgressing: false,
        cb: () => toaster.danger(budgetStoreError),
      })
    }

    if (isDummyData) {
      const [, importDataError] = await handleAsync(handleDummyDataImport())

      if (importDataError) {
        return handleDelay({
          isProgressing: false,
          cb: () => toaster.danger(importDataError),
        })
      }
    }

    handleDelay({isProgressing: false, cb: () => startUsingApp(accountData)})
  }, [
    registerOwnerUser,
    createBudgetStore,
    isDummyData,
    handleDummyDataImport,
    startUsingApp,
    handleDelay,
  ])

  useUpdate(() => {
    setOwnerData({groupName: MISC.OWNER_GROUP_NAME})
  }, [MISC])

  const isValidOwnerName = ownerData.userName.length > 1

  const cannotFinishSetup = !isValidOwnerName || !hasSavedSecretKey

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
            <li>{ALERTS.WELCOME.THIRD_ITEM}</li>
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
        <Pane display="flex" width={200}>
          <TextInputField
            value={ownerData.ownerName}
            onChange={handleOwnerNameChange}
            label={INPUTS.OWNER_NAME}
            marginBottom={0}
            marginRight={4}
            placeholder={`${INPUTS.OWNER_NAME}...`}
          />
          <SeeSecretKeyPopover
            userId={ownerData.userId}
            secretKey={ownerData.secretKey}
            disabled={!isValidOwnerName}
          >
            <Tooltip content={TOOLTIP.SEE_SECRET_KEY}>
              <IconButton
                disabled={!isValidOwnerName}
                icon={EyeOpenIcon}
                alignSelf="flex-end"
              />
            </Tooltip>
          </SeeSecretKeyPopover>
        </Pane>
        <Checkbox
          label={INPUTS.SAVED_SECRET_KEY}
          checked={hasSavedSecretKey}
          onChange={handleHasSavedSecretKeyChange}
          marginBottom={SPACING * 1.5}
          width="auto"
        />
        <Checkbox
          label={INPUTS.GENERATE_DUMMY_DATA}
          checked={isDummyData}
          onChange={handleDummyDataChange}
          marginBottom={SPACING * 1.5}
          width="auto"
        />
        <Button
          disabled={cannotFinishSetup}
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

export default withErrorBoundary(Setup)
