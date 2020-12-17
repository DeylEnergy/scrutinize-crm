import React from 'react'
import {Button, CameraIcon, Pane, Position} from 'evergreen-ui'
import styled from 'styled-components'
import QrScanner from './QRScanner'
import Popover from './Popover'
import {useScannerListener} from '../utilities'

const StyledSpan = styled.span<{isGlobal: boolean}>`
  ${({isGlobal}) => {
    return (
      isGlobal &&
      `
      position: absolute;
      right: 32px;
      bottom: 32px;
      opacity: 0.7;
      &:hover {
        opacity: 1;
      }
      `
    )
  }}
`

function QRScannerPopover({
  cameraSize = 400,
  isGlobal = false,
  isShown,
  setIsShown,
  buttonTitle = 'Scanner',
  disabled,
}: any) {
  const [, setScannerListener] = useScannerListener()

  const handleResult = React.useCallback(
    (scanResult: string) => {
      setScannerListener({value: scanResult})
    },
    [setScannerListener],
  )

  const cameraWidth = cameraSize
  const cameraHeight = Math.floor(cameraWidth / 1.333)

  return (
    <Popover
      isShown={isShown}
      content={
        <Pane padding={8} width={cameraWidth + 16} height={cameraHeight + 16}>
          <QrScanner
            onInactive={() => setIsShown(false)}
            onResult={handleResult}
            cameraWidth={cameraWidth}
            cameraHeight={cameraHeight}
          />
        </Pane>
      }
      position={Position.TOP_RIGHT}
      onBodyClick={() => setIsShown(false)}
    >
      <StyledSpan isGlobal={isGlobal}>
        <Button
          onClick={() => setIsShown(true)}
          iconBefore={CameraIcon}
          disabled={disabled}
        >
          {buttonTitle}
        </Button>
      </StyledSpan>
    </Popover>
  )
}

export default QRScannerPopover
