import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../components/Block'
import {useLocale} from '../../utilities'
import Settings from './Settings'

export default function SettingsTabs() {
  const [locale] = useLocale()
  const {TITLE} = locale.vars.PAGES.SETTINGS

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
          <Settings />
        </Pane>
      </Pane>
    </Block>
  )
}
