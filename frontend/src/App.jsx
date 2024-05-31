import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Box, Container } from '@chakra-ui/react'
import Header from "./components/Header"
import { Routes, Route, Navigate } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import AuthPage from './pages/AuthPage'
import { useRecoilValue } from 'recoil'
import userAtom from './atoms/userAtom'


function App() {

  const user = useRecoilValue(userAtom)

  return (
    <Box position={"relative"} width='full'>
      <Container maxW={"620px"}>
        <Header />
      <Routes>
        <Route path='/' element={ user ? <ChatPage /> : <AuthPage />} />
        <Route path='/auth' element={ !user ? <AuthPage/> : <Navigate to='/' /> } />
      </Routes>
        </Container>
    </Box>
  )
}

export default App
