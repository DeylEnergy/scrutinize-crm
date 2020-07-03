import React from 'react'
import {SideSheet, Pane, Card, Heading, Button} from 'evergreen-ui'

interface SideSheetComponentProps {
  title: string
  isShown: boolean
  children: React.ReactNode
  onSaveButtonClick: () => void
  onCloseComplete: () => void
  canSave?: boolean
}

export default function SideSheetComponent({
  title,
  isShown,
  children,
  onSaveButtonClick,
  onCloseComplete,
  canSave = true,
}: SideSheetComponentProps) {
  return (
    <SideSheet
      isShown={isShown}
      onCloseComplete={onCloseComplete}
      containerProps={{
        display: 'flex',
        flex: '1',
        flexDirection: 'column',
      }}
      preventBodyScrolling
      width={500}
    >
      <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
        <Pane padding={16}>
          <Heading size={600}>{title}</Heading>
        </Pane>
      </Pane>
      <Pane flex="1" overflowY="auto" background="tint1" padding={16}>
        {children}
      </Pane>
      <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
        <Pane padding={16}>
          <Button
            appearance="primary"
            onClick={onSaveButtonClick}
            disabled={!canSave}
          >
            Save
          </Button>
        </Pane>
      </Pane>
    </SideSheet>
  )
}
