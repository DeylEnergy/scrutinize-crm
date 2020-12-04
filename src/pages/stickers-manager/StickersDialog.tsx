import React from 'react'
import {Dialog, toaster} from 'evergreen-ui'
import StickerSelectionsTabs from './StickerSelectionsTabs'
import {useLocale, useDatabase, handleAsync} from '../../utilities'
import createStickers from '../../utilities/createStickers'
import {SPACING, STORE_NAME as SN} from '../../constants'

const TABS = {
  selectedStickersSelectionId: null,
  tabs: [],
}

export default function StickersDialog({isShown, setIsShown}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.STICKERS_MANAGER
  const {DIALOG, CONTROLS} = PAGE_CONST

  const db = useDatabase()
  // @ts-ignore
  const [state, setState] = React.useReducer((s, v) => ({...s, ...v}), TABS)

  const [isConfirmLoading, setIsConfirmLoading] = React.useState(false)

  const {selectedStickersSelectionId} = state

  const [isDialogOpenCompleted, setIsDialogOpenCompleted] = React.useState(
    false,
  )

  const handleOpenCompleted = React.useCallback(() => {
    setIsDialogOpenCompleted(true)
  }, [setIsDialogOpenCompleted])

  const handleCloseComplete = React.useCallback(() => {
    setIsShown(false)
    setIsDialogOpenCompleted(false)
  }, [setIsShown, setIsDialogOpenCompleted])

  const handleConfirm = React.useCallback(() => {
    setIsConfirmLoading(true)
    db.getRows({
      storeName: SN.STICKERS,
      matchProperties: {_stickersSelectionId: selectedStickersSelectionId},
      format: 'printStickersList',
    }).then(async (stickers: any) => {
      if (!stickers) {
        return setIsConfirmLoading(false)
      }

      const [stickersControl, stickersControlError] = await handleAsync(
        createStickers(stickers),
      )

      if (stickersControlError) {
        toaster.danger(stickersControlError)
        return setIsConfirmLoading(false)
      }

      setIsConfirmLoading(false)
      stickersControl.printStickers()
    })
  }, [db, selectedStickersSelectionId])

  return (
    <Dialog
      shouldCloseOnOverlayClick={false}
      isConfirmLoading={isConfirmLoading}
      confirmLabel={CONTROLS.CONFIRM.BUTTON_TITLE}
      isShown={isShown}
      hasCancel={false}
      title={DIALOG.TITLE}
      onConfirm={handleConfirm}
      onOpenComplete={handleOpenCompleted}
      onCloseComplete={handleCloseComplete}
      width="100%"
      contentContainerProps={{paddingTop: SPACING * 1.5}}
    >
      <StickerSelectionsTabs
        state={state}
        setState={setState}
        isDialogOpenCompleted={isDialogOpenCompleted}
      />
    </Dialog>
  )
}
