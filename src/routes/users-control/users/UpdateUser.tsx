import React from 'react'
import {SelectField, TextareaField, Pane, Avatar} from 'evergreen-ui'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {STORE_NAME as SN, SPACING} from '../../../constants'
import GlobalContext from '../../../contexts/globalContext'

const NOTE_INPUT_STYLE = {
  resize: 'vertical' as 'vertical',
}

function UpdateUser({sideSheet, onCloseComplete, handleUpdateUser}: any) {
  const {worker} = React.useContext(GlobalContext)
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

  React.useEffect(() => {
    worker.getRows({storeName: SN.GROUPS}).then(setGroups)
  }, [])

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

  const saveChanges = React.useCallback(() => {
    handleUpdateUser({id: doc.id, ...input, avatar, _groupId: groupId})
  }, [handleUpdateUser, doc.id, input, avatar, groupId])

  const canSave = () => {
    if (input.name.length <= 1) {
      return false
    }

    return true
  }

  const userExists = Boolean(doc.id)

  return (
    <SideSheet
      title={userExists ? 'Edit user' : 'Add user'}
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onCloseComplete={onCloseComplete}
      canSave={canSave()}
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
        name="name"
        value={input.name}
        // @ts-ignore
        onChange={handleInput}
        label="Name"
        placeholder="Name..."
        required
      />
      <SelectField
        label="Group"
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
        label="Phone number"
        placeholder="Phone number..."
      />
      <TextareaField
        label="Note"
        value={input.note ?? ''}
        onChange={handleNoteInput}
        style={NOTE_INPUT_STYLE}
      />
    </SideSheet>
  )
}

export default React.memo(UpdateUser)
