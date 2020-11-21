import React from 'react'
import {Popover} from 'evergreen-ui'

function noop() {}

function makeBackdrop() {
  const backdrop = document.createElement('div')
  backdrop.style.pointerEvents = 'all'
  backdrop.style.position = 'absolute'
  backdrop.style.top = '0px'
  backdrop.style.height = '100vh'
  backdrop.style.width = '100vw'

  return backdrop
}

function CustomPopover({
  onOpen = noop,
  onOpenComplete = noop,
  onClose = noop,
  ...props
}: any) {
  const refs = React.useRef<any>({})

  const handleOpen = React.useCallback(
    (item: any) => {
      const body: HTMLBodyElement | null = document.querySelector('body')
      if (body) {
        body.style.pointerEvents = 'none'
        refs.current = {...refs.current, body}
      }

      onOpen(item)
    },
    [onOpen],
  )

  const handleOpenComplete = React.useCallback(
    (item: any) => {
      const portal: HTMLBodyElement | null = document.querySelector(
        'div[evergreen-portal-container]',
      )
      const backdrop: HTMLDivElement | null = makeBackdrop()

      if (portal && backdrop) {
        portal.style.pointerEvents = 'all'
        portal.insertAdjacentElement('afterend', backdrop)

        refs.current = {...refs.current, portal, backdrop}
      }

      onOpenComplete(item)
    },
    [onOpenComplete],
  )

  const handleClose = React.useCallback(
    (item: any) => {
      const {body, backdrop} = refs.current
      if (backdrop) {
        backdrop.remove()
      }

      if (body) {
        body.style.pointerEvents = 'all'
      }

      onClose(item)
    },
    [onClose],
  )

  return (
    <Popover
      onOpen={handleOpen}
      onOpenComplete={handleOpenComplete}
      onClose={handleClose}
      {...props}
    />
  )
}

export default React.memo(CustomPopover)
