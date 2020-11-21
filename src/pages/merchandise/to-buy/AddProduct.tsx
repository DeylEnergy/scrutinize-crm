import React from 'react'
import {Button, Pane, AddIcon} from 'evergreen-ui'
import AsyncSelectMenu from '../../../components/AsyncSelectMenu'
import {useLocale, useDatabase} from '../../../utilities'

function EmptyView({onEmptyButtonClick, searchValue}: any) {
  const [locale] = useLocale()
  const {ADD_PRODUCT} = locale.vars.PAGES.TO_BUY_LIST.CONTROLS

  return (
    <Pane
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Button
        height={32}
        appearance="default"
        iconBefore={AddIcon}
        onClick={onEmptyButtonClick.bind(null, searchValue)}
      >
        {ADD_PRODUCT.NO_RESULTS_BUTTON_TITLE}
      </Button>
    </Pane>
  )
}

function AddProduct({handleSelectedProduct, handleNewProductDrawer}: any) {
  const [locale] = useLocale()
  const {ADD_PRODUCT} = locale.vars.PAGES.TO_BUY_LIST.CONTROLS

  const db = useDatabase()

  return (
    <AsyncSelectMenu
      title={ADD_PRODUCT.POPOVER_TITLE}
      onSelect={handleSelectedProduct}
      searchFn={db.search}
      storeName={'products'}
      filterFor="toBuyList"
      emptyView={(searchValue: any) => (
        <EmptyView
          onEmptyButtonClick={handleNewProductDrawer}
          searchValue={searchValue}
        />
      )}
    >
      <Button
        height={20}
        marginRight={8}
        appearance="primary"
        intent="success"
        iconBefore={AddIcon}
      >
        {ADD_PRODUCT.BUTTON_TITLE}
      </Button>
    </AsyncSelectMenu>
  )
}

export default React.memo(AddProduct)
