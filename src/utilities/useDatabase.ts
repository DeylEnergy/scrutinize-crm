import React from 'react'
import DatabaseContext from '../contexts/databaseContext'

export default function useDatabase() {
  const ctx = React.useContext(DatabaseContext)

  return ctx
}
