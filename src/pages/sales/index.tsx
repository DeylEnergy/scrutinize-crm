import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../components/Block'
import Sales from './Sales'
import {useLocale} from '../../utilities'

export default function SalesTabs() {
  const [locale] = useLocale()
  const {TITLE} = locale.vars.PAGES.SALES

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
          <Sales />
        </Pane>
      </Pane>
    </Block>
  )
}
