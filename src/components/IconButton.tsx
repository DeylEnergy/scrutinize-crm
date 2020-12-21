import React from 'react'
import {getTestId} from '../utilities'

function IconButton(
  {icon, size = 24, color = '#ffffff7d', style = {}, testId, ...props}: any,
  ref: any,
) {
  icon = React.cloneElement(icon, {
    size,
    color,
  })

  return (
    <span
      ref={ref}
      style={{cursor: 'pointer', ...style}}
      {...getTestId(testId)}
      {...props}
    >
      {icon}
    </span>
  )
}

export default React.forwardRef(IconButton)
