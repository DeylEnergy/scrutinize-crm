import React from 'react'
import styled from 'styled-components'
import {Button, SelectField, Position} from 'evergreen-ui'
import Popover from '../../../components/Popover'
import {TO_BUY_FILTER_OPTIONS as FILTER_OPTIONS} from '../../../constants'

const PopoverContentWrapper = styled.div`
  padding: 5px;
`

function Filters({value, handleFilterChange}: any) {
  return (
    <Popover
      content={
        <PopoverContentWrapper>
          <SelectField
            label="List type"
            marginBottom={0}
            value={value}
            onChange={handleFilterChange}
          >
            <option value={FILTER_OPTIONS.ACTIVE}>Active</option>
            <option value={FILTER_OPTIONS.HAVE_TO_BUY}>Have to buy</option>
            <option value={FILTER_OPTIONS.BOUGHT}>Bought</option>
            <option value={FILTER_OPTIONS.FROZEN}>Frozen</option>
          </SelectField>
        </PopoverContentWrapper>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        height={20}
        marginRight={8}
        appearance="primary"
        intent="none"
        iconBefore="filter-list"
      >
        Filters
      </Button>
    </Popover>
  )
}

export default React.memo(Filters)
