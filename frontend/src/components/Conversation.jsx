import { Avatar, AvatarBadge, Flex, Image, Stack, Text, WrapItem, Box } from '@chakra-ui/react'
import React from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import {BsCheck2All, BsFillImageFill} from "react-icons/bs"
import userAtom from '../atoms/userAtom'
import { selectedConversationAtom } from '../atoms/messagesAtom'

function Conversation({conversation, isOnline}) {
    const user = conversation.participants[0]
    const lastMessage = conversation.lastMessage
    const currentUser = useRecoilValue(userAtom)
    const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
    console.log("selected conversation: ", selectedConversation)
  return (
    <Flex gap={4} alignItems={"center"} p={"1"} _hover={{cursor: "pointer", bg: "gray.dark", color: "white"}} borderRadius={"md"}
    onClick={() => {setSelectedConversation({
        _id: conversation._id,
        userId: user._id,
        userProfilePic: user.profilePic,
        username: user.username,
        mock: conversation.mock,
    })}}
    bg={selectedConversation?._id === conversation._id ? "gray.700" : "gray.dark" }
    >
        <WrapItem>
            <Avatar size={{
                base: "xs",
                sm: "sm",
                md: "md"
            }} src={user?.profilePic}>
            {isOnline && <AvatarBadge boxSize="1em" bg="green.500" />}
            </Avatar>
        </WrapItem>
        <WrapItem>
            <Stack direction={"column"} fontSize={"sm"}>
                <Text fontWeight='700' display={"flex"} alignItems={"center"}>
                    {user?.username} <Image src='/verified.png' w={4} h={4} gap={1} />
                </Text>
                <Text fontSize={"xs"} display={"flex"} alignItems={"center"} gap={1}>
                    {currentUser._id === lastMessage.sender ? (
                        <Box color={lastMessage.seen ? "blue.400" : ""}>
                            <BsCheck2All size={16} />
                        </Box>
                    ) : ""}
                    {lastMessage.text.length > 18 ? lastMessage.text.substring(0,18) + "..." : lastMessage.text || <BsFillImageFill size={16} />}
                </Text>
            </Stack>
        </WrapItem>
    </Flex>
  )
}   

export default Conversation    