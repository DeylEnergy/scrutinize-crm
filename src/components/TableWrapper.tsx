import React from 'react'
import styled from 'styled-components'

const Parent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
`
const Child = styled.div`
  flex-grow: 1;
`

export default function TableWrapper({children}: {children: React.ReactNode}) {
  return (
    <Parent>
      <Child>{children}</Child>
    </Parent>
  )
}
