import React from 'react'
import { useRecoilValue } from 'recoil'
import SignupCard from '../components/SignupCard'
import LoginCard from '../components/LoginCard'
import authScreenAtom from '../atoms/authAtom'


function AuthPage() {
    const authScreenState= useRecoilValue(authScreenAtom)
  return (
    <>{authScreenState === "login" ? <LoginCard /> : <SignupCard />}</>
  )
}

export default AuthPage