import React from 'react'
import {Button, AddIcon, Pane, TextInput, Textarea} from 'evergreen-ui'
import AsyncSelectMenu from '../../components/AsyncSelectMenu'
import {useLocale, useDatabase} from '../../utilities'
import {STORE_NAME as SN, SPACING} from '../../constants'
import {PUT_CUSTOMER} from '../../constants/events'

function CustomerEmptyView({onEmptyButtonClick, searchValue}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS.CONTROLS.CUSTOMER.NO_CUSTOMERS_VIEW

  return (
    <Pane
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Button
        height={32}
        appearance="default"
        iconBefore={AddIcon}
        onClick={onEmptyButtonClick.bind(null, searchValue)}
      >
        {PAGE_CONST.BUTTON_TITLE}
      </Button>
    </Pane>
  )
}

const NEW_CUSTOMER_DEFAULT = {
  id: null,
  name: '',
  phone: '',
  note: '',
}

const NOTE_INPUT_STYLE = {
  resize: 'none' as 'none',
  flexGrow: 1,
}

function NewCustomerView({
  name,
  close,
  handleReturnBack,
  handleCustomerSelect,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS.CONTROLS.CUSTOMER.NEW_CUSTOMER_VIEW

  const db = useDatabase()

  const [input, setInput] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    {...NEW_CUSTOMER_DEFAULT, name},
  )

  const handleInput = React.useCallback(e => {
    setInput({[e.target.name]: e.target.value})
  }, [])

  const handleNoteInput = React.useCallback((e: any) => {
    setInput({note: e.target.value})
  }, [])

  const handleCustomerCreation = React.useCallback(() => {
    db.sendEvent({
      type: PUT_CUSTOMER,
      payload: input,
      consumer: 'client',
    }).then((result: any) => {
      if (!result) {
        return
      }
      handleCustomerSelect({value: result.id, label: result.name})
      close()
    })
  }, [db, input, handleCustomerSelect, close])

  return (
    <Pane height={232} width={240} display="flex" flexDirection="column">
      <Pane
        padding={SPACING}
        overflowY="auto"
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <TextInput
          tabIndex={0}
          name="name"
          value={input.name}
          // @ts-ignore
          onChange={handleInput}
          placeholder={`${PAGE_CONST.INPUTS.NAME}...`}
          marginBottom={SPACING}
          width="100%"
          required
        />
        <TextInput
          name="phone"
          value={input.phone ?? ''}
          // @ts-ignore
          onChange={handleInput}
          // label={COLUMNS.PHONE_NUMBER.TITLE}
          placeholder={`${PAGE_CONST.INPUTS.PHONE_NUMBER}...`}
          marginBottom={SPACING}
          width="100%"
        />

        <Textarea
          placeholder={PAGE_CONST.INPUTS.NOTE}
          value={input.note ?? ''}
          onChange={handleNoteInput}
          style={NOTE_INPUT_STYLE}
        />
      </Pane>
      <Pane
        display="flex"
        justifyContent="space-between"
        padding={SPACING}
        paddingTop={0}
      >
        <Button
          disabled={input.name.length <= 1}
          onClick={handleCustomerCreation}
          width="49%"
          justifyContent="center"
          appearance="primary"
        >
          {PAGE_CONST.SAVE_BUTTON_TITLE}
        </Button>
        <Button onClick={handleReturnBack} width="49%" justifyContent="center">
          {PAGE_CONST.RETURN_BUTTON_TITLE}
        </Button>
      </Pane>
    </Pane>
  )
}

const DEFAULT_VIEW_TYPE = 'DEFAULT'
const NEW_CUSTOMER_VIEW_TYPE = 'NEW_CUSTOMER'

const CURRENT_VIEW_DEFAULT = {
  type: DEFAULT_VIEW_TYPE,
  payload: null,
}

function SelectCustomer({customerId, handleCustomerSelect, children}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS.CONTROLS.CUSTOMER

  const [currentView, setCurrentView] = React.useState<any>(
    CURRENT_VIEW_DEFAULT,
  )

  const [selectProps, setSelectProps] = React.useState({})

  const handleEmptyView = React.useCallback(
    (searchValue: any, close) => (
      <CustomerEmptyView
        onEmptyButtonClick={() =>
          setCurrentView({
            type: NEW_CUSTOMER_VIEW_TYPE,
            payload: {name: searchValue, close},
          })
        }
        searchValue={searchValue}
      />
    ),
    [],
  )

  const handleOnCloseComplete = React.useCallback(() => {
    setCurrentView(CURRENT_VIEW_DEFAULT)
  }, [])

  React.useEffect(() => {
    const {type, payload} = currentView
    if (type === DEFAULT_VIEW_TYPE) {
      setSelectProps({
        title: PAGE_CONST.POPOVER_TITLE,
        hasFilter: true,
        emptyView: handleEmptyView,
        contentView: null,
      })
    } else if (type === NEW_CUSTOMER_VIEW_TYPE) {
      setSelectProps({
        title: PAGE_CONST.NEW_CUSTOMER_VIEW.POPOVER_TITLE,
        hasFilter: false,
        emptyView: null,
        contentView: (
          <NewCustomerView
            name={payload.name}
            close={payload.close}
            handleReturnBack={() => setCurrentView(CURRENT_VIEW_DEFAULT)}
            handleCustomerSelect={handleCustomerSelect}
          />
        ),
      })
    }
  }, [currentView, handleEmptyView, handleCustomerSelect, PAGE_CONST])

  return (
    <AsyncSelectMenu
      selected={customerId}
      onSelect={handleCustomerSelect}
      storeName={SN.CUSTOMERS}
      onCloseComplete={handleOnCloseComplete}
      {...selectProps}
    >
      {children}
    </AsyncSelectMenu>
  )
}

export default React.memo(SelectCustomer)
