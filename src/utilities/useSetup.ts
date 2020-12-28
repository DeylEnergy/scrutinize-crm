import React from 'react'
import SetupContext from '../contexts/setupContext'

export default function useSetup() {
  const ctx = React.useContext(SetupContext)

  return ctx
}
