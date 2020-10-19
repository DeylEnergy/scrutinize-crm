import React from 'react'
import {
  Pane,
  Dialog,
  Spinner,
  Button,
  TickCircleIcon,
  BanCircleIcon,
} from 'evergreen-ui'
import styled from 'styled-components'
import {useDatabase} from '../../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN} from '../../../constants'
import {PROCESS_ACQUISITIONS} from '../../../constants/events'

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
  }, [isShown])

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
        title="Process bought products"
        onCloseComplete={() => setIsShown(false)}
        preventBodyScrolling
        footer={({close}: any) => {
          return (
            <>
              {done && (
                <Button tabIndex={0} onClick={() => close()}>
                  Close
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
                    db.sendEvent({type: PROCESS_ACQUISITIONS}).then(() => {
                      setState({
                        acquisitionsProcessing: false,
                        acquisitionsSuccess: true,
                        stickersProcessing: true,
                      })
                      refetchAll()
                      // TODO: replace with stickers generation
                      setTimeout(() => {
                        setState({
                          stickersProcessing: false,
                          stickersSuccess: false,
                          done: true,
                        })
                      }, 3000)
                    })
                  }}
                >
                  Continue
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
              Products are going to be added to the database. Operation cannot
              be interrupted.
              <ul>
                <li style={{marginBottom: 8}}>
                  <b>Products:</b> {data.productsTotal}{' '}
                  <ProcessIndicator
                    isProcessing={acquisitionsProcessing}
                    success={acquisitionsSuccess}
                  />
                </li>
                <li>
                  <b>Stickers:</b> {data.stickersTotal}{' '}
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
