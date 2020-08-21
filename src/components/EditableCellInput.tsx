import React from 'react'
import ReactDOM from 'react-dom'
import TextInputField from './TextInputField'

const CELL_WRAPPER_STYLE = {
  pointerEvents: 'all',
  position: 'absolute',
  zIndex: 21,
  padding: '3px 4px 0 4px',
}

function CellInput({anchor}: any) {
  const [value, setValue] = React.useState(anchor.value)

  const handleSave = () => {
    const {updateItem, cellName} = anchor
    updateItem({[cellName]: value || anchor.value})
  }

  return (
    <div
      style={{
        ...CELL_WRAPPER_STYLE,
        ...anchor.style,
      }}
    >
      <TextInputField
        id="edit"
        type={anchor.valueType}
        value={value}
        onChange={(val: any) => setValue(val)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.keyCode === 13) {
            e.currentTarget.blur()
          }
        }}
        onBlur={handleSave}
      />
    </div>
  )
}

function EditableCellInput({anchor}: any) {
  const portalRef = React.useRef<HTMLDivElement | null | any>(null)

  React.useEffect(() => {
    const body = document.querySelector('body')

    if (body) {
      const portal = document.createElement('div')
      portal.id = 'input-portal'
      body.appendChild(portal)
      portalRef.current = portal
    }

    return () => {
      if (portalRef.current) {
        portalRef.current.remove()
      }
    }
  }, [])

  React.useEffect(() => {
    const body = document.querySelector('body')
    if (!body) {
      return
    }

    if (anchor && portalRef.current) {
      body.style.pointerEvents = 'none'
      portalRef.current.querySelector('input').focus()
    } else {
      body.style.pointerEvents = 'auto'
    }
  }, [anchor])

  return (
    anchor &&
    ReactDOM.createPortal(<CellInput anchor={anchor} />, portalRef.current)
  )
}

export default EditableCellInput
