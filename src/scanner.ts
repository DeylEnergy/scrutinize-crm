// @ts-nocheck
import jsQR from 'jsqr'

let canvas: any
let context: any
let scanAreaCanvas: any
let scanAreaContext: any
function drawLine(begin: any, end: any, color: any) {
  const offsetX = (canvas.width - scanAreaCanvas.width) / 2
  const offsetY = (canvas.height - scanAreaCanvas.height) / 2
  context.beginPath()
  context.moveTo(begin.x + offsetX, begin.y + offsetY)
  context.lineTo(end.x + offsetX, end.y + offsetY)
  context.lineWidth = 4
  context.strokeStyle = color
  context.stroke()
}
// eslint-disable-next-line
self.onmessage = async function(evt: MessageEvent) {
  const data = evt.data

  if (data.offscreen) {
    canvas = data.offscreen
    context = canvas.getContext('2d')

    scanAreaCanvas = data.scanAreaCanvas
    scanAreaContext = scanAreaCanvas.getContext('2d')
  } else if (data.imageBitmap && context) {
    context.drawImage(data.imageBitmap, 0, 0)
    const canvasX = (canvas.width - scanAreaCanvas.width) / 2
    const canvasY = (canvas.height - scanAreaCanvas.height) / 2
    scanAreaContext.drawImage(
      data.imageBitmap,
      canvasX, // x
      canvasY, // y
      scanAreaCanvas.width,
      scanAreaCanvas.height,
      0,
      0,
      scanAreaCanvas.width,
      scanAreaCanvas.height,
    )

    const imageData = scanAreaContext.getImageData(
      0,
      0,
      scanAreaCanvas.width,
      scanAreaCanvas.height,
    )

    const code = jsQR(
      imageData.data,
      scanAreaCanvas.width,
      scanAreaCanvas.height,
    )

    if (code) {
      // eslint-disable-next-line
      self.postMessage(code)
      drawLine(
        code.location.topLeftCorner,
        code.location.topRightCorner,
        'green',
      )
      drawLine(
        code.location.topRightCorner,
        code.location.bottomRightCorner,
        'green',
      )
      drawLine(
        code.location.bottomRightCorner,
        code.location.bottomLeftCorner,
        'green',
      )
      drawLine(
        code.location.bottomLeftCorner,
        code.location.topLeftCorner,
        'green',
      )
    }
  }
}

// Temporary HACK to fix problem with hanging message of TypeScript's "checking results"...
export default function none() {}
