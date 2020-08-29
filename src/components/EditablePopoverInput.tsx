import React from 'react'
import {Popover, Pane} from 'evergreen-ui'
import TextInputField from './TextInputField'

function Input({value, inputType = 'string', onSave, togglePopover}: any) {
  const [inputValue, setInputValue] = React.useState(value)
  return (
    <TextInputField
      id="edit"
      type={inputType}
      value={inputValue}
      onChange={(val: any) => setInputValue(val)}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === 13) {
          const formattedValue =
            inputType === 'number' ? Number(inputValue) : inputValue

          if (value === formattedValue) {
            return togglePopover()
          }

          if (onSave(formattedValue)) {
            togglePopover()
          }
        }
      }}
      marginBottom={0}
    />
  )
}

interface Props {
  children: React.ReactElement
  value: number | string | undefined | null
  inputType: string
  onSave: (updatedValue: number | string) => any
}

function EditablePopoverInput({children, value, inputType, onSave}: Props) {
  const [isShown, setIsShown] = React.useState(false)

  const togglePopover = () => {
    setIsShown(!setIsShown)
  }

  return (
    <Popover
      isShown={isShown}
      minWidth={100}
      content={
        <Pane
          width={100}
          height={58}
          display="flex"
          alignItems="center"
          justifyContent="center"
          padding={10}
        >
          {isShown && (
            <Input
              value={value}
              inputType={inputType}
              onSave={onSave}
              togglePopover={togglePopover}
            />
          )}
        </Pane>
      }
      onBodyClick={togglePopover}
    >
      {({getRef}: any) => {
        return (
          <span ref={getRef} onClick={() => setIsShown(!isShown)}>
            {children}
          </span>
        )
      }}
    </Popover>
  )
}

export default EditablePopoverInput
