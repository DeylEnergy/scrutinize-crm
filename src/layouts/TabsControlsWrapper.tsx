import styled from 'styled-components'
import {SPACING} from '../constants'

const HEIGHT = 38

const TabsControlsWrapper = styled.div<{height?: number}>`
  display: flex;
  align-items: center;
  margin-bottom: ${SPACING / 2}px;
  ${({height = HEIGHT}) => `height: ${height}px;`}
`

export default TabsControlsWrapper
