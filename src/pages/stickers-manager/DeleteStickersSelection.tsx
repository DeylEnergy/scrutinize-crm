import React from 'react'
import {Dialog, Button, DeleteIcon} from 'evergreen-ui'
import {useLocale, useDatabase} from '../../utilities'
import {DELETE_STICKERS_SELECTION} from '../../constants/events'

const DEFAULT_STATE = {isShown: false, canDelete: false}

function DeleteStickersSelection({
  stickersSelectionId,
  completeStickersSelectionDelete,
}: any) {
  const [locale] = useLocale()
  const DELETE_CONST =
    locale.vars.PAGES.STICKERS_MANAGER.CONTROLS.DELETE_STICKERS_SELECTION
  const DELETE_DIALOG = DELETE_CONST.DIALOG

  const db = useDatabase()

  const [state, setState] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    DEFAULT_STATE,
  )

  const {isShown, canDelete} = state

  const handleCartRemove = React.useCallback(() => {
    db.sendEvent({
      type: DELETE_STICKERS_SELECTION,
      payload: {stickersSelectionId},
    }).then((result: any) => {
      if (!result) {
        return
      }
      setState({
        isShown: false,
        canDelete: true,
      })
    })
  }, [db, stickersSelectionId, setState])

  const handleCloseComplete = React.useCallback(() => {
    if (canDelete) {
      completeStickersSelectionDelete()
    } else {
      setState(DEFAULT_STATE)
    }
  }, [completeStickersSelectionDelete, canDelete, setState])

  return (
    <>
      <Dialog
        isShown={isShown}
        title={DELETE_DIALOG.TITLE}
        onCloseComplete={handleCloseComplete}
        onConfirm={handleCartRemove}
        cancelLabel={DELETE_DIALOG.CANCEL_LABEL}
        confirmLabel={DELETE_DIALOG.CONFIRM_LABEL}
        intent="danger"
      >
        {DELETE_DIALOG.WARNING_TEXT}
      </Dialog>
      <Button
        onClick={() => setState({isShown: true})}
        height={20}
        marginRight={8}
        appearance="primary"
        intent="danger"
        iconBefore={DeleteIcon}
      >
        {DELETE_CONST.BUTTON_TITLE}
      </Button>
    </>
  )
}

export default React.memo(DeleteStickersSelection)
