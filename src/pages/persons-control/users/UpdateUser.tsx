import React from 'react'
import {v4 as uuidv4} from 'uuid'
import {
  SelectField,
  TextareaField,
  Pane,
  Avatar,
  Heading,
  Button,
  EyeOpenIcon,
  RefreshIcon,
  toaster,
} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {STORE_NAME as SN, SPACING} from '../../../constants'
import SeeSecretKeyPopover from '../../../components/SeeSecretKeyPopover'
import {useLocale, useAccount, useDatabase, getTestId} from '../../../utilities'
import RIGHTS from '../../../constants/rights'
import UserStats from './UserStats'

const NOTE_INPUT_STYLE = {
  resize: 'vertical' as 'vertical',
}

function UpdateUser({sideSheet, onCloseComplete, handleUpdateUser}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.USERS
  const {DRAWER} = PAGE_CONST
  const {COLUMNS} = PAGE_CONST.TABLE
  const [{permissions, user}] = useAccount()

  const db = useDatabase()

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

  const [groups, setGroups] = React.useState([])

  const [groupId, setGroupId] = React.useState(doc._groupId)

  const [secretKey, setSecretKey] = React.useState(
    () => doc.secretKey || uuidv4(),
  )

  const [isStatsShown, setIsStatsShown] = React.useState(false)

  React.useEffect(() => {
    db.getRows({storeName: SN.GROUPS}).then(setGroups)
  }, [db])

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

  const handleGenerateSecretKey = React.useCallback(() => {
    setSecretKey(uuidv4())
    toaster.success(DRAWER.TOASTER.NEW_SECRET_KEY_GENERATION_SUCCESS)
  }, [DRAWER])

  const handleStatsDisplay = React.useCallback(() => {
    setIsStatsShown(true)
  }, [setIsStatsShown])

  const saveChanges = React.useCallback(() => {
    handleUpdateUser({
      id: doc.id,
      ...input,
      avatar,
      secretKey,
      _groupId: groupId,
    })
  }, [handleUpdateUser, doc.id, input, avatar, secretKey, groupId])

  const canSave = () => {
    if (input.name.length <= 1) {
      return false
    }

    return true
  }

  const canBeSaved = canSave()

  const userExists = Boolean(doc.id)

  const canSeeCredentials =
    !userExists ||
    user?.id === doc.id ||
    permissions.includes(RIGHTS.CAN_SEE_OTHER_USER_SECRET_KEYS)

  const giveDefaultGroupId = React.useCallback(() => {
    if (groups.length) {
      const [defaultGroup]: any = groups
      setGroupId(defaultGroup.id)
    }
  }, [groups])

  React.useEffect(() => {
    if (!groupId) {
      // this condition should execute once
      giveDefaultGroupId()
    }
  }, [groupId, giveDefaultGroupId])

  React.useEffect(() => {
    if (!doc.id) {
      setInput({futureId: uuidv4()})
    }
  }, [doc.id])

  return (
    <SideSheet
      title={userExists ? DRAWER.TITLE_EDIT_USER : DRAWER.TITLE_NEW_USER}
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onOpenComplete={handleStatsDisplay}
      onCloseComplete={onCloseComplete}
      canSave={canBeSaved}
      containerProps={getTestId('update-user-sidesheet')}
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
      <SelectField
        label={COLUMNS.GROUP.TITLE}
        marginBottom={SPACING * 1.5}
        inputHeight={SPACING * 5}
        value={groupId}
        onChange={(e: any) => setGroupId(e.target.value)}
      >
        {groups.map((x: any) => (
          <option key={x.id} value={x.id}>
            {x.name}
          </option>
        ))}
      </SelectField>
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
      {canSeeCredentials && (
        <>
          <Heading
            size={400}
            fontWeight={500}
            color="#425A70"
            marginTop={SPACING / 2}
            marginBottom={SPACING / 2}
          >
            {DRAWER.LABELS.CREDENTIALS}
          </Heading>
          <Pane
            display="flex"
            justifyContent="space-between"
            marginBottom={SPACING * 1.5}
          >
            <SeeSecretKeyPopover
              userId={doc.id ?? input.futureId}
              secretKey={secretKey}
              disabled={!canBeSaved}
            >
              <Button
                intent="success"
                iconBefore={EyeOpenIcon}
                justifyContent="center"
                width="49%"
                disabled={!canBeSaved}
              >
                {DRAWER.BUTTONS.SEE_AUTHORIZATION_KEY}
              </Button>
            </SeeSecretKeyPopover>
            <Button
              intent="warning"
              iconBefore={RefreshIcon}
              justifyContent="center"
              width="49%"
              onClick={handleGenerateSecretKey}
              disabled={!canBeSaved}
            >
              {DRAWER.BUTTONS.GENERATE_NEW_KEY}
            </Button>
          </Pane>
        </>
      )}
      {userExists && (
        <>
          <Heading
            size={400}
            fontWeight={500}
            color="#425A70"
            marginTop={SPACING / 2}
            marginBottom={SPACING / 2}
          >
            {DRAWER.LABELS.USER_STATS}
          </Heading>
          <Pane marginBottom={SPACING} padding={2}>
            {isStatsShown && <UserStats userId={doc.id} />}
          </Pane>
        </>
      )}
    </SideSheet>
  )
}

export default React.memo(UpdateUser)
