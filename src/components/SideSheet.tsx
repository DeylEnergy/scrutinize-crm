import React from 'react'
import {SideSheet, Pane, Heading, Button} from 'evergreen-ui'
import {getTestId} from '../utilities'
interface SideSheetComponentProps {
  title: string
  isShown: boolean
  children: React.ReactNode
  onSaveButtonClick: () => void
  onOpenComplete?: () => void
  onCloseComplete: () => void
  canSave?: boolean
  containerProps?: any
}

const CONTAINER_PROPS_STYLE = {
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
}

export default function SideSheetComponent({
  title,
  isShown,
  children,
  onSaveButtonClick,
  onOpenComplete,
  onCloseComplete,
  canSave = true,
  containerProps = {},
}: SideSheetComponentProps) {
  return (
    <SideSheet
      isShown={isShown}
      onOpenComplete={onOpenComplete}
      onCloseComplete={onCloseComplete}
      containerProps={{
        ...CONTAINER_PROPS_STYLE,
        ...containerProps,
      }}
      preventBodyScrolling
      width={500}
    >
      <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
        <Pane padding={16}>
          <Heading size={600}>{title}</Heading>
        </Pane>
      </Pane>
      <Pane
        flex="1"
        overflowY="auto"
        background="tint1"
        padding={16}
        {...getTestId('sidesheet-scroll-area')}
      >
        {children}
      </Pane>
      <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
        <Pane padding={16}>
          <Button
            appearance="primary"
            onClick={onSaveButtonClick}
            disabled={!canSave}
            {...getTestId('sidesheet-save-btn')}
          >
            Save
          </Button>
        </Pane>
      </Pane>
    </SideSheet>
  )
}
