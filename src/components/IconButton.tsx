import React from 'react'

function IconButton(
  {icon, size = 24, color = '#ffffff7d', style = {}, ...props}: any,
  ref: any,
) {
  icon = React.cloneElement(icon, {
    size,
    color,
  })

  return (
    <span ref={ref} style={{cursor: 'pointer', ...style}} {...props}>
      {icon}
    </span>
  )
}

export default React.forwardRef(IconButton)
