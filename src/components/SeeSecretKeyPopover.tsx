import React from 'react'
import {Popover, Pane, Position} from 'evergreen-ui'
import {SPACING} from '../constants'
import CODE_PREFIXES from '../constants/codePrefixes'
import QRCode from 'qrcode'

function SeeSecretKeyPopover({userId, secretKey, disabled, children}: any) {
  const [authKey, setAuthKey] = React.useState<any>('')
  React.useEffect(() => {
    if (disabled) {
      return
    }
    QRCode.toDataURL(
      `${CODE_PREFIXES.users}::${userId}__${secretKey}`,
      {width: 200},
      function(error: any, key: any) {
        if (error) console.error(error)
        setAuthKey(key)
      },
    )
  }, [disabled, userId, secretKey])

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
      {children}
    </Popover>
  )
}

export default React.memo(SeeSecretKeyPopover)
