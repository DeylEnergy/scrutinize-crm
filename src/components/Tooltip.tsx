import React from 'react'
import styled from 'styled-components'
import {Small} from '../elements/typography/Small'
import CellTextWrapper from './CellTextWrapper'
import {CELL_TEXT_VERTICAL_POSITION} from '../constants'

const TooltipText = styled.div`
  visibility: hidden;
  max-width: 250px;
  width: max-content;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;
  position: absolute;
  z-index: 1000;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
`

const TooltipBody = styled.div`
  ${CELL_TEXT_VERTICAL_POSITION}
  position: relative;
  display: inline-block;
  max-width: 100%;
  &:hover ${TooltipText} {
    transition-delay: 0.5s;
    visibility: visible;
    opacity: 1;
  }
`

interface Props {
  children: React.ReactElement
  content: React.ReactElement
}

function Tooltip({children, content}: Props) {
  if (!content) return <CellTextWrapper>{children}</CellTextWrapper>

  return (
    <TooltipBody>
      <CellTextWrapper hasTooltip>{children}</CellTextWrapper>
      <TooltipText>
        <Small variant="TERTIARY" color="#fff">
          {content}
        </Small>
      </TooltipText>
    </TooltipBody>
  )
}

export default Tooltip
