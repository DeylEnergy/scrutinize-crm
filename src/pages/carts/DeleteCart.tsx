import React from 'react'
import {Dialog, Button, DeleteIcon} from 'evergreen-ui'
import {useLocale, useDatabase} from '../../utilities'
import {REMOVE_CART} from '../../constants/events'

const DEFAULT_STATE = {isShown: false, canDelete: false}

function RemoveCart({cartId, completeCartDelete}: any) {
  const [locale] = useLocale()
  const {DELETE_CART} = locale.vars.PAGES.CARTS.CONTROLS
  const {DIALOG} = DELETE_CART

  const db = useDatabase()

  const [state, setState] = React.useReducer(
    // @ts-ignore
    (s, v) => ({...s, ...v}),
    DEFAULT_STATE,
  )

  const {isShown, canDelete} = state

  const handleCartRemove = React.useCallback(() => {
    db.sendEvent({type: REMOVE_CART, payload: {cartId}}).then((result: any) => {
      if (!result) {
        return
      }
      setState({
        isShown: false,
        canDelete: true,
      })
    })
  }, [db, cartId, setState])

  const handleCloseComplete = React.useCallback(() => {
    if (canDelete) {
      completeCartDelete()
    } else {
      setState(DEFAULT_STATE)
    }
  }, [completeCartDelete, canDelete, setState])

  return (
    <>
      <Dialog
        isShown={isShown}
        title={DIALOG.TITLE}
        onCloseComplete={handleCloseComplete}
        onConfirm={handleCartRemove}
        cancelLabel={DIALOG.CANCEL_LABEL}
        confirmLabel={DIALOG.CONFIRM_LABEL}
        intent="danger"
      >
        {DIALOG.WARNING_TEXT}
      </Dialog>
      <Button
        onClick={() => setState({isShown: true})}
        height={20}
        marginRight={8}
        appearance="primary"
        intent="danger"
        iconBefore={DeleteIcon}
      >
        {DELETE_CART.BUTTON_TITLE}
      </Button>
    </>
  )
}

export default React.memo(RemoveCart)
