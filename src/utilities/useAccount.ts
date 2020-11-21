import React from 'react'
import AccountContext from '../contexts/accountContext'

export default function useGroupPermissions() {
  const ctx = React.useContext(AccountContext)

  return ctx
}
