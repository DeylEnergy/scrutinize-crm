import styled from 'styled-components'
import {SPACING} from '../constants'

const Block = styled.div`
  ${({ratio}: {ratio: number}) => `
    flex: 1;
    padding: ${ratio * SPACING}px;
  `}
`

export default Block
