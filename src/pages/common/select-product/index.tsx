import React from 'react'
import {Button, AddIcon} from 'evergreen-ui'
import {useLocale, withErrorBoundary} from '../../../utilities'
import ModalPopover from '../../../components/ModalPopover'
import PickProduct from './PickProduct'
import PickAcquisition from './PickAcquisition'

const MODAL_POPOVER_SIZE = {
  width: 290,
  height: 300,
}

function SelectProduct({handleSelectedProduct}: any) {
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
      setCurrentScreen({
        component: (
          <PickAcquisition
            productId={productId}
            handleAcquisitionSelect={handleAcquisitionSelect}
            handleReturnBack={handleResetScreen}
          />
        ),
      })
    },
    [handleResetScreen, handleAcquisitionSelect],
  )

  React.useEffect(() => {
    setCurrentScreen({
      component: <PickProduct handleProductSelect={handleProductSelect} />,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

export default withErrorBoundary(SelectProduct)
