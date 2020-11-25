import React from 'react'
import {TextareaField, Pane, Avatar, Heading} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {SPACING} from '../../../constants'
import {useLocale} from '../../../utilities'
import CustomerStats from './CustomerStats'

const NOTE_INPUT_STYLE = {
  resize: 'vertical' as 'vertical',
}

function UpdateCustomer({
  sideSheet,
  onCloseComplete,
  handleCustomerUpdate,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CUSTOMERS
  const {DRAWER} = PAGE_CONST
  const {COLUMNS} = PAGE_CONST.TABLE

  const doc = sideSheet.value

  const avatarUploadRef = React.useRef<any>()

  const [avatar, setAvatar] = React.useState(doc.avatar ?? '')

  const [input, setInput] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    {
      name: doc.name,
      phone: doc.phone,
      note: doc.note,
    },
  )

  const [isStatsShown, setIsStatsShown] = React.useState(false)

  const handleAvatarUpload = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const {files} = e.target
      if (files && files[0].type.includes('image')) {
        const reader = new FileReader()
        reader.readAsDataURL(files[0])
        reader.onload = () => {
          setAvatar(reader.result)
        }
      }
    },
    [setAvatar],
  )

  const handleAvatarClick = React.useCallback(() => {
    if (avatarUploadRef.current) {
      const clickEvent = new MouseEvent('click')
      avatarUploadRef.current.dispatchEvent(clickEvent)
    }
  }, [])

  const handleInput = React.useCallback((value, e) => {
    setInput({[e.target.name]: value})
  }, [])

  const handleNoteInput = React.useCallback((e: any) => {
    setInput({note: e.target.value})
  }, [])

  const handleStatsDisplay = React.useCallback(() => {
    setIsStatsShown(true)
  }, [setIsStatsShown])

  const saveChanges = React.useCallback(() => {
    handleCustomerUpdate({
      id: doc.id,
      ...input,
      avatar,
    })
  }, [handleCustomerUpdate, doc.id, input, avatar])

  const canSave = () => {
    if (input.name.length <= 1) {
      return false
    }

    return true
  }

  const canBeSaved = canSave()

  const customerExists = Boolean(doc.id)

  return (
    <SideSheet
      title={
        customerExists ? DRAWER.TITLE_EDIT_CUSTOMER : DRAWER.TITLE_NEW_CUSTOMER
      }
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onOpenComplete={handleStatsDisplay}
      onCloseComplete={onCloseComplete}
      canSave={canBeSaved}
    >
      <input
        ref={avatarUploadRef}
        type="file"
        onChange={handleAvatarUpload}
        hidden
      />
      <Pane display="flex" justifyContent="center" marginBottom={SPACING}>
        <Avatar
          src={avatar}
          onClick={handleAvatarClick}
          name={input.name || 'C'}
          size={100}
          cursor="pointer"
        />
      </Pane>
      <TextInputField
        tabIndex={0}
        name="name"
        value={input.name}
        // @ts-ignore
        onChange={handleInput}
        label={COLUMNS.NAME.TITLE}
        placeholder={`${COLUMNS.NAME.TITLE}...`}
        required
      />

      <TextInputField
        name="phone"
        value={input.phone ?? ''}
        // @ts-ignore
        onChange={handleInput}
        label={COLUMNS.PHONE_NUMBER.TITLE}
        placeholder={`${COLUMNS.PHONE_NUMBER.TITLE}...`}
      />
      <TextareaField
        label={COLUMNS.NOTE.TITLE}
        value={input.note ?? ''}
        onChange={handleNoteInput}
        style={NOTE_INPUT_STYLE}
        marginBottom={8}
      />
      {customerExists && (
        <>
          <Heading
            size={400}
            fontWeight={500}
            color="#425A70"
            marginTop={SPACING / 2}
            marginBottom={SPACING / 2}
          >
            {DRAWER.LABELS.CUSTOMER_STATS}
          </Heading>
          <Pane marginBottom={SPACING} padding={2}>
            {isStatsShown && <CustomerStats customerId={doc.id} />}
          </Pane>
        </>
      )}
    </SideSheet>
  )
}

export default React.memo(UpdateCustomer)
