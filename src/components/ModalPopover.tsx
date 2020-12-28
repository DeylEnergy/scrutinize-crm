import React from 'react'
import {
  Pane,
  Popover,
  Position,
  Heading,
  IconButton,
  CrossIcon,
} from 'evergreen-ui'
import {getTestId} from '../utilities'

function Header({title, close, closeBtnTestId}: any) {
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
        {...getTestId(closeBtnTestId)}
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
  closeBtnTestId,
  popoverProps = {},
  testId,
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
          {...getTestId(testId)}
        >
          <Header title={title} close={close} closeBtnTestId={closeBtnTestId} />
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
