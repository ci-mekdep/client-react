// ** React Imports
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Type Imports

// ** Third Party Imports
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'

// ** Store Imports
import { fetchSchoolsLite } from 'src/features/store/apps/school'

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { Checkbox, CircularProgress, FormControlLabel, InputAdornment, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'
import Error from 'src/widgets/general/Error'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { BaseSubjectCreateType } from 'src/entities/classroom/BaseSubjectType'
import { fetchSettings } from 'src/features/store/apps/settings'
import { addBaseSubject } from 'src/features/store/apps/baseSubjects'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'

const defaultValues: BaseSubjectCreateType = {
  name: '',
  category: '',
  age_category: '',
  is_available: true,
  exam_min_grade: null,
  price: '',
  school_id: null
}

const BaseSubjectCreate = () => {
  // ** State
  const [formData, setFormData] = useState<BaseSubjectCreateType>(defaultValues)
  const [category, setCategory] = useState<string | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean>(true)
  const [school, setSchool] = useState<LiteModelType | null>(null)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { base_subject_add } = useSelector((state: RootState) => state.baseSubjects)
  const { settings } = useSelector((state: RootState) => state.settings)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)

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

  const onSubmit = (
    event: FormEvent<HTMLFormElement> | null,
    data: BaseSubjectCreateType,
    is_list: boolean | string
  ) => {
    event?.preventDefault()

    const obj = { ...data, price: data.price ? parseInt(data.price.toString() + '00', 10) : null }

    dispatch(addBaseSubject(obj))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setCategory(null)
          setIsAvailable(true)
          setSchool(null)
        } else {
          router.push(is_list === true ? '/base-subjects' : `/base-subjects/view/${res.base_subject.id}`)
        }
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

  const handleFormChange = (
    field: keyof BaseSubjectCreateType,
    value: BaseSubjectCreateType[keyof BaseSubjectCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  if (settings.error) {
    return <Error error={settings.error} />
  }

  return (
    <form
      autoComplete='off'
      onSubmit={e => {
        onSubmit(e, formData, false)
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader title={t('CourseInformation')} />
            <Divider />
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={12} md={6} lg={6}>
                  <CustomTextField
                    fullWidth
                    required
                    label={t('Name')}
                    InputProps={{ inputProps: { tabIndex: 1 } }}
                    value={formData.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                    {...(errors && errors['name']
                      ? { error: true, helperText: errorTextHandler(errors['name']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='category'
                    value={category}
                    options={settings.data.subject ? settings.data.subject?.base_subjects : []}
                    loadingText={t('ApiLoading')}
                    loading={settings.loading}
                    onChange={(event: SyntheticEvent, newValue: string | null) => {
                      setCategory(newValue)
                      if (newValue === null) {
                        handleFormChange('category', '')
                      } else {
                        handleFormChange('category', newValue)
                      }
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item}>
                        <ListItemText>{item}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors['category']
                          ? { error: true, helperText: errorTextHandler(errors['category']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 2 }}
                        label={t('Category')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    select
                    fullWidth
                    label={t('AgeCategory')}
                    InputProps={{ inputProps: { tabIndex: 3 } }}
                    SelectProps={{
                      value: formData.age_category,
                      onChange: e => handleFormChange('age_category', e.target.value as string)
                    }}
                    {...(errors && errors['age_category']
                      ? { error: true, helperText: errorTextHandler(errors['age_category']) }
                      : null)}
                  >
                    <MenuItem value='adult'>
                      <Translations text='Adults' />
                    </MenuItem>
                    <MenuItem value='kid'>
                      <Translations text='Kids' />
                    </MenuItem>
                  </CustomTextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    type='text'
                    label={t('ExamMinGrade')}
                    InputProps={{ inputProps: { tabIndex: 4 } }}
                    value={formData.exam_min_grade}
                    onChange={e => {
                      const input = e.target.value
                      if (!input || !isNaN((input as any) - parseFloat(input))) {
                        handleFormChange('exam_min_grade', e.target.value === '' ? '' : Number(e.target.value))
                      }
                    }}
                    {...(errors && errors['exam_min_grade']
                      ? { error: true, helperText: errorTextHandler(errors['exam_min_grade']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomTextField
                    fullWidth
                    type='text'
                    label={t('Price')}
                    value={formData.price}
                    onChange={e => {
                      const input = e.target.value
                      if (!input || !isNaN((input as any) - parseFloat(input))) {
                        handleFormChange('price', e.target.value === '' ? '' : Number(e.target.value))
                      }
                    }}
                    InputProps={{
                      inputProps: { tabIndex: 5 },
                      endAdornment: <InputAdornment position='end'>TMT</InputAdornment>
                    }}
                    {...(errors && errors['price']
                      ? { error: true, helperText: errorTextHandler(errors['price']) }
                      : null)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <CustomAutocomplete
                    id='school_id'
                    value={school}
                    options={schools_lite_list.data}
                    loading={schools_lite_list.loading}
                    loadingText={t('ApiLoading')}
                    onChange={(event: SyntheticEvent, newValue: LiteModelType | null) => {
                      setSchool(newValue)
                      handleFormChange('school_id', newValue?.key)
                    }}
                    noOptionsText={t('NoRows')}
                    renderOption={(props, item) => (
                      <li {...props} key={item.key}>
                        <ListItemText>{item.value}</ListItemText>
                      </li>
                    )}
                    getOptionLabel={option => option.value || ''}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        {...(errors && errors['school_id']
                          ? { error: true, helperText: errorTextHandler(errors['school_id']) }
                          : null)}
                        inputProps={{ ...params.inputProps, tabIndex: 6 }}
                        label={t('EduCenter')}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    label={t('Available')}
                    control={
                      <Checkbox
                        tabIndex={7}
                        checked={isAvailable}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setIsAvailable(event.target.checked)
                          handleFormChange('is_available', event.target.checked)
                        }}
                        name='is_available'
                      />
                    }
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
          <Button variant='contained' sx={{ mr: 4 }} disabled={base_subject_add.loading} type='submit'>
            {base_subject_add.loading ? (
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
            disabled={base_subject_add.loading}
            onClick={() => {
              onSubmit(null, formData, true)
            }}
          >
            {base_subject_add.loading ? (
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
  )
}

BaseSubjectCreate.acl = {
  action: 'write',
  subject: 'admin_subjects'
}

export default BaseSubjectCreate
