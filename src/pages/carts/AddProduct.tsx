import React from 'react'
import {Button, Pane, AddIcon} from 'evergreen-ui'
import AsyncSelectMenu from '../../components/AsyncSelectMenu'
import {useLocale, useDatabase} from '../../utilities'

function EmptyView({}: any) {
  const [locale] = useLocale()
  const {ADD_PRODUCT} = locale.vars.PAGES.CARTS.CONTROLS

  return (
    <Pane
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {ADD_PRODUCT.NO_RESULTS}
    </Pane>
  )
}

function AddProduct({handleSelectedProduct}: any) {
  const [locale] = useLocale()
  const {ADD_PRODUCT} = locale.vars.PAGES.CARTS.CONTROLS

  const db = useDatabase()

  return (
    <AsyncSelectMenu
      title={ADD_PRODUCT.POPOVER_TITLE}
      onSelect={handleSelectedProduct}
      searchFn={db.search}
      storeName={'products'}
      emptyView={(searchValue: any) => <EmptyView />}
    >
      <Button
        height={20}
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
