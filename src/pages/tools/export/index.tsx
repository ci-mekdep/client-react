import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Next Import
import { Box, Button, ButtonGroup, Card, CardContent, CardHeader, CircularProgress, Divider } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'

// ** Third Party Imports
import { useTranslation } from 'react-i18next'
import JournalExport from 'src/widgets/tools/export/JournalExport'
import QuarterExport from 'src/widgets/tools/export/QuarterExport'
import { SubjectListType } from 'src/entities/classroom/SubjectType'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { fetchSubjects } from 'src/features/store/apps/subjects'
import { fetchSettings } from 'src/features/store/apps/settings'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { ParamsContext } from 'src/app/context/ParamsContext'
import { useRouter } from 'next/router'
import { usePathname, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'

const validateExportTypeParam = (exportType: string | null) => {
  if (exportType && exportType !== '') {
    if (exportType === 'journal_export' || exportType === 'quarter_export') {
      return exportType
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const validateTypeParam = (type: string | null) => {
  if (type && type !== '') {
    if (type === 'subject' || type === 'all_subject') {
      return type
    } else {
      return ''
    }
  } else {
    return ''
  }
}

const validateIdParam = (id: string | null) => {
  if (id && id !== '') {
    return id
  } else {
    return null
  }
}

const Export = () => {
  // ** State
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [classroom, setClassroom] = useState<LiteModelType | null>(null)
  const [subject, setSubject] = useState<SubjectListType | null>(null)
  const [period, setPeriod] = useState<string | null>(null)
  const [type, setType] = useState<'subject' | 'all_subject' | ''>('subject')
  const [currentExportType, setCurrentExportType] = useState<string>('')
  const [loadingQueries, setLoadingQueries] = useState<boolean>(true)

  // ** Hook
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { toolsExportParams, setSearchParams } = useContext(ParamsContext)
  const { settings } = useSelector((state: RootState) => state.settings)
  const { classrooms_lite_list } = useSelector((state: RootState) => state.classrooms)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    setLoadingQueries(true)
    if (router.isReady) {
      const exportType = validateExportTypeParam(searchParams.get('export_type'))
      const type = validateTypeParam(searchParams.get('type'))
      const classroom_id = validateIdParam(searchParams.get('classroom_id'))
      const school_id = validateIdParam(searchParams.get('school_id'))
      const subject_id = validateIdParam(searchParams.get('subject_id'))
      const period_number = validateIdParam(searchParams.get('period_number'))
      const paramsToSet: any = {}
      const paramsToRedirect: any = {}

      if (exportType) {
        paramsToSet.export_type = exportType
        setCurrentExportType(exportType)
      } else if (toolsExportParams.export_type) {
        paramsToRedirect.export_type = toolsExportParams.export_type
        setCurrentExportType(validateExportTypeParam(toolsExportParams.export_type as string))
      }

      if (type) {
        paramsToSet.type = type
        setType(type)
      } else if (toolsExportParams.type) {
        paramsToRedirect.type = toolsExportParams.type
        setType(validateTypeParam(toolsExportParams.type as string))
      }

      if (period_number) {
        paramsToSet.period_number = period_number
        setPeriod(period_number)
      } else if (toolsExportParams.period_number) {
        paramsToRedirect.period_number = toolsExportParams.period_number
        setPeriod(validateIdParam(toolsExportParams.period_number as string))
      }

      if (!schools_lite_list.loading && schools_lite_list.status === 'success') {
        if (school_id) {
          paramsToSet.school_id = school_id
          setSchool(schools_lite_list.data.find((school: LiteModelType) => school.key === school_id) || null)
        } else if (toolsExportParams.school_id) {
          paramsToRedirect.school_id = toolsExportParams.school_id
          setSchool(
            schools_lite_list.data.find(
              (school: LiteModelType) => school.key === (toolsExportParams.school_id as string)
            ) || null
          )
        }
      }

      if (!classrooms_lite_list.loading && classrooms_lite_list.status === 'success') {
        if (classroom_id) {
          paramsToSet.classroom_id = classroom_id
          setClassroom(
            classrooms_lite_list.data.find((classroom: LiteModelType) => classroom.key === classroom_id) || null
          )
          if (subject_id) {
            dispatch(
              fetchSubjects({
                limit: 200,
                offset: 0,
                classroom_ids: [classroom_id]
              })
            )
              .unwrap()
              .then(response => {
                setSubject(response.subjects?.find((subject: SubjectListType) => subject.id === subject_id) || null)
              })
              .catch(err => {
                toast.error(errorHandler(err), { duration: 2000 })
              })
          }
        } else if (toolsExportParams.classroom_id) {
          paramsToRedirect.classroom_id = toolsExportParams.classroom_id
          setClassroom(
            classrooms_lite_list.data.find(
              (classroom: LiteModelType) => classroom.key === (toolsExportParams.classroom_id as string)
            ) || null
          )

          if (subject_id) {
            dispatch(
              fetchSubjects({
                limit: 200,
                offset: 0,
                classroom_ids: [toolsExportParams.classroom_id as string]
              })
            )
              .unwrap()
              .then(response => {
                setSubject(response.subjects?.find((subject: SubjectListType) => subject.id === subject_id) || null)
              })
              .catch(err => {
                toast.error(errorHandler(err), { duration: 2000 })
              })
          }
        }
      }

      if (Object.keys(paramsToSet).length > 0) {
        setSearchParams('toolsExportParams', paramsToSet)
      }
      if (Object.keys(paramsToRedirect).length > 0) {
        const params = new URLSearchParams(paramsToRedirect)
        for (const [key, value] of Object.entries(paramsToRedirect)) {
          if (Array.isArray(value)) {
            params.delete(key)
            value.forEach(v => params.append(key, v))
          }
        }
        router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
      }
      setLoadingQueries(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classrooms_lite_list, schools_lite_list, router])

  useEffect(() => {
    dispatch(fetchSettings({}))
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (school && school.key) {
      dispatch(
        fetchClassroomsLite({
          limit: 200,
          offset: 0,
          school_id: school.key
        })
      )
    }
  }, [dispatch, school])

  useEffect(() => {
    if (classroom && classroom.key) {
      dispatch(
        fetchSubjects({
          limit: 200,
          offset: 0,
          classroom_ids: [classroom.key]
        })
      )
    }
  }, [dispatch, classroom])

  const handleExportChange = (val: string) => {
    setCurrentExportType(val)

    const params = new URLSearchParams(searchParams.toString())

    const contextParams = toolsExportParams
    setSearchParams('toolsExportParams', contextParams)

    if (val) {
      params.set('export_type', val)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleTypeChange = (val: 'subject' | 'all_subject' | '') => {
    setType(val)
    setSubject(null)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('subject_id')
    params.delete('type')

    const contextParams = toolsExportParams
    delete contextParams.subject_id
    delete contextParams.type
    setSearchParams('toolsExportParams', contextParams)

    if (val) {
      params.set('type', val)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleSchoolChange = (val: LiteModelType | null) => {
    setSchool(val)
    setClassroom(null)
    setSubject(null)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('school_id')
    params.delete('classroom_id')
    params.delete('subject_id')

    const contextParams = toolsExportParams
    delete contextParams.school_id
    delete contextParams.classroom_id
    delete contextParams.subject_id
    setSearchParams('toolsExportParams', contextParams)

    if (val) {
      params.set('school_id', val.key.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleClassroomChange = (val: LiteModelType | null) => {
    setClassroom(val)
    setSubject(null)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('classroom_id')
    params.delete('subject_id')

    const contextParams = toolsExportParams
    delete contextParams.classroom_id
    delete contextParams.subject_id
    setSearchParams('toolsExportParams', contextParams)

    if (val) {
      params.set('classroom_id', val.key.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handleSubjectChange = (val: SubjectListType | null) => {
    setSubject(val)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('subject_id')

    const contextParams = toolsExportParams
    delete contextParams.subject_id
    setSearchParams('toolsExportParams', contextParams)

    if (val) {
      params.set('subject_id', val.id.toString())
    }

    if (
      !settings.loading &&
      settings.status === 'success' &&
      settings.data.general.default_period.current_number &&
      period === null
    ) {
      handlePeriodChange(settings.data.general.default_period.current_number.toString())
      params.set('period_number', settings.data.general.default_period.current_number.toString())
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  const handlePeriodChange = (val: string | null) => {
    setPeriod(val)

    const params = new URLSearchParams(searchParams.toString())
    params.delete('period_number')

    const contextParams = delete toolsExportParams.period_number
    setSearchParams('toolsExportParams', contextParams)

    if (val) {
      params.set('period_number', val)
    }
    router.replace(pathname + '?' + params.toString(), undefined, { shallow: true })
  }

  if (loadingQueries) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={t('JournalExportTitle')} />
          <Divider />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <ButtonGroup fullWidth>
                  <Button
                    variant={currentExportType === 'journal_export' ? 'contained' : 'outlined'}
                    onClick={() => handleExportChange('journal_export')}
                  >
                    <Translations text='JournalExport' />
                  </Button>
                  <Button
                    variant={currentExportType === 'quarter_export' ? 'contained' : 'outlined'}
                    onClick={() => handleExportChange('quarter_export')}
                  >
                    <Translations text='QuarterGrades' />
                  </Button>
                </ButtonGroup>
              </Grid>
            </Grid>
          </CardContent>
          {currentExportType === 'journal_export' && (
            <JournalExport
              school={school}
              handleSchoolChange={handleSchoolChange}
              classroom={classroom}
              handleClassroomChange={handleClassroomChange}
              subject={subject}
              handleSubjectChange={handleSubjectChange}
              period={period}
              handlePeriodChange={handlePeriodChange}
            />
          )}
          {currentExportType === 'quarter_export' && (
            <QuarterExport
              type={type}
              handleTypeChange={handleTypeChange}
              school={school}
              handleSchoolChange={handleSchoolChange}
              classroom={classroom}
              handleClassroomChange={handleClassroomChange}
              subject={subject}
              handleSubjectChange={handleSubjectChange}
              period={period}
              handlePeriodChange={handlePeriodChange}
            />
          )}
        </Card>
      </Grid>
    </Grid>
  )
}

Export.acl = {
  action: 'read',
  subject: 'tool_export'
}

export default Export
