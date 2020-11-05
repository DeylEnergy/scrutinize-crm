import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../components/Block'
import Stats from './Stats'
import {useLocale} from '../../utilities'

export default function StatsTabs() {
  const [locale] = useLocale()
  const {TITLE} = locale.vars.PAGES.STATS

  const tabs = React.useMemo(() => {
    return [
      {
        label: TITLE,
        id: 0,
      },
    ]
  }, [TITLE])

  return (
    <Block ratio={1}>
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          {tabs.map(({label, id}: any, index: number) => (
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
