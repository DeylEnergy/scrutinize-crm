import React from 'react'
import {Menu, Button, Position} from 'evergreen-ui'
import Popover from '../../../components/Popover'
import GlobalContext from '../../../contexts/globalContext'
import ProcessAcquisitionsDialog from './ProcessAcquisitionsDialog'
import print from './print'

interface OptionsProps {
  refetchAll: () => void
  hasBoughtItems: boolean
}

function Options({refetchAll, hasBoughtItems}: OptionsProps) {
  const {worker} = React.useContext(GlobalContext)
  const [isShown, setIsShown] = React.useState(false)

  return (
    <>
      <Popover
        position={Position.BOTTOM_LEFT}
        content={({close}: any) => (
          <Menu>
            <Menu.Group>
              <Menu.Item
                icon="print"
                onSelect={() => {
                  print(worker)
                  close()
                }}
              >
                Print document
              </Menu.Item>
              {hasBoughtItems && (
                <Menu.Item
                  icon="tick"
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
        <Button height={20} iconBefore="cog">
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
