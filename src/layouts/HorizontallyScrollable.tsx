import styled from 'styled-components'

const RIGHT_GUTTER = 1
const TOP_BOTTOM_GUTTER = 2
const SCROLL_HEIGHT = 6

const HorizontallyScrollable = styled.div`
  padding: ${TOP_BOTTOM_GUTTER}px 0;
  display: flex;
  overflow-x: scroll;

  &:after {
    content: '';
    border: ${RIGHT_GUTTER}px solid transparent;
  }

  &::-webkit-scrollbar {
    height: ${SCROLL_HEIGHT}px;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 15px;
    height: ${SCROLL_HEIGHT}px;
  }

  &:hover::-webkit-scrollbar-thumb {
    background: #cccccc;
  }
`

export default HorizontallyScrollable
