import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../components/Block'
import Sales from './Sales'

const TABS_DEFAULT = [
  {
    label: 'Sales',
    id: 0,
  },
]

export default function SalesTabs() {
  return (
    <Block ratio={1}>
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          {TABS_DEFAULT.map(({label, id}: any, index: number) => (
            <Tab
              key={label}
              id={label}
              onSelect={() => {}}
              isSelected={id === index}
              aria-controls={`panel-${label}`}
            >
              {label}
            </Tab>
          ))}
        </Tablist>
        <Pane role="tabpanel" height="100%">
          <Sales />
        </Pane>
      </Pane>
    </Block>
  )
}
