import React, {Suspense} from 'react'
import {Button, AddIcon} from 'evergreen-ui'
import {useLocale, withErrorBoundary} from '../../utilities'
import ModalPopover from '../../components/ModalPopover'

const MODAL_POPOVER_SIZE = {
  width: 290,
  height: 300,
}

function AddProduct({handleSelectedProduct}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.CARTS.CONTROLS.ADD_PRODUCT

  const [currentScreen, setCurrentScreen] = React.useState({})

  const [resetScreen, setResetScreen] = React.useState<number>(0)

  const handleResetScreen = React.useCallback(() => {
    setResetScreen(Date.now())
  }, [setResetScreen])

  const handleAcquisitionSelect = React.useCallback(
    (payload: any) => {
      handleSelectedProduct(payload)
    },
    [handleSelectedProduct],
  )

  const handleProductSelect = React.useCallback(
    (productId: string) => {
      const SelectAcquisition = React.lazy(() => import('./SelectAcquisition'))
      setCurrentScreen({
        component: (
          <Suspense fallback={<div />}>
            <SelectAcquisition
              productId={productId}
              handleAcquisitionSelect={handleAcquisitionSelect}
              handleReturnBack={handleResetScreen}
            />
          </Suspense>
        ),
      })
    },
    [handleResetScreen, handleAcquisitionSelect],
  )

  React.useEffect(() => {
    const SelectProduct = React.lazy(() => import('./SelectProduct'))
    setCurrentScreen({
      component: (
        <Suspense fallback={<div />}>
          <SelectProduct handleProductSelect={handleProductSelect} />
        </Suspense>
      ),
    })
  }, [resetScreen])

  return (
    <ModalPopover
      title={PAGE_CONST.MODAL_TITLE}
      popoverProps={{
        onCloseComplete: handleResetScreen,
      }}
      {...MODAL_POPOVER_SIZE}
      {...currentScreen}
    >
      <Button
        height={20}
        appearance="primary"
        intent="success"
        iconBefore={AddIcon}
      >
        {PAGE_CONST.ADD_BUTTON.TITLE}
      </Button>
    </ModalPopover>
  )
}

export default withErrorBoundary(AddProduct)
