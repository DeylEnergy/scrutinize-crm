import {handleAsync, generateProductQRCode} from './index'

const QR_SIZE = 90
const PAPER_SIZE = {
  width: 794,
  height: 1123,
}
const COLUMN_SPACE = 3
const ROW_SPACE = COLUMN_SPACE

async function createStickers(products?: any) {
  const iframeWrapperEl = document.createElement('div')
  iframeWrapperEl.style.height = '100vh'
  iframeWrapperEl.style.display = 'none'

  const iframeWrapper = document
    .querySelector('body')
    ?.appendChild(iframeWrapperEl)

  if (!iframeWrapper) {
    return
  }

  const iframeEl = document.createElement('iframe')
  iframeEl.style.width = '100%'
  iframeEl.style.height = '100vh'
  const iframe = iframeWrapper?.appendChild(iframeEl)

  if (!iframe) {
    return
  }

  const iframeDocument = iframe.contentDocument
  const iframeWindow = iframe.contentWindow

  if (!iframeDocument || !iframeWindow) {
    return
  }

  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = `
    body {
      font-size: 10px;
    }
    @page {
      margin: 4mm;
      size: A4;
    }
  `

  const iframeHead = iframeDocument.querySelector('head')
  // @ts-ignore
  iframeHead.appendChild(style)
  const iframeBody = iframeDocument.querySelector('body')

  if (!iframeBody) {
    return
  }

  let leftOffset = 0
  let topOffset = 0

  let canvasEl, ctx
  const pages = []

  for (const item of products) {
    const [aqId] = item.acquisitionId.split('-')
    const [prId] = item.productId.split('-')

    const [createdQRCode, errorOnCreation] = await handleAsync(
      generateProductQRCode(
        item.code,
        {nameModel: item.nameModel, aqId, prId},
        QR_SIZE,
      ),
    )

    if (errorOnCreation) {
      return Promise.reject(
        `Error on qr code creation: ${item.nameModel.join(' ')}`,
      )
    }

    for (let i = 0; i < item.count; i++) {
      if (leftOffset === 0 && topOffset === 0) {
        canvasEl = document.createElement('canvas')
        canvasEl.width = PAPER_SIZE.width
        canvasEl.height = PAPER_SIZE.height
        pages.push(canvasEl)
        ctx = canvasEl.getContext('2d')
      }

      if (!ctx) {
        return Promise.reject('Error on getting context for qr code insertion.')
      }

      ctx.drawImage(createdQRCode, leftOffset, topOffset)

      const nextLeftOffset = leftOffset + COLUMN_SPACE + QR_SIZE
      if (nextLeftOffset + QR_SIZE <= PAPER_SIZE.width) {
        leftOffset = nextLeftOffset
      } else {
        leftOffset = 0
        topOffset += QR_SIZE + ROW_SPACE
      }

      const nextTopOffset = topOffset + ROW_SPACE + QR_SIZE
      if (nextTopOffset > PAPER_SIZE.height) {
        topOffset = 0
        leftOffset = 0
      }
    }
  }

  for (const page of pages) {
    iframeBody.appendChild(page)
  }

  const printStickers = () => {
    iframeWindow.print()
    iframeWindow.onafterprint = () => {
      iframeWrapper.remove()
    }
  }

  return {
    printStickers,
  }
}

export default createStickers
