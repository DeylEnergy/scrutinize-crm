import React from 'react'
import styled, {css} from 'styled-components'

type Props = {
  variant: string
  className?: string
  children: React.ReactNode
  padding?: number
}

const STYLE = {
  PRIMARY: `
    font-size: 16px;
    line-height: 24px;
    /* identical to box height, or 150% */

    letter-spacing: 0.1px;
  `,
  SECONDARY: `
    font-size: 14px;
    line-height: 18px;
    /* identical to box height, or 129% */

    letter-spacing: 0.1px;
  `,
}

// @ts-ignore
const variant = css(({variant}) => STYLE[variant])

export const Subtitle = styled.span<Props>`
  font-family: Montserrat;
  font-style: normal;
  font-weight: 500;
  color: black;
  ${props => props.padding && `padding: ${props.padding}px;`}
  ${variant}
`
