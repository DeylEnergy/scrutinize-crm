import React from 'react'
// @ts-ignore
import scannerWorker from 'workerize-loader!../scanner' // eslint-disable-line import/no-webpack-loader-syntax
import {
  useVideoDeviceLabel,
  getDeviceInfo,
  debounce,
  throttle,
} from '../utilities'

let scanner: any
let rId: any
let stId: any
const video: any = document.createElement('video')

function clearSt() {
  clearTimeout(stId)
  cancelAnimationFrame(rId)
  const tracks = video.srcObject ? video.srcObject.getTracks() : []
  for (const track of tracks) {
    track.stop()
  }
  video.srcObject = null

  scanner.terminate()
}

function tick() {
  stId = setTimeout(async () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const imageBitmap = await createImageBitmap(video)
      scanner.postMessage({imageBitmap}, [imageBitmap])
    }

    rId = requestAnimationFrame(tick)
  }, 1000 / 10)
}

const CONSECUTIVE_SCAN_DELAY_MS = 1000

function QRScanner({cameraSize, postponeInactive, onResult}: any) {
  const canvasRef = React.useRef<any>(null)
  const scanCanvasRef = React.useRef<any>(null)

  const [deviceLabel] = useVideoDeviceLabel()

  React.useEffect(() => {
    scanner = scannerWorker()

    const sendResult = throttle((res: any) => {
      onResult(res)
    }, CONSECUTIVE_SCAN_DELAY_MS)

    scanner.onmessage = (event: any) => {
      const decoded = event?.data?.data
      if (decoded) {
        sendResult(decoded)
        postponeInactive()
      }
    }

    if (canvasRef.current && scanCanvasRef.current) {
      getDeviceInfo(deviceLabel).then((deviceInfo: any) => {
        navigator.mediaDevices
          .getUserMedia({
            video: {
              facingMode: 'environment',
              deviceId: deviceInfo?.deviceId,
            },
          })
          .then(function(stream) {
            video.srcObject = stream
            // @ts-ignore
            video.setAttribute('playsinline', true) // required to tell iOS safari we don't want fullscreen
            video.play()
            requestAnimationFrame(tick)
          })
      })

      const offscreen = canvasRef.current.transferControlToOffscreen()
      const scanAreaCanvas = scanCanvasRef.current.transferControlToOffscreen()
      scanner.postMessage({offscreen, scanAreaCanvas}, [
        offscreen,
        scanAreaCanvas,
      ])
      postponeInactive()
    }

    return () => {
      postponeInactive.clear()
      clearSt()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceLabel])

  const {camera, scanArea} = cameraSize

  return (
    <>
      <canvas
        ref={canvasRef}
        id="canvas"
        width={camera.width}
        height={camera.height}
      ></canvas>
      <canvas
        width={scanArea.width}
        height={scanArea.height}
        ref={scanCanvasRef}
        hidden
      ></canvas>
    </>
  )
}
// 60 000ms is 1 min
const INACTIVE_TURNOFF_MS = 180000

function QRScannerWrapper({
  onInactive,
  onResult,
  cameraWidth,
  cameraHeight,
}: any) {
  const [cameraSize, setCameraSize] = React.useState<any>(null)

  React.useLayoutEffect(() => {
    if (cameraWidth && cameraHeight) {
      const camera = {
        width: cameraWidth,
        height: cameraHeight,
      }

      const smallestDimension = Math.min(camera.width, camera.height)
      const scanRegionSize = Math.round(0.7 * smallestDimension)
      const scanArea = {
        x: (camera.width - scanRegionSize) / 2,
        y: (camera.height - scanRegionSize) / 2,
        width: scanRegionSize,
        height: scanRegionSize,
      }

      setCameraSize({camera, scanArea})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInactive = React.useCallback(() => {
    onInactive()
  }, [onInactive])

  const postponeInactive = React.useMemo(() => {
    return debounce(handleInactive, INACTIVE_TURNOFF_MS)
  }, [handleInactive])

  return (
    cameraSize && (
      <QRScanner
        cameraSize={cameraSize}
        postponeInactive={postponeInactive}
        onResult={onResult}
      />
    )
  )
}

export default QRScannerWrapper
