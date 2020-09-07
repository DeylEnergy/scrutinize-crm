import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'

const columns = [
  {title: 'OK', width: 50},
  {title: 'Product', width: 260},
  {title: 'Price'},
  {title: 'Count'},
  {title: 'Sum'},
  {title: 'Supplier', width: 150},
  {title: 'Extra'},
]

function makePage(items: any) {
  const iframeWrapperEl = document.createElement('div')
  iframeWrapperEl.style.display = 'none'
  const iframeWrapper = document
    .querySelector('body')
    ?.appendChild(iframeWrapperEl)

  if (!iframeWrapper) {
    return
  }

  const iframeEl = document.createElement('iframe')
  iframeEl.style.width = '100%'
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
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      width: 210mm;
    }
    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
    }

    table, th, td {
      border: 1px solid black;
    }
    th, td {
      padding: 5px;
    }
  `

  const iframeHead = iframeDocument?.querySelector('head')

  iframeHead?.appendChild(style)

  const headlineEl = document.createElement('h1')
  headlineEl.innerText = `To Buy List. Created ${new Date().toLocaleDateString()}`

  const tableEl = document.createElement('table')

  // add header
  const row = document.createElement('tr')
  for (const column of columns) {
    const headerEl = document.createElement('th')
    headerEl.innerText = column.title
    column.width && (headerEl.style.width = column.width + 'px')
    row.appendChild(headerEl)
  }

  tableEl.appendChild(row)

  // add rows and cells
  for (const item of items) {
    const dataRowEl = document.createElement('tr')
    for (let i = 0; i < item.length; i++) {
      const cellEl = document.createElement('td')
      const cellData = item[i]
      cellData.type === 'number' && (cellEl.style.textAlign = 'center')
      cellEl.innerText = cellData.value || cellData
      dataRowEl.appendChild(cellEl)
    }
    tableEl.appendChild(dataRowEl)
  }

  const iframeBody = iframeDocument.querySelector('body')
  iframeBody?.appendChild(headlineEl)
  iframeBody?.appendChild(tableEl)

  debugger
  iframeWindow.print()
  iframeWindow.onafterprint = () => {
    iframeWrapper.remove()
  }
}

async function print(worker: any) {
  const items = await worker.getRows({
    storeName: SN.ACQUISITIONS,
    indexName: IN.NEEDED_SINCE_DATETIME,
    direction: 'prev',
    filterBy: 'haveToBuy',
    format: 'printToBuyList',
  })

  makePage(items)
}

export default print
