import React from 'react'
import { useSelector } from 'react-redux'
import LoggedInHome from '../components/PrivateHome'
import PublicHome from '../components/PublicHome'


const HomePage = () => {

  let isAuthenticated = useSelector(store => store.auth.isAuthenticated)

  return (
    isAuthenticated ? <LoggedInHome /> : <PublicHome />
  )
}

export default HomePage