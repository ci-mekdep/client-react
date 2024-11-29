import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/router'
import { PeriodType } from 'src/entities/school/PeriodType'
import { SchoolType } from 'src/entities/school/SchoolType'
import { useAuth } from 'src/features/hooks/useAuth'
import BlankLayout from 'src/shared/layouts/BlankLayout'
import FallbackSpinner from 'src/shared/components/spinner'

const allRegion: SchoolType = {
  id: '',
  code: '',
  name: 'Ählisi',
  full_name: 'Ählisi',
  description: '',
  avatar: '',
  background: '',
  phone: '',
  email: '',
  address: '',
  level: null,
  classrooms_count: Number(),
  archived_at: '',
  galleries: null,
  latitude: null,
  longitude: null,
  is_secondary_school: true,
  is_digitalized: false
}

const allPeriod: PeriodType = {
  id: '',
  title: 'Ählisi',
  value: [],
  is_enabled: false,
  is_archived: null,
  archive_link: null,
  data_counts: null,
  school: null
}

const SelectPeriod = () => {
  const router = useRouter()
  const paramsSchoolId = router.query.schoolId
  const paramsPeriodId = router.query.periodId
  const { current_role, handleUpdateProfile } = useAuth()

  useEffect(() => {
    if (router.isReady && paramsSchoolId && paramsPeriodId && current_role) {
      const school = { role_code: current_role, school: { key: paramsSchoolId as string, value: '' } }
      const period = { ...allPeriod, id: paramsPeriodId as string }

      handleUpdateProfile(school, allRegion, period, '', err => {
        console.log(err)
        router.push('/dashboard')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, paramsSchoolId, paramsPeriodId, current_role])

  return <FallbackSpinner />
}

SelectPeriod.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

SelectPeriod.acl = {
  action: 'read',
  subject: 'dashboard'
}

export default SelectPeriod
