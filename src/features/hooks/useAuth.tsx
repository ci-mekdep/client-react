import { useContext } from 'react'
import { AuthContext } from 'src/app/context/AuthContext'

export const useAuth = () => useContext(AuthContext)
