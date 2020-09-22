import React from 'react'
import {Pane, Tablist, Tab} from 'evergreen-ui'
import Block from '../../../components/Block'
import Products from '../products/Products'
import ToBuy from '../to-buy/ToBuy'
import Acquisitions from '../acquisitions/Acquisitions'
import {useAccount} from '../../../utilities'
import RIGHTS from '../../../constants/rights'

export default function MainDatabase() {
  const [{permissions}] = useAccount()

  const tabs = React.useMemo(() => {
    const allowedTabs = []
    if (permissions.includes(RIGHTS.CAN_SEE_PRODUCTS)) {
      allowedTabs.push({
        label: 'Products',
        component: <Products />,
      })
    }

    if (permissions.includes(RIGHTS.CAN_SEE_TO_BUY_LIST)) {
      allowedTabs.push({label: 'To Buy List', component: <ToBuy />})
    }

    if (permissions.includes(RIGHTS.CAN_SEE_ACQUISITIONS)) {
      allowedTabs.push({label: 'Acquisitions', component: <Acquisitions />})
    }

    return allowedTabs
  }, [permissions])

  const [selectedTab, setSelectedTab] = React.useState(tabs?.[0].label)

  return (
    <Block ratio={1}>
      <Pane height="100%" display="flex" flexDirection="column">
        <Tablist marginBottom={8}>
          {tabs.map(({label}: any) => (
            <Tab
              key={label}
              id={label}
              onSelect={() => setSelectedTab(label)}
              isSelected={label === selectedTab}
              aria-controls={`panel-${label}`}
            >
              {label}
            </Tab>
          ))}
        </Tablist>
        {tabs.map(
          ({label, component}: any) =>
            label === selectedTab && (
              <Pane
                key={label}
                id={`panel-${label}`}
                role="tabpanel"
                aria-labelledby={label}
                aria-hidden={label === selectedTab}
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
