import React from 'react'
import {
  Pane,
  Dialog,
  Spinner,
  Button,
  TickCircleIcon,
  BanCircleIcon,
  toaster,
} from 'evergreen-ui'
import styled from 'styled-components'
import {useLocale, useDatabase, handleAsync} from '../../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {PROCESS_ACQUISITIONS} from '../../../constants/events'
import createStickers from './createStickers'

const ProcessIndicatorWrapper = styled.span`
  position: relative;
`

const SPINNER_STYLE = {
  size: 16,
  position: 'absolute' as 'absolute',
  top: 1,
  left: '5px',
}

const ICON_STYLE = {
  size: 14,
  position: 'absolute' as 'absolute',
  top: '2px',
  left: '5px',
}

interface ProcessIndicatorProps {
  isProcessing: boolean
  success: null | boolean
}

const ProcessIndicator = ({isProcessing, success}: ProcessIndicatorProps) => {
  let indicator
  if (isProcessing) {
    indicator = <Spinner {...SPINNER_STYLE} />
  }

  if (success) {
    indicator = <TickCircleIcon color="success" {...ICON_STYLE} />
  }

  if (success === false) {
    indicator = <BanCircleIcon color="danger" {...ICON_STYLE} />
  }

  if (indicator) {
    return <ProcessIndicatorWrapper>{indicator}</ProcessIndicatorWrapper>
  }

  return null
}

export default function DialogCustom({isShown, setIsShown, refetchAll}: any) {
  const [locale] = useLocale()
  const {PROCESS_BOUGHT_ITEMS} = locale.vars.PAGES.TO_BUY_LIST.CONTROLS.OPTIONS
  const db = useDatabase()
  const [state, setState] = React.useReducer(
    // @ts-ignore
    (s, v) => {
      return {...s, ...v}
    },
    {
      data: null,
      acquisitionsProcessing: false,
      acquisitionsSuccess: null,
      stickersProcessing: false,
      stickersSuccess: null,
      done: false,
    },
  )

  const [printStickers, setPrintStickers] = React.useState<any>(null)

  React.useEffect(() => {
    if (isShown) {
      db.getRows({
        storeName: SN.ACQUISITIONS,
        indexName: IN.NEEDED_SINCE_DATETIME,
        direction: 'prev',
        filterBy: 'bought',
        format: 'processToBuyList',
      }).then((res: any) => setState({data: res}))
    }

    return () => setState({data: null})
  }, [db, isShown])

  const {
    acquisitionsProcessing,
    stickersProcessing,
    data,
    acquisitionsSuccess,
    stickersSuccess,
    done,
  } = state

  const isProcessing = acquisitionsProcessing || stickersProcessing

  return (
    <Pane>
      <Dialog
        isShown={isShown}
        title={PROCESS_BOUGHT_ITEMS.TITLE}
        onCloseComplete={() => setIsShown(false)}
        preventBodyScrolling
        footer={({close}: any) => {
          return (
            <>
              {done && !printStickers && (
                <Button tabIndex={0} onClick={() => close()}>
                  {PROCESS_BOUGHT_ITEMS.MODAL_BUTTON_CLOSE}
                </Button>
              )}
              {printStickers && (
                <Button
                  tabIndex={0}
                  marginLeft={8}
                  appearance="primary"
                  onClick={printStickers.handler}
                >
                  {PROCESS_BOUGHT_ITEMS.MODAL_BUTTON_PRINT}
                </Button>
              )}
              {!done && (
                <Button
                  tabIndex={0}
                  marginLeft={8}
                  appearance="primary"
                  isLoading={isProcessing}
                  onClick={() => {
                    setState({acquisitionsProcessing: true})
                    db.sendEvent({type: PROCESS_ACQUISITIONS}).then(
                      async (result: any) => {
                        setState({
                          acquisitionsProcessing: false,
                          acquisitionsSuccess: true,
                          stickersProcessing: true,
                        })
                        refetchAll()

                        if (result.stickersToPrint.length) {
                          const [
                            stickersControl,
                            stickersControlError,
                          ] = await handleAsync(
                            createStickers(result.stickersToPrint),
                          )

                          if (stickersControlError) {
                            return toaster.danger('Stickers creation failed.')
                          }

                          setPrintStickers({
                            handler: () => {
                              setIsShown(false)
                              stickersControl.printStickers()
                            },
                          })
                        }

                        setState({
                          stickersProcessing: true,
                          stickersSuccess: true,
                          done: true,
                        })
                      },
                    )
                  }}
                >
                  {PROCESS_BOUGHT_ITEMS.MODAL_BUTTON_CONTINUE}
                </Button>
              )}
            </>
          )
        }}
      >
        <Pane height={100}>
          {' '}
          {data ? (
            <>
              {PROCESS_BOUGHT_ITEMS.MODAL_WARNING}
              <ul>
                <li style={{marginBottom: 8}}>
                  <b>{PROCESS_BOUGHT_ITEMS.MODAL_PRODUCTS}:</b>{' '}
                  {data.productsTotal}{' '}
                  <ProcessIndicator
                    isProcessing={acquisitionsProcessing}
                    success={acquisitionsSuccess}
                  />
                </li>
                <li>
                  <b>{PROCESS_BOUGHT_ITEMS.MODAL_STICKERS}:</b>{' '}
                  {data.stickersTotal}{' '}
                  <ProcessIndicator
                    isProcessing={stickersProcessing}
                    success={stickersSuccess}
                  />
                </li>
              </ul>
            </>
          ) : (
            <></>
          )}
        </Pane>
      </Dialog>
      <></>
    </Pane>
  )
}
