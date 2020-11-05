import React from 'react'
import styled from 'styled-components'
import {
  Popover,
  Pane,
  Text,
  Position,
  Avatar,
  Button,
  LogOutIcon,
} from 'evergreen-ui'
import IconButton from '../../components/IconButton'
import {FaUser} from 'react-icons/fa'
import {SPACING} from '../../constants'
import {useAccount} from '../../utilities'

const TextRow = styled.div`
  width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

function UserProfilePopover() {
  const [account, setAccount] = useAccount()

  const {user, groupName} = account

  const handleLogOut = React.useCallback(() => {
    setAccount({})
  }, [setAccount])

  return (
    <Popover
      content={
        <Pane
          padding={SPACING * 1.5}
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Pane display="flex" marginBottom={SPACING * 1.5}>
            <Pane>
              <Avatar src={user?.avatar} name={user?.name} size={40} />
            </Pane>
            <Pane marginLeft={SPACING}>
              <TextRow>
                <Text>{user?.name}</Text>
              </TextRow>
              <TextRow>
                <Text fontSize={11}>{groupName}</Text>
              </TextRow>
            </Pane>
          </Pane>
          <Button
            iconBefore={LogOutIcon}
            height={SPACING * 4}
            intent="danger"
            justifyContent="center"
            onClick={handleLogOut}
          >
            Log Out
          </Button>
        </Pane>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <IconButton icon={<FaUser />} />
    </Popover>
  )
}

export default React.memo(UserProfilePopover)
