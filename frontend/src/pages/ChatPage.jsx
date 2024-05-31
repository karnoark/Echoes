import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import Conversation from "../components/Conversation";
import {GiConversation} from "react-icons/gi"
import MessageContainer from "../components/MessageContainer";
import useShowToast from "../hooks/useShowToast.js"
import { useRecoilState, useRecoilValue } from "recoil";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom.js";
import userAtom from "../atoms/userAtom.js";
import { useSocket } from "../../context/SocketContext.jsx";

function ChatPage() {

  const showToast = useShowToast()
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [conversations, setConversations] = useRecoilState(conversationsAtom)
  const [selectedConversation, setSelectedConversation] = useRecoilState(selectedConversationAtom)
  const [searchText, setSearchText] = useState("")
  const [searchingUser, setSearchingUser] = useState(false)
  const currentUser = useRecoilValue(userAtom)
  const {socket, onlineUsers} = useSocket()

  useEffect(() => {
    socket?.on("messagesSeen", ({conversationId}) => {
      setConversations(prev => {
        const updatedConversations = prev.map(conversation => {
          if(conversation._id === conversationId){
            return {
              ...conversation,
              lastMessage:{
                ...conversation.lastMessage,
                seen: true
              }
            }
          }
          return conversation
        })
        return updatedConversations
      })
    })
  }, [socket, setConversations])

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations")
        const data = await res.json()
        if(data.error){
          showToast("Error", data.error, "error")
          return
        }
        console.log("getConversation data: ",data)
        setConversations(data)
      } catch (err) {
        showToast("Error", err.message, "error")
      } finally{
        setLoadingConversations(false)
      }
    }

    getConversations()
  }, [showToast, setConversations])

  const handleConversationSearch = async (e) => {
    e.preventDefault()
    setSearchingUser(true)
    try {
      const res = await fetch(`/api/users/profile/${searchText}`)
      const searchedUser = await res.json()
      if(searchedUser.error){
        showToast("Error", searchedUser.error, "error")
        return
      }
      
      // if user is trying to message themeselves
      if(searchedUser._id === currentUser._id){
        showToast("Error", "You can not message yourself", "error")
        return;
      }

      // if user is already in conversation with the searched user
      if(conversations.find(conversation => conversation.participants[0]._id === searchedUser._id)){
        setSelectedConversation({
          _id: conversations.find(conversation => conversation.participants[0]._id === searchedUser._id)._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePic: searchedUser.profilePic,
        })
        return;
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePic: searchedUser.profilePic,
          },
        ],
      }

      setConversations((prevConvs) => [...prevConvs, mockConversation])



    } catch (err) {
      showToast("Error", err.message, "error")
    } finally{
      setSearchingUser(false)
    }
  }

  return (
    <Box
			position={"absolute"}
			left={"50%"}
			w={{ base: "100%", md: "80%", lg: "750px" }}
			p={4}
			transform={"translateX(-50%)"}
		>
      <Flex
				gap={4}
				flexDirection={{ base: "column", md: "row" }}
				maxW={{
					sm: "400px",
					md: "full",
				}}
				mx={"auto"}
			>
        {/*left side part */}
        <Flex flex={30} gap={2} flexDirection={"column"} maxW={{ sm: "250px", md: "full" }} mx={"auto"}>
          <Text fontWeight={700} color={"gray.400"}>
            Your conversations
          </Text>
          <form onSubmit={handleConversationSearch}> 
            <Flex>
              <Input placeholder="Search for user" onChange={(e)=> setSearchText(e.target.value)} />
              <Button size={"sm"} onClick={handleConversationSearch} isLoading={searchingUser}>
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {loadingConversations &&
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}
              >
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}

            {!loadingConversations && (
              conversations.map(conversation => (
                <Conversation key={conversation._id} 
                isOnline={onlineUsers.includes(conversation.participants[0]._id)}
                conversation={conversation} />
              ))
            )}

        </Flex>

        {!selectedConversation._id && (<Flex
        flex={70}
        borderRadius={"md"}
        p={2}
        flexDir={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        height={"400px"}
        >
          <GiConversation size={100} />
          <Text fontSize={20} >
            Select a conversation to start messaging
          </Text>
        </Flex> )}
        {selectedConversation._id &&  < MessageContainer /> }
      </Flex>
    </Box>
  );
}

export default ChatPage;
