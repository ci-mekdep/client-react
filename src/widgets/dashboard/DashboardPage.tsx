// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** Store Imports
import { useAuth } from 'src/features/hooks/useAuth'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchDashboardsData, fetchDashboardsStats } from 'src/features/store/apps/dashboards'

// ** Custom Components Import
import DashboardAdmin from './DashboardAdmin'
import DashboardDefault from './DashboardDefault'
import DashboardPrincipal from './DashboardPrincipal'
import format from 'date-fns/format'
import { fetchSettings } from 'src/features/store/apps/settings'
import Error from '../general/Error'
import { usePathname, useSearchParams } from 'next/navigation'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { useRouter } from 'next/router'
import DashboardTeacher from './DashboardTeacher'
import ContactItemsList from 'src/pages/contact/items'

interface ParamsType {
  start_date?: string | null
  end_date?: string | null
  detail_id?: string
}

const validateDateParam = (date: string | null) => {
  if (date && date !== '') {
    return date
  } else {
    return null
  }
}

const DashboardPage = () => {
  const [loadingQueries, setLoadingQueries] = useState<boolean | null>(null)
  const [dateAdmin, setDateAdmin] = useState<(string | null)[]>([
    format(new Date(), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  ])
  const [datePrincipal, setDatePrincipal] = useState<(string | null)[]>([
    format(new Date(), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  ])
  const [dateTeacher, setDateTeacher] = useState<(string | null)[]>([
    format(new Date(), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  ])
  const [dashboardData, setDashboardData] = useState<any>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { current_role } = useAuth()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { dashboardParams, setSearchParams } = useContext(ParamsContext)
  const { dashboard_stats, dashboard_data } = useSelector((state: RootState) => state.dashboards)

  useEffect(() => {
    if (!router.isReady) return

    setLoadingQueries(true)

    const start_date = validateDateParam(searchParams.get('start_date'))
    const end_date = validateDateParam(searchParams.get('end_date'))

    const paramsToSet: any = {}
    const paramsToRedirect: any = {}

    if (current_role === 'principal') {
      const dateToSetPrincipal: (string | null)[] = [format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')]
      if (start_date) {
        paramsToSet.start_date = start_date
        dateToSetPrincipal[0] = start_date
      } else if (dashboardParams.start_date) {
        paramsToRedirect.start_date = dashboardParams.start_date
        dateToSetPrincipal[0] = validateDateParam(dashboardParams.start_date as string)
      }
      if (end_date) {
        paramsToSet.end_date = end_date
        dateToSetPrincipal[1] = end_date
      } else if (dashboardParams.end_date) {
        paramsToRedirect.end_date = dashboardParams.end_date
        dateToSetPrincipal[1] = validateDateParam(dashboardParams.end_date as string)
      }
      setDatePrincipal(dateToSetPrincipal)
    } else if (current_role === 'teacher') {
      const dateToSetTeacher: (string | null)[] = [format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')]
      if (start_date) {
        paramsToSet.start_date = start_date
        dateToSetTeacher[0] = start_date
      } else if (dashboardParams.start_date) {
        paramsToRedirect.start_date = dashboardParams.start_date
        dateToSetTeacher[0] = validateDateParam(dashboardParams.start_date as string)
      }
      if (end_date) {
        paramsToSet.end_date = end_date
        dateToSetTeacher[1] = end_date
      } else if (dashboardParams.end_date) {
        paramsToRedirect.end_date = dashboardParams.end_date
        dateToSetTeacher[1] = validateDateParam(dashboardParams.end_date as string)
      }
      setDateTeacher(dateToSetTeacher)
    } else {
      const dateToSetAdmin: (string | null)[] = [format(new Date(), 'yyyy-MM-dd'), format(new Date(), 'yyyy-MM-dd')]
      if (start_date) {
        paramsToSet.start_date = start_date
        dateToSetAdmin[0] = start_date
      } else if (dashboardParams.start_date) {
        paramsToRedirect.start_date = dashboardParams.start_date
        dateToSetAdmin[0] = validateDateParam(dashboardParams.start_date as string)
      }
      if (end_date) {
        paramsToSet.end_date = end_date
        dateToSetAdmin[1] = end_date
      } else if (dashboardParams.end_date) {
        paramsToRedirect.end_date = dashboardParams.end_date
        dateToSetAdmin[1] = validateDateParam(dashboardParams.end_date as string)
      }
      setDateAdmin(dateToSetAdmin)
    }

    if (Object.keys(paramsToSet).length > 0) {
      setSearchParams('dashboardParams', paramsToSet)
    }
    if (Object.keys(paramsToRedirect).length > 0) {
      const params = new URLSearchParams(paramsToRedirect)
      router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
    }
    setLoadingQueries(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    dispatch(fetchSettings({}))
    dispatch(fetchDashboardsStats())
  }, [dispatch])

  useEffect(() => {
    if (loadingQueries === false) {
      const params: ParamsType = {}
      if (current_role === 'principal') {
        if (datePrincipal[0] !== null) params.start_date = datePrincipal[0]
        if (datePrincipal[1] !== null) params.end_date = datePrincipal[1]
      } else if (current_role === 'teacher') {
        if (dateTeacher[0] !== null) params.start_date = dateTeacher[0]
        if (dateTeacher[1] !== null) params.end_date = dateTeacher[1]
      } else if (current_role === 'admin' || current_role === 'organization') {
        if (dateAdmin[0] !== null) params.start_date = dateAdmin[0]
        if (dateAdmin[1] !== null) params.end_date = dateAdmin[1]
      }
      dispatch(fetchDashboardsData(params))
    }
  }, [dispatch, datePrincipal, dateTeacher, dateAdmin, current_role, loadingQueries])

  useEffect(() => {
    if (!dashboard_data.loading && dashboard_data.status === 'success') {
      setDashboardData(dashboard_data.data)
    }
  }, [dashboard_data])

  const handleSetDateParam = (start_date: string | null, end_date: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    let contextParams
    if (start_date) {
      params.set('start_date', format(new Date(start_date), 'yyyy-MM-dd'))
    } else {
      params.delete('start_date')
      const newData = Object.assign({}, dashboardParams)
      delete newData.start_date
      delete newData.end_date
      contextParams = { ...newData }
    }
    if (end_date) {
      params.set('end_date', format(new Date(end_date), 'yyyy-MM-dd'))
    } else {
      params.delete('end_date')
      const newData = Object.assign({}, dashboardParams)
      delete newData.start_date
      delete newData.end_date
      contextParams = { ...newData }
    }
    if (!start_date || !end_date) {
      setSearchParams('dashboardParams', contextParams)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  if (dashboard_stats.error) {
    return <Error error={dashboard_stats.error} />
  }

  if (dashboard_data.error) {
    return <Error error={dashboard_data.error} />
  }

  switch (current_role) {
    case 'admin':
      return (
        <DashboardAdmin
          date={dateAdmin}
          setDate={setDateAdmin}
          handleDateParam={handleSetDateParam}
          stats={dashboard_stats.data}
          loadingStats={dashboard_stats.loading}
          data={dashboardData}
          loadingData={dashboard_data.loading}
        />
      )
    case 'principal':
      return (
        <DashboardPrincipal
          date={datePrincipal}
          setDate={setDatePrincipal}
          handleDateParam={handleSetDateParam}
          stats={dashboard_stats.data}
          loadingStats={dashboard_stats.loading}
          data={dashboardData}
          loadingData={dashboard_data.loading}
        />
      )
    case 'organization':
      return (
        <DashboardAdmin
          date={dateAdmin}
          setDate={setDateAdmin}
          handleDateParam={handleSetDateParam}
          stats={dashboard_stats.data}
          loadingStats={dashboard_stats.loading}
          data={dashboardData}
          loadingData={dashboard_data.loading}
        />
      )
    case 'teacher':
      return (
        <DashboardTeacher
          date={dateTeacher}
          setDate={setDateTeacher}
          handleDateParam={handleSetDateParam}
          stats={dashboard_stats.data}
          loadingStats={dashboard_stats.loading}
          data={dashboardData}
          loadingData={dashboard_data.loading}
        />
      )
    case 'operator':
      return <ContactItemsList />
    default:
      return <DashboardDefault />
  }
}

export default DashboardPage
