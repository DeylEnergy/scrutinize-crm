import React from 'react'
import styled from 'styled-components'
import {Checkbox} from 'evergreen-ui'

const StyledCheckbox = styled(Checkbox)`
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 0;
`

interface Props {
  initState: boolean
  onUpdate: (e: React.ChangeEvent<HTMLInputElement>) => any
}

function CellCheckbox({initState, onUpdate}: Props) {
  const [checked, setChecked] = React.useState(initState)
  return (
    <StyledCheckbox
      label=""
      checked={checked}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked)
        onUpdate(e)
      }}
    />
  )
}

export default CellCheckbox
