import React from 'react'
import {Button, Pane, AddIcon} from 'evergreen-ui'
import AsyncSelectMenu from '../../components/AsyncSelectMenu'
import GlobalContext from '../../contexts/globalContext'

function EmptyView({}: any) {
  return (
    <Pane
      height="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      No item found.
    </Pane>
  )
}

function AddProduct({handleSelectedProduct}: any) {
  const {worker} = React.useContext(GlobalContext)

  return (
    <AsyncSelectMenu
      title="Add product"
      onSelect={handleSelectedProduct}
      searchFn={worker.search}
      storeName={'products'}
      emptyView={(searchValue: any) => <EmptyView />}
    >
      <Button
        height={20}
        appearance="primary"
        intent="success"
        iconBefore={AddIcon}
      >
        Add
      </Button>
    </AsyncSelectMenu>
  )
}

export default React.memo(AddProduct)
