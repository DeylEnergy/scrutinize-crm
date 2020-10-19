import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../components/Block'
import Stats from './Stats'

const TABS_DEFAULT = [
  {
    label: 'Statistics',
    id: 0,
  },
]

export default function StatsTabs() {
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
          <Stats />
        </Pane>
      </Pane>
    </Block>
  )
}
