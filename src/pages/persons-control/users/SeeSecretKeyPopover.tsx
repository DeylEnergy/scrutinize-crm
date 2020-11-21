import React from 'react'
import {Popover, Pane, Position, Button, EyeOpenIcon} from 'evergreen-ui'
import {SPACING} from '../../../constants'
import CODE_PREFIXES from '../../../constants/codePrefixes'
import QRCode from 'qrcode'
import {useLocale} from '../../../utilities'

function SeeSecretKeyPopover({userName, secretKey, disabled}: any) {
  const [locale] = useLocale()
  const {DRAWER} = locale.vars.PAGES.USERS

  const [authKey, setAuthKey] = React.useState<any>('')
  React.useEffect(() => {
    if (disabled) {
      return
    }
    QRCode.toDataURL(
      `${CODE_PREFIXES.users}::${userName}__${secretKey}`,
      {width: 200},
      function(error: any, key: any) {
        if (error) console.error(error)
        setAuthKey(key)
      },
    )
  }, [disabled, userName, secretKey])

  return (
    <Popover
      content={
        <Pane
          padding={SPACING * 1.5}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          height={200}
          width={200}
        >
          <img src={authKey} height="100%" width="100%" alt="Auth key" />
        </Pane>
      }
      position={Position.TOP}
    >
      <Button
        intent="success"
        iconBefore={EyeOpenIcon}
        justifyContent="center"
        width="49%"
        disabled={disabled}
      >
        {DRAWER.BUTTONS.SEE_AUTHORIZATION_KEY}
      </Button>
    </Popover>
  )
}

export default React.memo(SeeSecretKeyPopover)
