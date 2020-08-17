// @ts-nocheck

import React from 'react'
import {Menu, Button, Position, Pane, Dialog, Spinner} from 'evergreen-ui'
import Popover from '../../../components/Popover'
import GlobalContext from '../../../contexts/globalContext'
import {PROCESS_ACQUISITIONS} from '../../../constants/events'
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

function makePage(items) {
  const iframeWrapperEl = document.createElement('div')
  iframeWrapperEl.style.display = 'none'
  const iframeWrapper = document
    .querySelector('body')
    ?.appendChild(iframeWrapperEl)

  const iframeEl = document.createElement('iframe')
  iframeEl.style.width = '100%'
  const iframe = iframeWrapper?.appendChild(iframeEl)
  const iframeDocument = iframe.contentDocument
  const iframeWindow = iframe.contentWindow

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

  iframeWindow.print()
  iframeWrapper.remove()
}

function DialogCustom({isShown, setIsShown, refetchAll}) {
  const {worker} = React.useContext(GlobalContext)
  const [printData, setPrintData] = React.useState(null)

  React.useEffect(() => {
    if (isShown) {
      worker
        .getRows({
          storeName: SN.ACQUISITIONS,
          indexName: IN.NEEDED_SINCE_DATETIME,
          direction: 'prev',
          filterBy: 'bought',
          format: 'process',
        })
        .then(setPrintData)
    }

    return () => setPrintData(null)
  }, [isShown])

  return (
    <Pane>
      <Dialog
        isShown={isShown}
        title="Process bought products"
        onCloseComplete={() => setIsShown(false)}
        confirmLabel="Continue"
        onConfirm={() => {
          worker.sendEvent({type: PROCESS_ACQUISITIONS}).then(() => {
            refetchAll()
          })
        }}
        preventBodyScrolling
        // isConfirmLoading
        // hasCancel={false}
      >
        <div style={{height: 100}}>
          {' '}
          {printData ? (
            <>
              Products are going to be added to the database. Operation cannot
              be interrupted.
              <ul>
                <li style={{marginBottom: 8}}>
                  <b>Products:</b> {printData.productsTotal}{' '}
                  <span style={{position: 'relative'}}>
                    <Spinner
                      position="absolute"
                      top="1px"
                      right="-20px"
                      size={16}
                    />
                  </span>
                </li>
                <li>
                  <b>Stickers:</b> {printData.stickersTotal}
                </li>
              </ul>
            </>
          ) : (
            <></>
          )}
        </div>
      </Dialog>
      <></>
    </Pane>
  )
}

function Options({refetchAll}) {
  const {worker} = React.useContext(GlobalContext)
  const [isShown, setIsShown] = React.useState(false)

  const handlePrint = async close => {
    close()

    const items = await worker.getRows({
      storeName: SN.ACQUISITIONS,
      indexName: IN.NEEDED_SINCE_DATETIME,
      direction: 'prev',
      filterBy: 'haveToBuy',
      format: 'print',
    })

    makePage(items)
  }
  return (
    <>
      <Popover
        position={Position.BOTTOM_LEFT}
        content={({close}) => (
          <Menu>
            <Menu.Group>
              <Menu.Item icon="print" onSelect={() => handlePrint(close)}>
                Print document
              </Menu.Item>
              <Menu.Item
                icon="tick"
                onSelect={() => {
                  close()
                  setIsShown(true)
                }}
              >
                Process bought items
              </Menu.Item>
            </Menu.Group>
          </Menu>
        )}
      >
        <Button height={20} iconBefore="cog">
          Options
        </Button>
      </Popover>
      <DialogCustom
        isShown={isShown}
        setIsShown={setIsShown}
        refetchAll={refetchAll}
      />
    </>
  )
}

export default React.memo(Options)
