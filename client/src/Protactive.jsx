import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'

const Protactive = ( {children }) => {
const [isLoggedIn, setIsLoggedIn] = useState(true)

    return isLoggedIn? children: <Navigate to={"/"}/>
}

export default Protactive
