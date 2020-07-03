// @ts-nocheck
import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../../components/Block'
import Products from '../products/Products'
import Acquisitions from '../acquisitions/Acquisitions'

const TABS = {
  selectedIndex: 0,
  tabs: [
    {
      label: 'Products',
      component: <Products />,
    },
    {label: 'To Buy List', component: <>To buy List Content</>},
    {label: 'Acquisitions', component: <Acquisitions />},
  ],
}

export default function MainDatabase() {
  const [state, setState] = React.useReducer((s, v) => ({...s, ...v}), TABS)

  return (
    <Block ratio={1}>
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          {state.tabs.map(({label}, index) => (
            <Tab
              key={label}
              id={label}
              onSelect={() => setState({selectedIndex: index})}
              isSelected={index === state.selectedIndex}
              aria-controls={`panel-${label}`}
            >
              {label}
            </Tab>
          ))}
        </Tablist>
        {state.tabs.map(
          ({label, component}, index) =>
            index === state.selectedIndex && (
              <Pane
                key={label}
                id={`panel-${label}`}
                role="tabpanel"
                aria-labelledby={label}
                aria-hidden={index !== state.selectedIndex}
                height="100%"
              >
                {component}
              </Pane>
            ),
        )}
      </Pane>
    </Block>
  )
}
