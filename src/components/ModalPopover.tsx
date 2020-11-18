import React from 'react'
import {
  Pane,
  Popover,
  Position,
  Heading,
  IconButton,
  CrossIcon,
} from 'evergreen-ui'

function Header({title, close}: any) {
  return (
    <Pane
      display="flex"
      alignItems="center"
      borderBottom="default"
      padding={8}
      height={40}
      boxSizing="border-box"
    >
      <Pane flex="1" display="flex" alignItems="center">
        <Heading size={400}>{title}</Heading>
      </Pane>
      <IconButton
        icon={CrossIcon}
        appearance="minimal"
        height={24}
        onClick={() => close()}
      />
    </Pane>
  )
}

function ModalPopover({
  children,
  component,
  title,
  width,
  height,
  popoverProps = {},
}: any) {
  return (
    <Popover
      shouldCloseOnExternalClick={false}
      position={Position.BOTTOM_RIGHT}
      content={({close}) => (
        <Pane
          display="flex"
          flexDirection="column"
          width={width}
          height={height}
        >
          <Header title={title} close={close} />
          {component}
        </Pane>
      )}
      {...popoverProps}
    >
      {children}
    </Popover>
  )
}

export default ModalPopover
