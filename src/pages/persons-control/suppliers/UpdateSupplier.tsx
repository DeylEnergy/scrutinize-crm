import React from 'react'
import {TextareaField, Pane, Avatar, Heading} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {SPACING} from '../../../constants'
import {useLocale, getTestId} from '../../../utilities'
import SupplierStats from './SupplierStats'

const NOTE_INPUT_STYLE = {
  resize: 'vertical' as 'vertical',
}

function UpdateSupplier({
  sideSheet,
  onCloseComplete,
  handleSupplierUpdate,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.SUPPLIERS
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
      address: doc.address,
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

  const handleAddressInput = React.useCallback((e: any) => {
    setInput({address: e.target.value})
  }, [])

  const handleNoteInput = React.useCallback((e: any) => {
    setInput({note: e.target.value})
  }, [])

  const handleStatsDisplay = React.useCallback(() => {
    setIsStatsShown(true)
  }, [setIsStatsShown])

  const saveChanges = React.useCallback(() => {
    handleSupplierUpdate({
      id: doc.id,
      ...input,
      avatar,
    })
  }, [handleSupplierUpdate, doc.id, input, avatar])

  const canSave = () => {
    if (input.name.length <= 1) {
      return false
    }

    return true
  }

  const canBeSaved = canSave()

  const supplierExists = Boolean(doc.id)

  return (
    <SideSheet
      title={
        supplierExists ? DRAWER.TITLE_EDIT_SUPPLIER : DRAWER.TITLE_NEW_SUPPLIER
      }
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onOpenComplete={handleStatsDisplay}
      onCloseComplete={onCloseComplete}
      canSave={canBeSaved}
      containerProps={getTestId('update-supplier-sidesheet')}
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
          name={input.name || 'U'}
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
        label={COLUMNS.ADDRESS.TITLE}
        value={input.address ?? ''}
        onChange={handleAddressInput}
        style={NOTE_INPUT_STYLE}
        marginBottom={8}
      />
      <TextareaField
        label={COLUMNS.NOTE.TITLE}
        value={input.note ?? ''}
        onChange={handleNoteInput}
        style={NOTE_INPUT_STYLE}
        marginBottom={8}
      />
      {supplierExists && (
        <>
          <Heading
            size={400}
            fontWeight={500}
            color="#425A70"
            marginTop={SPACING / 2}
            marginBottom={SPACING / 2}
          >
            {DRAWER.LABELS.SUUPLIER_STATS}
          </Heading>
          <Pane marginBottom={SPACING} padding={2}>
            {isStatsShown && <SupplierStats supplierId={doc.id} />}
          </Pane>
        </>
      )}
    </SideSheet>
  )
}

export default React.memo(UpdateSupplier)
