import React from 'react'
import styled from 'styled-components'
import {Small} from '../elements/typography/Small'

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
  position: relative;
  display: inline-block;
  max-width: 100%;
  &:hover ${TooltipText} {
    transition-delay: 0.5s;
    visibility: visible;
    opacity: 1;
  }
`

const TextWrapper = styled.span`
  max-width: 100%;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

interface Props {
  children: React.ReactElement
  content: React.ReactElement
}

function Tooltip({children, content}: Props) {
  if (!content) return <TextWrapper>{children}</TextWrapper>

  return (
    <TooltipBody>
      <TextWrapper>{children}</TextWrapper>
      <TooltipText>
        <Small variant="TERTIARY" color="#fff">
          {content}
        </Small>
      </TooltipText>
    </TooltipBody>
  )
}

export default Tooltip
