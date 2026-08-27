import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import React from 'react'

const Protected = ({children}) => {
    const { loading,user } = useAuth()


    if(loading){
        return (<main className='auth-loading' aria-label='Loading HireEdge'><div className='auth-spinner'/></main>)
    }

    if(!user){
        return <Navigate to={'/login'} replace />
    }
    
    return children
}

export default Protected
