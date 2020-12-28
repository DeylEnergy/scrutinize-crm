import React from 'react'
import {Pane, Tooltip} from 'evergreen-ui'
import {FaQrcode} from 'react-icons/fa'
import StickersDialog from './StickersDialog'
import {useLocale} from '../../utilities'

const ICON_STYLE = {
  color: '#ffffff7d',
  size: 24,
  cursor: 'pointer',
}

function StickersManager() {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.STICKERS_MANAGER

  const [isShown, setIsShown] = React.useState(false)

  return (
    <Pane marginRight={16}>
      {isShown && <StickersDialog isShown={isShown} setIsShown={setIsShown} />}
      <Tooltip content={PAGE_CONST.TITLE}>
        <Pane>
          <FaQrcode {...ICON_STYLE} onClick={() => setIsShown(true)} />
        </Pane>
      </Tooltip>
    </Pane>
  )
}

export default React.memo(StickersManager)
