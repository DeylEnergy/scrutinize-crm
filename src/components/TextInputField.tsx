import React from 'react'
import {TextInputField, TextInputFieldProps} from 'evergreen-ui'

function TextInputFieldComponent({
  value,
  required,
  ...props
}: TextInputFieldProps) {
  return (
    <TextInputField
      value={value}
      isInvalid={required && !String(value).length}
      width="100%"
      marginBottom={12}
      {...props}
    />
  )
}

export default React.memo(TextInputFieldComponent)
