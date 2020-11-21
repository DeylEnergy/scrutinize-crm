import React from 'react'
import styled from 'styled-components'
import {Pane, Button, Position, FilterListIcon} from 'evergreen-ui'
import Popover from './Popover'
import {SPACING} from '../constants'
import {useLocale} from '../utilities'

const FiltersIndicator = styled.div`
  height: 6px;
  width: 6px;
  background: red;
  border-radius: 50%;
  position: absolute;
  top: -1px;
  right: -1px;
  z-index: 3;
`

function FiltersPopoverButton({
  content,
  isIndicatorShown = true,
  ...props
}: any) {
  const [locale] = useLocale()
  const {FILTERS_POPOVER} = locale.vars.GENERAL.COMPONENTS

  return (
    <Popover
      content={<Pane padding={SPACING}>{content}</Pane>}
      position={Position.BOTTOM_RIGHT}
    >
      <Pane position="relative" {...props}>
        <Button
          height={20}
          appearance="primary"
          intent="none"
          iconBefore={FilterListIcon}
        >
          {FILTERS_POPOVER.BUTTON_TITLE}
        </Button>
        {isIndicatorShown && <FiltersIndicator />}
      </Pane>
    </Popover>
  )
}

export default React.memo(FiltersPopoverButton)
