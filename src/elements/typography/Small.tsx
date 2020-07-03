import React from 'react'
import styled, {css} from 'styled-components'

type Props = {
  variant: string
  className?: string
  children: React.ReactNode
}

const STYLE = {
  PRIMARY: `
    /* Small 1 - medium 12 (16, 0.2px) */
    
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    /* identical to box height, or 133% */
    
    letter-spacing: 0.2px;
  `,
  SECONDARY: `
    /* Small 2 - regular 12 (16, 0.2px) */
    
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    /* identical to box height, or 133% */
    
    letter-spacing: 0.2px;
  `,
  TERTIARY: `
    /* Small 3 - regular 11 (14, 0.px) */
      font-weight: normal;
      font-size: 11px;
      line-height: 14px;
      /* identical to box height, or 127% */
    
      letter-spacing: 0.2px;
  `,
}

// @ts-ignore
const variant = css(({variant}) => STYLE[variant])

export const Small = styled.span<Props>`
  font-family: Montserrat;
  font-style: normal;
  /* Black / 100 */

  color: #25282b;
  ${variant}
`
