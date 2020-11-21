import React from 'react'
import {Popover, Pane, Position, Tooltip} from 'evergreen-ui'
import IconButton from '../../components/IconButton'
import {FaDonate} from 'react-icons/fa'
import {SPACING} from '../../constants'
import CashboxHistory from './CashboxHistory'
import {useLocale} from '../../utilities'

function Cashbox() {
  const [locale] = useLocale()
  const {CASHBOX} = locale.vars.PAGES

  const [isShown, setIsShown] = React.useState(false)

  return (
    <Popover
      isShown={isShown}
      onCloseComplete={() => setIsShown(false)}
      onBodyClick={() => {
        // HACK: parent won't close if child popover is shown currently
        const portalEl = document.querySelector(
          'div[evergreen-portal-container]',
        )

        // @ts-ignore
        if (portalEl?.children.length > 1) {
          return
        }

        setIsShown(false)
      }}
      shouldCloseOnExternalClick={false}
      content={
        <Pane
          padding={SPACING * 1.5}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Pane width={450} height={250}>
            <CashboxHistory />
          </Pane>
        </Pane>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <span>
        <Tooltip content={CASHBOX.TITLE}>
          <IconButton
            onClick={() => {
              setIsShown(true)
            }}
            icon={<FaDonate />}
            style={{marginRight: SPACING * 2}}
          />
        </Tooltip>
      </span>
    </Popover>
  )
}

export default React.memo(Cashbox)
