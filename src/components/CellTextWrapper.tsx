import styled from 'styled-components'
import {CELL_TEXT_VERTICAL_POSITION} from '../constants'

const CellTextWrapper = styled.span<{
  hasTooltip?: boolean
  isTextCell?: boolean
}>`
  ${({isTextCell = true}) =>
    isTextCell &&
    `
      width: 100%;
      max-width: 100%;
      display: inline-block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `}
  ${({hasTooltip}) => !hasTooltip && CELL_TEXT_VERTICAL_POSITION}
`

export default CellTextWrapper
