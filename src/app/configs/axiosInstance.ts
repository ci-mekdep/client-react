// ** Axios Imports
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// ** Utils Imports
import storageGetToken from 'src/features/utils/storage/storageGetToken'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_FETCH_API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageGetToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

export default axiosInstance
