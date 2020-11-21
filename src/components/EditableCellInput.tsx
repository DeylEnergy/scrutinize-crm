import React from 'react'
import ReactDOM from 'react-dom'
import TextInputField from './TextInputField'

const CELL_WRAPPER_STYLE = {
  pointerEvents: 'all',
  position: 'absolute',
  zIndex: 21,
  padding: 0,
}

const CELL_INPUT_STYLE = {
  margin: 0,
  height: '100%',
  width: '100%',
  padding: '0px 12px',
  fontFamily: 'Roboto',
  fontSize: '12px',
  letterSpacing: '0.2px',
  lineHeight: 0,
  position: 'relative',
  top: -1,
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
        style={CELL_INPUT_STYLE}
      />
    </div>
  )
}

function EditableCellInput({anchor, gridOuterRef}: any) {
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

    if (anchor && portalRef.current && gridOuterRef) {
      gridOuterRef.style.pointerEvents = 'none'
      portalRef.current.querySelector('input').focus()
    } else if (gridOuterRef) {
      gridOuterRef.style.pointerEvents = 'auto'
    }
  }, [anchor])

  return (
    anchor &&
    ReactDOM.createPortal(<CellInput anchor={anchor} />, portalRef.current)
  )
}

export default EditableCellInput
