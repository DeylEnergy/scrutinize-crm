import React from 'react'
import {TextInput, TextInputField, TextInputFieldProps} from 'evergreen-ui'

function filterNumbers(value: string) {
  return value.replace(/\D/g, '')
}

function noop() {}

function TextComponent(props: any) {
  return props.label ||
    props.description ||
    props.hint ||
    props.validationMessage ? (
    <TextInputField {...props} />
  ) : (
    <TextInput {...props} />
  )
}

function TextInputFieldComponent({
  value,
  required,
  onChange,
  onKeyDown = noop,
  onBlur = noop,
  type = 'string',
  leadingZeros = false,
  ...props
}: any) {
  const [input, setInput] = React.useState<{
    updateCursor: boolean
    target: null | HTMLInputElement
  }>({
    updateCursor: false,
    target: null,
  })

  const cursorPosition = React.useRef<number>(0)

  React.useEffect(() => {
    if (input.updateCursor && input.target) {
      const cursorAt = cursorPosition.current
      input.target.selectionStart = cursorAt
      input.target.selectionEnd = cursorAt
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    cursorPosition.current = e.currentTarget.selectionStart || 0
    onKeyDown(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatValue =
      type === 'number' ? filterNumbers(inputValue) : inputValue

    const target = e.target

    let updateCursor = false

    if (formatValue.length < inputValue.length) {
      updateCursor = true
    }

    setInput({updateCursor, target})
    onChange(formatValue, e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (value && type === 'number' && !leadingZeros) {
      onChange(Number(value), e)
    }
    onBlur(e)
  }

  return (
    <TextComponent
      value={value}
      isInvalid={required && !String(value).length}
      width="100%"
      marginBottom={12}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  )
}

export default React.memo(TextInputFieldComponent)
