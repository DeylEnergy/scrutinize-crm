import React from 'react'
import {Pane, Tab, AddIcon} from 'evergreen-ui'
import {v4 as uuidv4} from 'uuid'
import Block from '../../components/Block'
import StickersSelection from './StickersSelection'
import {useLocale, useDatabase, getTabLabel} from '../../utilities'
import {STORE_NAME as SN, INDEX_NAME as IN, SPACING} from '../../constants'
import {PUT_STICKER} from '../../constants/events'
import {
  TabsControlsWrapper,
  ControlButtonsWrapper,
  FreeWidthTaker,
  HorizontallyScrollable,
} from '../../layouts'

export default function StickerSelectionsTabs({
  state,
  setState,
  isDialogOpenCompleted,
}: any) {
  const [locale] = useLocale()
  const {GENERAL} = locale.vars
  const PAGE_CONST = locale.vars.PAGES.STICKERS_MANAGER
  const {ADD_STICKERS_SELECTION} = PAGE_CONST.CONTROLS

  const db = useDatabase()

  const {tabs, selectedStickersSelectionId} = state

  const [controlPanel, setControlPanel] = React.useState<any>()

  const horizontallyScrollableRef = React.useRef<HTMLDivElement | null>(null)

  const excludeStickersSelection = React.useCallback(
    (tabs: any, selectedStickersSelectionId: string) => {
      const updatedTabs = tabs.filter(
        (x: any) => x.stickersSelectionId !== selectedStickersSelectionId,
      )

      let updatedStickersSelectionId = null
      if (updatedTabs.length) {
        const currentFocusIndex = tabs.findIndex(
          (x: any) => x.stickersSelectionId === selectedStickersSelectionId,
        )

        let nextFocusIndex = currentFocusIndex - 1

        if (currentFocusIndex === 0) {
          nextFocusIndex = 0
        }

        updatedStickersSelectionId =
          updatedTabs[nextFocusIndex].stickersSelectionId
      }

      return {
        selectedStickersSelectionId: updatedStickersSelectionId,
        tabs: updatedTabs,
      }
    },
    [],
  )

  const handleNewStickersSelection = React.useCallback(() => {
    const datetime = Date.now()
    const uId = uuidv4()
    const newStickersSelectionId = `${datetime}_${uId}`
    const updatedTabs = [
      ...tabs,
      {
        stickersSelectionId: newStickersSelectionId,
        label: getTabLabel(newStickersSelectionId, GENERAL.STRING_FORMAT),
      },
    ]
    setState({
      selectedStickersSelectionId: newStickersSelectionId,
      tabs: updatedTabs,
    })

    db.sendEvent({
      type: PUT_STICKER,
      payload: {
        stickersSelectionId: newStickersSelectionId,
      },
    }).then((result: any) => {
      if (result) {
        if (horizontallyScrollableRef.current) {
          horizontallyScrollableRef.current.scrollTo(
            horizontallyScrollableRef.current.scrollWidth,
            0,
          )
        }

        return
      }

      // highly unlikely, though in case db rejected new selection
      setTimeout(() => {
        const stateUpdate = excludeStickersSelection(
          updatedTabs,
          newStickersSelectionId,
        )
        setState(stateUpdate)
      }, 1000)
    })
  }, [tabs, GENERAL, setState, db, excludeStickersSelection])

  const completeStickersSelectionDelete = React.useCallback(() => {
    const stateUpdate = excludeStickersSelection(
      tabs,
      selectedStickersSelectionId,
    )
    setState(stateUpdate)
  }, [excludeStickersSelection, tabs, selectedStickersSelectionId, setState])

  React.useEffect(() => {
    db.getRows({
      storeName: SN.STICKERS,
      indexName: IN.STICKERS_SELECTION_ID,
      format: 'stickersSelectionIds',
      dataCollecting: false,
    }).then((rows: any) => {
      setState({
        selectedStickersSelectionId: rows[0],
        tabs: rows.map((stickersSelectionId: string) => ({
          label: getTabLabel(stickersSelectionId, GENERAL.STRING_FORMAT),
          stickersSelectionId,
        })),
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Block ratio={0}>
      <Pane height="100%" display="flex" flexDirection="column">
        <TabsControlsWrapper>
          <HorizontallyScrollable ref={horizontallyScrollableRef}>
            {tabs.map(({label, stickersSelectionId}: any) => (
              <Tab
                key={stickersSelectionId}
                id={stickersSelectionId}
                onSelect={() => {
                  setState({selectedStickersSelectionId: stickersSelectionId})
                }}
                isSelected={
                  stickersSelectionId === state.selectedStickersSelectionId
                }
                aria-controls={`panel-${label}`}
                flexShrink={0}
              >
                {label}
              </Tab>
            ))}
          </HorizontallyScrollable>
          <ControlButtonsWrapper>
            <Tab onSelect={handleNewStickersSelection} marginLeft={0}>
              <AddIcon color="green" marginRight={SPACING / 2} />{' '}
              {ADD_STICKERS_SELECTION.TITLE}
            </Tab>
          </ControlButtonsWrapper>
          <FreeWidthTaker />
          <ControlButtonsWrapper>{controlPanel}</ControlButtonsWrapper>
        </TabsControlsWrapper>
        <Pane role="tabpanel" height="calc(100vh - 54vh)">
          {isDialogOpenCompleted && state.selectedStickersSelectionId && (
            <StickersSelection
              key={state.selectedStickersSelectionId}
              stickersSelectionId={state.selectedStickersSelectionId}
              completeStickersSelectionDelete={completeStickersSelectionDelete}
              setControlPanel={setControlPanel}
            />
          )}
        </Pane>
      </Pane>
    </Block>
  )
}
