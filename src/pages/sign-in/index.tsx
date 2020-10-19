import React from 'react'
import {Pane, Alert} from 'evergreen-ui'
import {useGlobalScanner} from '../../utilities'

function SignIn() {
  const [, setGlobalScanner] = useGlobalScanner()
  return (
    <Pane margin={16}>
      <Alert intent="danger" title="You are not authorized.">
        Please{' '}
        <a
          href="#scan"
          onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            e.preventDefault()
            setGlobalScanner((prev: any) => ({...prev, isShown: true}))
          }}
        >
          scan
        </a>{' '}
        your authorization key to work with the app.
      </Alert>
    </Pane>
  )
}

export default SignIn
