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
  const PAGE_CONST = locale.vars.PAGES.COMMON.SELECT_PRODUCT

  const [currentScreen, setCurrentScreen] = React.useState({})

  const [resetScreen, setResetScreen] = React.useState<number>(0)

  const [isPopoverOpenCompleted, setIsPopoverOpenCompleted] = React.useState(
    false,
  )

  const handleResetScreen = React.useCallback(() => {
    setResetScreen(Date.now())
  }, [])

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

  const handleOpenComplete = React.useCallback(() => {
    console.log('complete')
    setIsPopoverOpenCompleted(true)
  }, [])

  const handleCloseComplete = React.useCallback(() => {
    setIsPopoverOpenCompleted(false)
    handleResetScreen()
  }, [handleResetScreen])

  React.useEffect(() => {
    if (isPopoverOpenCompleted) {
      setCurrentScreen({
        component: <PickProduct handleProductSelect={handleProductSelect} />,
      })
    } else {
      setCurrentScreen({component: null})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetScreen, isPopoverOpenCompleted])

  return (
    <ModalPopover
      title={PAGE_CONST.MODAL_TITLE}
      popoverProps={{
        onOpenComplete: handleOpenComplete,
        onCloseComplete: handleCloseComplete,
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
