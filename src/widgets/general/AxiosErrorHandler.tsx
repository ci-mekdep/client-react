// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Axios Imports
import axios, { AxiosResponse } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'

// ** Utils Imports
import { useAuth } from 'src/features/hooks/useAuth'

const AxiosErrorHandler = ({ children }: { children: ReactNode }) => {
  const { removeData } = useAuth()

  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          removeData()
        }

        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [removeData])

  return <>{children}</>
}

export default AxiosErrorHandler
