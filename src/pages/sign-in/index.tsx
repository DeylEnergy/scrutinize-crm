import React from 'react'
import {Pane, Alert} from 'evergreen-ui'
import {useLocale, useGlobalScanner} from '../../utilities'

function SignIn() {
  const [locale] = useLocale()
  const {ALERT} = locale.vars.PAGES.SIGN_IN
  const [, setGlobalScanner] = useGlobalScanner()
  return (
    <Pane margin={16}>
      <Alert intent="danger" title={ALERT.TITLE}>
        {ALERT.PLEASE}{' '}
        <a
          href="#scan"
          onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            e.preventDefault()
            setGlobalScanner((prev: any) => ({...prev, isShown: true}))
          }}
        >
          {ALERT.SCAN}
        </a>{' '}
        {ALERT.YOUR_AUTH_KEY}
      </Alert>
    </Pane>
  )
}

export default SignIn
