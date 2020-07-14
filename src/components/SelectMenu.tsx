import React from 'react'
import {SelectMenu, Button, Position} from 'evergreen-ui'

function makeBackdrop() {
  const backdrop = document.createElement('div')
  backdrop.style.pointerEvents = 'all'
  backdrop.style.position = 'absolute'
  backdrop.style.top = '0px'
  backdrop.style.height = '100vh'
  backdrop.style.width = '100vw'

  return backdrop
}

const SELECT_MENU_STYLE = {
  maxWidth: '100%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'block',
}

function SelectMenuComponent({
  options,
  selected,
  title,
  buttonLabel,
  onClose,
  buttonProps = {},
  position = Position.BOTTOM_LEFT,
}: any) {
  const [state, setState] = React.useState<any>({selected: selected.value})
  const refs = React.useRef<any>({})

  const handleOpen = () => {
    const body: HTMLBodyElement | null = document.querySelector('body')
    if (body) {
      body.style.pointerEvents = 'none'
      refs.current = {...refs.current, body}
    }
  }

  const handleOpenComplete = () => {
    const portal: HTMLBodyElement | null = document.querySelector(
      'div[evergreen-portal-container]',
    )
    const backdrop: HTMLDivElement | null = makeBackdrop()

    if (portal && backdrop) {
      portal.style.pointerEvents = 'all'
      portal.insertAdjacentElement('afterend', backdrop)

      refs.current = {...refs.current, portal, backdrop}
    }
  }

  const handleClose = () => {
    const {body, backdrop} = refs.current
    if (backdrop) {
      backdrop.remove()
    }

    if (body) {
      body.style.pointerEvents = 'all'
    }

    onClose(state.selected)
  }

  return (
    <SelectMenu
      onOpen={handleOpen}
      onOpenComplete={handleOpenComplete}
      onClose={handleClose}
      title={title}
      options={options}
      selected={state.selected}
      onSelect={item => setState({selected: item.value, label: item.label})}
      position={position}
    >
      <Button style={SELECT_MENU_STYLE} {...buttonProps}>
        {state.label || selected.label || buttonLabel}
      </Button>
    </SelectMenu>
  )
}

export default SelectMenuComponent
