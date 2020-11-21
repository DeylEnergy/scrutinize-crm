import QRCode from 'qrcode'

const HEADER_TOP_OFFSET = 12
const FOOTER_EXTRA_TOP_OFFSET = 5
const HEADER_NAME_MAX_LENGTH = 7
const HEADER_MODEL_MAX_LENGTH = 9

function shortenText(
  value: string,
  maxLength: number = value.length,
  shortChar = '.',
) {
  const cleanedText = value.trim()
  let shortenedText = cleanedText

  if (shortenedText.length <= maxLength) {
    return value
  }

  shortenedText = shortenedText.slice(0, maxLength - 1)

  // remove space and reset shortChar
  if (shortenedText[shortenedText.length - 1] === ' ') {
    shortenedText = shortenedText.trim()
    shortChar = ''
  }

  // reset shortChar if space after shortenedText
  if (cleanedText[shortenedText.length] === ' ') {
    shortChar = ''
  }

  return shortenedText + shortChar
}

function getTextLeftOffset(qrSize: number, width: number) {
  return (qrSize - width) / 2
}

function generateProductQRCode(
  code: string,
  {nameModel, productId}: any,
  qrSize: number,
  margin = 8,
) {
  return new Promise((resolve, reject) => {
    QRCode.toCanvas(code, {width: qrSize, margin}, function(error, canvas) {
      if (error) {
        console.error(error)
        return reject(error)
      }

      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return Promise.reject(
          `Could not access canvas context of created: ${nameModel.join(' ')}`,
        )
      }

      // add border
      ctx.strokeRect(0, 0, qrSize, qrSize)

      const [nameRaw, modelRaw] = nameModel
      const name = shortenText(nameRaw, HEADER_NAME_MAX_LENGTH)
      const model = shortenText(modelRaw, HEADER_MODEL_MAX_LENGTH)
      const headerText = `${name} ${model}`

      const headerWidth = ctx.measureText(headerText).width
      const headerLeftOffset = getTextLeftOffset(qrSize, headerWidth)
      ctx.fillText(headerText, headerLeftOffset, HEADER_TOP_OFFSET)

      const footerText = productId
      const footerWidth = ctx.measureText(footerText).width
      const footerLeftOffset = getTextLeftOffset(qrSize, footerWidth)
      ctx.fillText(
        footerText,
        footerLeftOffset,
        qrSize - FOOTER_EXTRA_TOP_OFFSET,
      )

      resolve(canvas)
    })
  })
}

export default generateProductQRCode
