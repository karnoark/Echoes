import {
  Avatar,
  Divider,
  Flex,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import useShowToast from "../hooks/useShowToast";
import { conversationsAtom, selectedConversationAtom } from "../atoms/messagesAtom";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { useSocket } from "../../context/SocketContext";

function MessageContainer() {
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const currentUser = useRecoilValue(userAtom);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const {socket} = useSocket()
  const setConversations = useSetRecoilState(conversationsAtom)
  const messageEndRef = useRef(null)

  useEffect(() => {
    socket.on("newMessage", (message) => {

      if(selectedConversation._id === message.conversationId){
        setMessages((prev) => [...prev, message])
      }

      setMessages((prevMessages) => [...prevMessages, message])

      setConversations((prev) => {
        const updatedConversations = prev.map(conversation => {
          if(conversation._id === message.conversationId){
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              }
            }
          }
          return conversation
        })
        return updatedConversations
      })
    })

    return () => socket.off("newMessage")
  }, [socket, selectedConversation, setConversations])

  useEffect(() => {
    const lastMessageIsFromOtherUser = messages.length && messages[messages.length-1].sender !== currentUser._id
    if(lastMessageIsFromOtherUser){
      socket.emit("markMessagesAsSeen",{
        conversationId: selectedConversation._id,
        userId: selectedConversation.userId,
      })
    }

    socket.on("messagesSeen", ({conversationId}) => {
      setMessages(prev => {
        const updatedMessages = prev.map(message => {
          if(!message.seen){
            return {
              ...message,
              seen: true
            }
          }
          return message
        })
        return updatedMessages
      })
    })
  }, [socket, currentUser._id, messages, selectedConversation])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({behavior: "smooth"}); //to scroll to focus on last sent message
  }, [messages])

  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true)
      setMessages([])
      try {
        if(selectedConversation.mock) return;
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setMessages(data);
      } catch (err) {
        showToast("Error", err.message, "error");
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [showToast, selectedConversation.userid, selectedConversation.mock]);

  return (
    <Flex
      flex="70"
      p={1}
      bg={"gray.dark"}
      borderRadius={"md"}
      flexDirection={"column"}
    >
      {/* message header */}
      <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
        <Avatar src={selectedConversation.userProfilePic} size={"sm"} />
        <Text display={"flex"} alignItems={"center"}>
          {selectedConversation.username}{" "}
          <Image src={"/verified.png"} w={4} h={4} ml={1} />
        </Text>
      </Flex>

      <Divider />

      {/* message body */}

      <Flex
        flexDir={"column"}
        gap={4}
        my={4}
        p={2}
        height={"400px"}
        overflowY={"auto"}
      >
        {loadingMessages &&
          [...Array(5)].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={"center"}
              borderRadius={"md"}
              p={1}
              alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir={"column"} gap={2}>
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
                <Skeleton h={"8px"} w={"250px"} />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}

        {/* <Message ownMessage={true} />
        <Message ownMessage={false} />
        <Message ownMessage={true} />
        <Message ownMessage={true} /> */}

        {!loadingMessages && (
          messages.map((message) => (
            <Flex
							key={message._id}
							direction={"column"}
							ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null} //to scroll to focus on last sent message
						>
							<Message message={message} ownMessage={currentUser._id === message.sender} />
						</Flex>
          ))
        )}
      </Flex>
      <MessageInput setMessages={setMessages} />
    </Flex>
  );
}

export default MessageContainer;
