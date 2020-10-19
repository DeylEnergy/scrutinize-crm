import React from 'react'
import {
  Menu,
  Button,
  Position,
  CogIcon,
  PrintIcon,
  TickIcon,
} from 'evergreen-ui'
import Popover from '../../../components/Popover'
import ProcessAcquisitionsDialog from './ProcessAcquisitionsDialog'
import print from './print'
import RIGHTS from '../../../constants/rights'
import {useAccount, useDatabase} from '../../../utilities'

interface OptionsProps {
  refetchAll: () => void
  hasBoughtItems: boolean
}

function Options({refetchAll, hasBoughtItems}: OptionsProps) {
  const [{permissions}] = useAccount()
  const db = useDatabase()
  const [isShown, setIsShown] = React.useState(false)

  return (
    <>
      <Popover
        position={Position.BOTTOM_LEFT}
        content={({close}: any) => (
          <Menu>
            <Menu.Group>
              {permissions.includes(RIGHTS.CAN_PRINT_TO_BUY_LIST) && (
                <Menu.Item
                  icon={PrintIcon}
                  onSelect={() => {
                    print(db)
                    close()
                  }}
                >
                  Print document
                </Menu.Item>
              )}
              {hasBoughtItems &&
                permissions.includes(RIGHTS.CAN_COMPLETE_TO_BUY_LIST) && (
                  <Menu.Item
                    icon={TickIcon}
                    onSelect={() => {
                      close()
                      setIsShown(true)
                    }}
                  >
                    Process bought items
                  </Menu.Item>
                )}
            </Menu.Group>
          </Menu>
        )}
      >
        <Button height={20} iconBefore={CogIcon}>
          Options
        </Button>
      </Popover>
      {isShown && (
        <ProcessAcquisitionsDialog
          isShown={isShown}
          setIsShown={setIsShown}
          refetchAll={refetchAll}
        />
      )}
    </>
  )
}

export default React.memo(Options)
