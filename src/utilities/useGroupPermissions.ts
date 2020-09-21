import React from 'react'
import GroupPermissionsContext from '../contexts/groupPermissionsContext'

export default function useGroupPermissions() {
  const ctx = React.useContext(GroupPermissionsContext)

  return ctx
}
