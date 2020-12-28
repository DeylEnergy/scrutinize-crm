import React from 'react'
import TextInputField from '../../../components/TextInputField'
import SideSheet from '../../../components/SideSheet'
import {useLocale} from '../../../utilities'

function UpdateAcquisitionInStockCount({
  sideSheet,
  onCloseComplete,
  handleAcquisitionInStockCountUpdate,
}: any) {
  const [locale] = useLocale()
  const PAGE_CONST = locale.vars.PAGES.ACQUISITIONS
  const {DRAWER} = PAGE_CONST

  const doc = sideSheet.value

  const [inStockCount, setInStockCount] = React.useState(
    doc.inStockCount < 0 ? 0 : doc.inStockCount,
  )

  const handleInStockCount = React.useCallback(
    (value: string) => {
      setInStockCount(value)
    },
    [setInStockCount],
  )

  const saveChanges = React.useCallback(() => {
    handleAcquisitionInStockCountUpdate({id: doc.id, inStockCount})
  }, [handleAcquisitionInStockCountUpdate, doc, inStockCount])

  return (
    <SideSheet
      title={DRAWER.TITLE}
      isShown={sideSheet.isShown}
      onSaveButtonClick={saveChanges}
      onCloseComplete={onCloseComplete}
      canSave={Boolean(inStockCount)}
    >
      <TextInputField
        type="number"
        value={inStockCount}
        onChange={handleInStockCount}
        label={DRAWER.INPUTS.IN_STOCK_COUNT}
        placeholder={`${DRAWER.INPUTS.IN_STOCK_COUNT}...`}
        required
      />
    </SideSheet>
  )
}

export default React.memo(UpdateAcquisitionInStockCount)
