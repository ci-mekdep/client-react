// ** React Imports
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

// ** MUI Imports
import { Box, Checkbox, CircularProgress, ListItemText } from '@mui/material'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Icon Imports

// ** Store Imports
import { fetchSchoolsLite } from 'src/features/store/apps/school'

// ** Utils Imports

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { useSelector } from 'react-redux'
import { ReportFormCreateType, ReportFormType } from 'src/entities/app/ReportFormType'
import { getCurrentReportForm, updateReportForm } from 'src/features/store/apps/tools/reportForms'
import CustomChip from 'src/shared/components/mui/chip'
import { convertReportFormData } from 'src/features/utils/api/convertReportFormData'
import Error from 'src/widgets/general/Error'

const defaultValues: ReportFormCreateType = {
  title: '',
  description: '',
  value_types: [],
  school_ids: [],
  is_pinned: false,
  is_center_rating: false,
  is_classrooms_included: false
}

const ReportFormCreate = () => {
  // ** State
  const [selectedSchools, setSelectedSchools] = useState<LiteModelType[]>([])
  const [schools, setSchools] = useState<LiteModelType[]>([])
  const [formData, setFormData] = useState<ReportFormCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const currentReportFormId = router.query.reportFormId
  const { report_form_update, report_form_detail } = useSelector((state: RootState) => state.reportForms)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

  useEffect(() => {
    if (currentReportFormId !== undefined) {
      dispatch(getCurrentReportForm(currentReportFormId as string))
    }
  }, [dispatch, currentReportFormId])

  useEffect(() => {
    if (!schools_lite_list.loading && schools_lite_list.status === 'success') {
      const allSchools = [{ key: '', value: 'Ählisi' }, ...schools_lite_list.data]
      setSchools(allSchools)
    }
  }, [schools_lite_list])

  useEffect(() => {
    dispatch(
      fetchSchoolsLite({
        limit: 750,
        offset: 0,
        is_select: true
      })
    )
  }, [dispatch])

  useEffect(() => {
    if (currentReportFormId !== undefined && schools_lite_list.data.length !== 0) {
      const detailData: ReportFormType = { ...(report_form_detail.data as ReportFormType) }
      setFormData(convertReportFormData(detailData))
      setSelectedSchools(schools_lite_list.data.filter(school => detailData.school_ids?.includes(school.key)))
    }
  }, [currentReportFormId, report_form_detail.data, schools_lite_list])

  const handleFormChange = (
    field: keyof ReportFormCreateType,
    value: ReportFormCreateType[keyof ReportFormCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: ReportFormCreateType, is_list: boolean) => {
    event?.preventDefault()
    dispatch(updateReportForm(data))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        router.push(is_list === true ? '/tools/report-forms' : `/tools/report-forms/view/${res.report.id}/submit`)
      })
      .catch(err => {
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            errorObject[err.key] = err.code
          }
        })
        setErrors(errorObject)
        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  if (report_form_detail.error) {
    return <Error error={report_form_detail.error} />
  }

  return (
    <>
      <form
        autoComplete='off'
        onSubmit={e => {
          onSubmit(e, formData, false)
        }}
      >
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('ReportFormInformation')} />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      label={t('Name')}
                      value={formData.title}
                      onChange={e => handleFormChange('title', e.target.value)}
                      {...(errors && errors['title']
                        ? { error: true, helperText: errorTextHandler(errors['title']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      rows={5}
                      multiline
                      label={t('Description')}
                      value={formData.description}
                      onChange={e => handleFormChange('description', e.target.value)}
                      inputProps={{ style: { resize: 'vertical' } }}
                      {...(errors && errors['description']
                        ? { error: true, helperText: errorTextHandler(errors['description']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <CustomAutocomplete
                      id='school_ids'
                      size='small'
                      multiple
                      fullWidth
                      value={selectedSchools}
                      options={schools}
                      loading={schools_lite_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(e: any, v: LiteModelType[]) => {
                        setSelectedSchools(v)
                        handleFormChange(
                          'school_ids',
                          v.map(item => item.key)
                        )
                      }}
                      disableCloseOnSelect={true}
                      isOptionEqualToValue={(option, value) => option.key === value.key}
                      getOptionLabel={option => option.value}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item.key}>
                          <ListItemText>{item.value}</ListItemText>
                        </li>
                      )}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          label={t('Schools')}
                          {...(errors && errors['school_ids']
                            ? { error: true, helperText: errorTextHandler(errors['school_ids']) }
                            : null)}
                        />
                      )}
                      renderTags={(value: LiteModelType[], getTagProps) =>
                        value.map((option: LiteModelType, index: number) => (
                          <CustomChip
                            rounded
                            skin='light'
                            color='primary'
                            sx={{ m: 0.5 }}
                            label={option.value}
                            {...(getTagProps({ index }) as {})}
                            key={index}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      onClick={() => {
                        handleFormChange(
                          'is_pinned',
                          formData.is_pinned === true ? false : formData.is_pinned === false ? true : true
                        )
                      }}
                      sx={{
                        px: 4,
                        py: 2,
                        display: 'flex',
                        borderRadius: 1,
                        cursor: 'pointer',
                        position: 'relative',
                        alignItems: 'flex-start',
                        border: theme =>
                          `1px solid ${
                            formData.is_pinned === true ? theme.palette.primary.main : theme.palette.divider
                          }`,
                        '&:hover': {
                          borderColor: theme =>
                            `rgba(${
                              formData.is_pinned === true
                                ? theme.palette.primary.light
                                : theme.palette.customColors.main
                            }, 0.25)`
                        }
                      }}
                    >
                      <Checkbox
                        size='small'
                        name='is_pinned'
                        checked={formData.is_pinned}
                        sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          handleFormChange('is_pinned', event.target.checked === true)
                        }}
                      />
                      <Translations text='PinReportForm' />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      onClick={() => {
                        handleFormChange(
                          'is_center_rating',
                          formData.is_center_rating === true ? false : formData.is_center_rating === false ? true : true
                        )
                      }}
                      sx={{
                        px: 4,
                        py: 2,
                        display: 'flex',
                        borderRadius: 1,
                        cursor: 'pointer',
                        position: 'relative',
                        alignItems: 'flex-start',
                        border: theme =>
                          `1px solid ${
                            formData.is_center_rating === true ? theme.palette.primary.main : theme.palette.divider
                          }`,
                        '&:hover': {
                          borderColor: theme =>
                            `rgba(${
                              formData.is_center_rating === true
                                ? theme.palette.primary.light
                                : theme.palette.customColors.main
                            }, 0.25)`
                        }
                      }}
                    >
                      <Checkbox
                        size='small'
                        name='is_center_rating'
                        checked={formData.is_center_rating}
                        sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          handleFormChange('is_center_rating', event.target.checked === true)
                        }}
                      />
                      <Translations text='CenterRating' />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box
                      onClick={() => {
                        handleFormChange(
                          'is_classrooms_included',
                          formData.is_classrooms_included === true
                            ? false
                            : formData.is_classrooms_included === false
                            ? true
                            : true
                        )
                      }}
                      sx={{
                        px: 4,
                        py: 2,
                        display: 'flex',
                        borderRadius: 1,
                        cursor: 'pointer',
                        position: 'relative',
                        alignItems: 'flex-start',
                        border: theme =>
                          `1px solid ${
                            formData.is_classrooms_included === true
                              ? theme.palette.primary.main
                              : theme.palette.divider
                          }`,
                        '&:hover': {
                          borderColor: theme =>
                            `rgba(${
                              formData.is_classrooms_included === true
                                ? theme.palette.primary.light
                                : theme.palette.customColors.main
                            }, 0.25)`
                        }
                      }}
                    >
                      <Checkbox
                        size='small'
                        name='is_classrooms_included'
                        checked={formData.is_classrooms_included}
                        sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          handleFormChange('is_classrooms_included', event.target.checked === true)
                        }}
                      />
                      <Translations text='ReportFormByClassrooms' />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Button variant='contained' sx={{ mr: 4 }} disabled={report_form_update.loading} type='submit'>
              {report_form_update.loading ? (
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              <Translations text='Submit' />
            </Button>
            <Button
              variant='contained'
              sx={{ mr: 4 }}
              disabled={report_form_update.loading}
              onClick={() => {
                onSubmit(null, formData, true)
              }}
            >
              {report_form_update.loading ? (
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              <Translations text='SubmitAndList' />
            </Button>
            <Button variant='tonal' color='secondary' onClick={() => router.back()}>
              <Translations text='GoBack' />
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  )
}

ReportFormCreate.acl = {
  action: 'write',
  subject: 'tool_report_forms'
}

export default ReportFormCreate
