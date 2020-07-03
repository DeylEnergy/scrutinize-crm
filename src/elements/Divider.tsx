import styled, {css} from 'styled-components'

export const DIVIDER_VARIANT = {
  VERTICAL: 'VERTICAL',
  HORIZONTAL: 'HORIZONTAL',
}

const VERTICAL_STYLE = `
  width: 1px;
  height: 100%;
`

const HORIZONTAL_STYLE = `
  height: 1px;
`

type VariantType = {variant: string}

type Props = VariantType & {
  absolute?: boolean
}

const variant = css<VariantType>`
  ${({variant}) =>
    variant === DIVIDER_VARIANT.VERTICAL ? VERTICAL_STYLE : HORIZONTAL_STYLE}
`

const positioning = css<Props>`
  ${({variant, absolute}) =>
    variant && absolute
      ? variant === DIVIDER_VARIANT.VERTICAL
        ? `right: 0`
        : `bottom: 0; width: 100%;`
      : ''}
`

export const Divider = styled.div<Props>`
  /* Black / 10 */
  background: #e8e8e8;
  
  ${({absolute}) => absolute && `position: absolute;`}
  ${variant}
  ${positioning}
`
