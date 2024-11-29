// ** React Imports
import { createContext, useEffect, useState, ReactNode, useContext } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Third Party
import axios from 'axios'
import i18n from 'i18next'
import toast from 'react-hot-toast'

// ** Config
import authConfig from 'src/app/configs/auth'

// ** Types
import { UserType } from 'src/entities/school/UserType'
import { SchoolType } from 'src/entities/school/SchoolType'
import getHomeRoute from '../layouts/components/acl/getHomeRoute'
import { UserSchoolLiteType } from 'src/entities/school/UserSchoolType'
import { AuthValuesType, LoginParams, ErrCallbackType } from './types'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RESET_STORE } from 'src/features/store'
import { deleteSession } from 'src/features/store/apps/sessions'
import { fetchSettings } from 'src/features/store/apps/settings'
import storageGetSessionId from 'src/features/utils/storage/storageGetSessionId'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { userChangeSchool, userLogin } from 'src/features/store/apps/login'
import { PeriodType } from 'src/entities/school/PeriodType'
import { ParamsContext } from './ParamsContext'
import { ChangeSchoolParams } from 'src/entities/app/GeneralTypes'
import { fetchPermissions } from 'src/features/store/apps/permission'

// ** Defaults
const defaultProvider: AuthValuesType = {
  current_role: '',
  current_school: null,
  current_region: null,
  current_period: null,
  user: null,
  loading: true,
  is_secondary_school: null,
  setUser: () => null,
  setLoading: () => Boolean,
  handleLogin: () => Promise.resolve(),
  handleUpdateProfile: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  removeData: () => null
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [current_role, setCurrentRole] = useState<string | null>(defaultProvider.current_role)
  const [current_school, setCurrentSchool] = useState<SchoolType | null>(defaultProvider.current_school)
  const [current_region, setCurrentRegion] = useState<SchoolType | null>(defaultProvider.current_region)
  const [current_period, setCurrentPeriod] = useState<PeriodType | null>(defaultProvider.current_period)
  const [user, setUser] = useState<UserType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [isSecondarySchool, setIsSecondarySchool] = useState<boolean | null>(defaultProvider.is_secondary_school)

  // ** Hooks
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { clearAllSearchParams } = useContext(ParamsContext)

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      setLoading(true)
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      const expires_at = Number(window.localStorage.getItem(authConfig.storageExpiryKeyName))
      const this_time = new Date()
      const this_unix_time = Math.floor(this_time.getTime() / 1000)

      if (storedToken && this_unix_time <= expires_at) {
        const user_local_storage = window.localStorage.getItem('userData')
        if (user_local_storage) {
          setUser(JSON.parse(user_local_storage))
        }
        const role_local_storage = window.localStorage.getItem('current_role')
        if (role_local_storage) {
          setCurrentRole(role_local_storage)
        }
        const school_local_storage = window.localStorage.getItem('current_school')
        if (school_local_storage) {
          setCurrentSchool(JSON.parse(school_local_storage))
        }
        const region_local_storage = window.localStorage.getItem('current_region')
        if (region_local_storage) {
          setCurrentRegion(JSON.parse(region_local_storage))
        }
        const period_local_storage = window.localStorage.getItem('current_period')
        if (period_local_storage) {
          setCurrentPeriod(JSON.parse(period_local_storage))
        }
        const is_secondary_local_storage = window.localStorage.getItem('secondary_school')
        if (is_secondary_local_storage) {
          setIsSecondarySchool(
            is_secondary_local_storage === 'true' ? true : is_secondary_local_storage === 'false' ? false : null
          )
        }
        setLoading(false)
      } else {
        window.localStorage.removeItem('userData')
        window.localStorage.removeItem('current_role')
        window.localStorage.removeItem('current_school')
        window.localStorage.removeItem('current_region')
        window.localStorage.removeItem('current_period')
        window.localStorage.removeItem('secondary_school')
        window.localStorage.removeItem(authConfig.storageTokenKeyName)
        window.localStorage.removeItem(authConfig.storageExpiryKeyName)
        window.localStorage.removeItem(authConfig.sessionId)
        setUser(null)
        setCurrentRole(null)
        setCurrentSchool(null)
        setCurrentRegion(null)
        setCurrentPeriod(null)
        setLoading(false)
        setIsSecondarySchool(null)
        if (authConfig.onTokenExpiration === 'logout' && !router.pathname.includes('login')) {
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        }
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = (data: LoginParams, errorCallback?: ErrCallbackType) => {
    dispatch(userLogin(data))
      .unwrap()
      .then(response => {
        dispatch(fetchSettings({}))
        if (['student', 'parent'].includes(response.current_role)) {
          router.replace('/redirect/app?utm_campaign=web')

          return
        }
        axios
          .get(`${process.env.NEXT_PUBLIC_FETCH_API_BASE}/permissions`, {
            headers: { Authorization: `Bearer ${response.token}` }
          })
          .then(res => {
            setUser({
              ...response.user,
              permissions: res.data.permissions,
              permissions_write: res.data.permissions_write
            })
            setCurrentRole(response.current_role)
            window.localStorage.setItem('current_role', response.current_role)
            if (response.current_school === null || response.current_school_model === null) {
              setCurrentSchool(null)
              setIsSecondarySchool(null)
              window.localStorage.setItem('current_school', '')
              window.localStorage.setItem('secondary_school', '')
            } else {
              setCurrentSchool(response.current_school_model)
              setIsSecondarySchool(response.current_school_model.is_secondary_school)
              window.localStorage.setItem('current_school', JSON.stringify(response.current_school_model))
              window.localStorage.setItem('secondary_school', response.current_school_model.is_secondary_school)
            }
            if (response.current_region_model === null) {
              setCurrentRegion(null)
              window.localStorage.setItem('current_region', '')
            } else {
              setCurrentRegion(response.current_region_model)
              window.localStorage.setItem('current_region', JSON.stringify(response.current_region_model))
            }
            if (response.current_period_model === null) {
              setCurrentPeriod(null)
              window.localStorage.setItem('current_period', '')
            } else {
              setCurrentPeriod(response.current_period_model)
              window.localStorage.setItem('current_period', JSON.stringify(response.current_period_model))
            }
            window.localStorage.setItem(authConfig.storageTokenKeyName, response.token)
            window.localStorage.setItem(authConfig.storageExpiryKeyName, response.expires_at)
            window.localStorage.setItem(authConfig.sessionId, response.session_id)
            window.localStorage.setItem(
              'userData',
              JSON.stringify({
                ...response.user,
                permissions: res.data.permissions,
                permissions_write: res.data.permissions_write
              })
            )
            const returnUrl = router.query.returnUrl
            const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : getHomeRoute(response.current_role)

            router.replace(redirectURL as string)
          })
          .catch(err => {
            if (errorCallback) errorCallback(err)
            handleLogout()
          })
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleUpdateProfile = async (
    school: UserSchoolLiteType,
    region: SchoolType,
    period: PeriodType,
    fcmToken: string,
    errorCallback?: ErrCallbackType
  ) => {
    const dataToSend: ChangeSchoolParams = {
      role_code: school?.role_code,
      school_id: school?.school.key || '',
      region_id: region?.id || '',
      period_id: period?.id || '',
      device_token: fcmToken
    }
    dispatch(userChangeSchool(dataToSend))
      .unwrap()
      .then(response => {
        dispatch(fetchSettings({}))
        if (['student', 'parent'].includes(response.current_role)) {
          router.replace('/redirect/app?utm_campaign=web')

          return
        }

        setCurrentRole(response.current_role)
        window.localStorage.setItem('current_role', response.current_role)
        if (response.current_school === null || response.current_school_model === null) {
          setCurrentSchool(null)
          setIsSecondarySchool(null)
          window.localStorage.setItem('current_school', '')
          window.localStorage.setItem('secondary_school', '')
        } else {
          setCurrentSchool(response.current_school_model)
          setIsSecondarySchool(response.current_school_model.is_secondary_school)
          window.localStorage.setItem('current_school', JSON.stringify(response.current_school_model))
          window.localStorage.setItem('secondary_school', response.current_school_model.is_secondary_school)
        }
        if (response.current_region_model === null) {
          setCurrentRegion(null)
          window.localStorage.setItem('current_region', '')
        } else {
          setCurrentRegion(response.current_region_model)
          window.localStorage.setItem('current_region', JSON.stringify(response.current_region_model))
        }
        if (response.current_period_model === null) {
          setCurrentPeriod(null)
          window.localStorage.setItem('current_period', '')
        } else {
          setCurrentPeriod(response.current_period_model)
          window.localStorage.setItem('current_period', JSON.stringify(response.current_period_model))
        }
        window.localStorage.setItem(authConfig.storageTokenKeyName, response.new_token)
        window.localStorage.setItem(authConfig.storageExpiryKeyName, response.expires_at)
        window.localStorage.setItem(authConfig.sessionId, response.session_id)

        dispatch(fetchPermissions())
          .unwrap()
          .then(res => {
            setUser({
              ...response.user,
              permissions: res.permissions,
              permissions_write: res.permissions_write
            })
            window.localStorage.setItem(
              'userData',
              JSON.stringify({
                ...response.user,
                permissions: res.permissions,
                permissions_write: res.permissions_write
              })
            )
            const returnUrl = router.query.returnUrl
            const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : getHomeRoute(response.current_role)

            router.replace(redirectURL as string)
          })
          .catch(err => {
            if (errorCallback) errorCallback(err)
          })
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    const session_id = storageGetSessionId()
    if (session_id) {
      dispatch(deleteSession([session_id]))
        .unwrap()
        .then(() => {
          toast.success(i18n.t('ApiSuccessDefault'))
          removeData()
          clearAllSearchParams()
          router.replace({
            pathname: '/login',
            query: { returnUrl: router.asPath }
          })
        })
        .catch(err => {
          toast.error(errorHandler(err), { duration: 2000 })
        })
    }
  }

  const removeData = () => {
    setUser(null)
    setCurrentRole(null)
    setCurrentSchool(null)
    setCurrentRegion(null)
    setCurrentPeriod(null)
    setIsSecondarySchool(null)
    dispatch({ type: RESET_STORE })
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem('current_role')
    window.localStorage.removeItem('current_school')
    window.localStorage.removeItem('current_region')
    window.localStorage.removeItem('current_period')
    window.localStorage.removeItem('secondary_school')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    window.localStorage.removeItem(authConfig.storageExpiryKeyName)
    window.localStorage.removeItem(authConfig.sessionId)
    router.replace({
      pathname: '/login',
      query: { returnUrl: router.asPath }
    })
  }

  const values = {
    current_role,
    current_school,
    current_region,
    current_period,
    user,
    loading,
    is_secondary_school: isSecondarySchool,
    setUser,
    setLoading,
    handleUpdateProfile,
    handleLogin,
    logout: handleLogout,
    removeData: removeData
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}
export { AuthContext, AuthProvider }
