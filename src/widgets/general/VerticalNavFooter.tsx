// ** React Imports
import { SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Box, { BoxProps } from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ButtonGroup from '@mui/material/ButtonGroup'
import Autocomplete from '@mui/material/Autocomplete'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import { CircularProgress, IconButton, IconButtonProps, ListItemText } from '@mui/material'

// ** Third party libs imports
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

// ** Type Import
import { LayoutProps } from 'src/shared/layouts/types'
import { UserSchoolLiteType, UserSchoolType } from 'src/entities/school/UserSchoolType'
import { SchoolListType, SchoolType } from 'src/entities/school/SchoolType'

// ** Custom Icon Import
import Icon from 'src/shared/components/icon'
import Translations from 'src/app/layouts/components/Translations'

// ** Store imports
import { useAuth } from 'src/features/hooks/useAuth'
import { useSelector, useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { renderRole } from 'src/features/utils/ui/renderRole'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchPublicRegionsV2 } from 'src/features/store/apps/publicRegions'
import { fetchSettingsOnline } from 'src/features/store/apps/settings/online'
import CustomChip from 'src/shared/components/mui/chip'
import useFcmToken from 'src/features/utils/hooks/useFcmToken'
import toast from 'react-hot-toast'
import { LiteModelType } from 'src/entities/app/GeneralTypes'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { PeriodType } from 'src/entities/school/PeriodType'
import { fetchPeriods } from 'src/features/store/apps/periods'

interface Props {
  settings: LayoutProps['settings']
}

const adminSchool: SchoolType = {
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

// ** Styled Components
const MenuFooterWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingRight: theme.spacing(3.5),
  transition: 'padding .25s ease-in-out',
  minHeight: 170
}))

const CustomCloseButton = styled(IconButton)<IconButtonProps>(({ theme }) => ({
  top: 0,
  right: 0,
  color: 'grey.500',
  position: 'absolute',
  boxShadow: theme.shadows[2],
  transform: 'translate(10px, -10px)',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: `${theme.palette.background.paper} !important`,
  transition: 'transform 0.25s ease-in-out, box-shadow 0.25s ease-in-out',
  '&:hover': {
    transform: 'translate(7px, -5px)'
  }
}))

const VerticalNavFooter = (props: Props) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const [region, setRegion] = useState<SchoolType | null>(null)
  const [regions, setRegions] = useState<SchoolType[]>([])

  const [school, setSchool] = useState<UserSchoolLiteType | null>(null)
  const [schools, setSchools] = useState<UserSchoolLiteType[]>([])

  const [period, setPeriod] = useState<PeriodType | null>(null)
  const [periods, setPeriods] = useState<PeriodType[]>([])

  // ** Props
  const { settings } = props

  // ** Hooks & Vars
  const { t } = useTranslation()
  const { navCollapsed } = settings
  const { fcmToken } = useFcmToken()
  const dispatch = useDispatch<AppDispatch>()
  const { user, current_role, current_school, current_region, current_period, handleUpdateProfile } = useAuth()

  const { online } = useSelector((state: RootState) => state.settingsOnline)
  const { periods_list } = useSelector((state: RootState) => state.periods)
  const { schools_lite_list } = useSelector((state: RootState) => state.schools)
  const { public_regions_v2 } = useSelector((state: RootState) => state.publicRegions)

  useEffect(() => {
    if (current_school !== null) {
      dispatch(fetchSettingsOnline({ school_id: current_school.id }))
    } else {
      dispatch(fetchSettingsOnline({}))
    }
  }, [current_school, dispatch])

  useEffect(() => {
    if (current_region !== null && current_role !== null) {
      setRegion(current_region)
    } else if (current_region === null) {
      setRegion(adminSchool)
    }
  }, [current_region, current_role])

  useEffect(() => {
    if (user?.schools && current_school !== null && current_role !== null) {
      setSchool({ role_code: current_role, school: { key: current_school.id, value: current_school.name } })
    } else if (current_school === null && current_role !== null) {
      setSchool({ role_code: current_role, school: { key: adminSchool.id, value: adminSchool.name } })
    }
  }, [current_role, current_school, user])

  useEffect(() => {
    if (current_period !== null && current_role !== null) {
      setPeriod(current_period)
    } else if (current_period === null) {
      setPeriod(allPeriod)
    }
  }, [current_period, current_role])

  useEffect(() => {
    if (
      (region && user?.schools && current_role === 'admin' && schools_lite_list.data.length !== 0) ||
      (region && user?.schools && current_role === 'organization' && schools_lite_list.data.length !== 0) ||
      (region && user?.schools && current_role === 'operator' && schools_lite_list.data.length !== 0)
    ) {
      const oldSchools = user?.schools.map((school: UserSchoolType) => {
        if (school.role_code === 'admin' || school.role_code === 'organization' || school.role_code === 'operator') {
          return { role_code: school.role_code, school: { key: adminSchool.id, value: adminSchool.name } }
        } else {
          return { role_code: school.role_code, school: { key: school.school.id, value: school.school.name } }
        }
      })
      const newSchools = schools_lite_list.data.map((school: LiteModelType) => {
        return { role_code: current_role, school: school }
      })

      setSchools(() => [...oldSchools, ...newSchools])
    } else if (user?.schools) {
      const oldSchools = user?.schools.map((school: UserSchoolType) => {
        if (school.role_code === 'admin' || school.role_code === 'organization' || school.role_code === 'operator') {
          return { role_code: school.role_code, school: { key: adminSchool.id, value: adminSchool.name } }
        } else {
          return { role_code: school.role_code, school: { key: school.school.id, value: school.school.name } }
        }
      })
      setSchools(() => oldSchools)
    }
  }, [region, schools_lite_list.data, current_role, user?.schools])

  useEffect(() => {
    if (!public_regions_v2.loading && public_regions_v2.data) {
      const arr: SchoolListType[] = []
      arr.push(adminSchool)
      setRegions([...arr, ...public_regions_v2.data])
    }
  }, [public_regions_v2])

  useEffect(() => {
    dispatch(fetchPublicRegionsV2({}))
  }, [dispatch])

  useEffect(() => {
    if (!periods_list.loading && periods_list.data) {
      setPeriods([allPeriod, ...periods_list.data])
    }
  }, [periods_list])

  useEffect(() => {
    if (
      (current_role === 'admin' || current_role === 'organization' || current_role === 'operator') &&
      region !== null
    ) {
      dispatch(
        fetchSchoolsLite({
          limit: 750,
          offset: 0,
          parent_id: region.id
        })
      )
    }
  }, [current_role, dispatch, region])

  useEffect(() => {
    if (region !== null && school !== null && school.school.key !== '') {
      dispatch(fetchPeriods({ limit: 100, offset: 0, school_id: school.school.key }))
    }
  }, [current_role, dispatch, region, school])

  const handleFilterRegion = (event: SyntheticEvent, newValue: SchoolListType | null) => {
    setRegion(newValue)
    setSchool(null)
    setPeriod(null)
  }

  const handleFilterSchool = (event: SyntheticEvent, newValue: UserSchoolLiteType | null) => {
    setSchool(newValue)
    setPeriod(allPeriod)
  }

  const handleFilterPeriod = (event: SyntheticEvent, newValue: PeriodType | null) => {
    if (newValue && newValue.is_archived === true && newValue.archive_link) {
      window.open(newValue.archive_link, '_blank')
    } else {
      setPeriod(newValue)
    }
  }

  const handleClose = () => {
    setDialogOpen(false)
  }

  const onSubmit = async () => {
    if (school !== null && region !== null && period !== null) {
      setIsSubmitting(true)
      const toastId = toast.loading(t('ApiLoading'))

      try {
        await handleUpdateProfile(school, region, period, fcmToken)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
      } catch (error: any) {
        toast.dismiss(toastId)
        toast.error(errorHandler(error), { duration: 2000 })
      } finally {
        setIsSubmitting(false)
        handleClose()
        toast.dismiss(toastId)
      }
    }
  }

  return (
    <>
      <Dialog
        fullWidth
        open={dialogOpen}
        onClose={
          !isSubmitting
            ? handleClose
            : () => {
                return
              }
        }
        sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 580 }, '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={() => !isSubmitting && handleClose()}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Box
            sx={{
              display: 'flex',
              textAlign: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <ButtonGroup variant='outlined' fullWidth sx={{ mb: 5 }}>
              <Button component={Link} href='https://mekdep.edu.tm' target='_blank' size='medium' variant='outlined'>
                <Translations text='RegionsAG' />
              </Button>
              <Button component={Link} href='https://ah.mekdep.edu.tm' target='_blank' size='medium' variant='outlined'>
                <Translations text='RegionsAH' />
              </Button>
              <Button component={Link} href='https://bn.mekdep.edu.tm' target='_blank' size='medium' variant='outlined'>
                <Translations text='RegionsBN' />
              </Button>
            </ButtonGroup>
            <ButtonGroup variant='outlined' fullWidth>
              <Button component={Link} href='https://dz.mekdep.edu.tm' target='_blank' size='medium' variant='outlined'>
                <Translations text='RegionsDZ' />
              </Button>
              <Button component={Link} href='https://lb.mekdep.edu.tm' target='_blank' size='medium' variant='outlined'>
                <Translations text='RegionsLB' />
              </Button>
              <Button component={Link} href='https://mr.mekdep.edu.tm' target='_blank' size='medium' variant='outlined'>
                <Translations text='RegionsMR' />
              </Button>
            </ButtonGroup>
            <Typography variant='h4' my={8}>
              <Translations text='RoleSwitchText' />
            </Typography>
            <Autocomplete
              id='region-select'
              fullWidth
              size='small'
              data-cy='region-select'
              sx={{ mb: 4 }}
              value={region}
              options={regions}
              defaultValue={region}
              onChange={handleFilterRegion}
              getOptionLabel={option => option.name || ''}
              noOptionsText='Maglumat ýok'
              renderOption={(props, item) => (
                <li {...props} key={item.id}>
                  <ListItemText>{item.name}</ListItemText>
                </li>
              )}
              renderInput={params => <TextField {...params} label={t('Region')} />}
            />
            {region && (
              <Autocomplete
                id='school-select'
                fullWidth
                size='small'
                data-cy='school-select'
                sx={{ mb: 4 }}
                value={school}
                options={schools}
                defaultValue={school}
                onChange={handleFilterSchool}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.school.key + item.role_code}>
                    <ListItemText>{item.school.value + ' ' + `(${renderRole(item.role_code)})`}</ListItemText>
                  </li>
                )}
                getOptionLabel={option =>
                  option.school.value + ' ' + `(${renderRole(option.role_code)})` || t('NoRows')
                }
                renderInput={params => <TextField {...params} label={t('School')} />}
              />
            )}
            {region && school && school.school.key !== '' && (
              <Autocomplete
                id='period-select'
                fullWidth
                size='small'
                data-cy='period-select'
                value={period}
                options={periods}
                defaultValue={period}
                onChange={handleFilterPeriod}
                noOptionsText={t('NoRows')}
                renderOption={(props, item) => (
                  <li {...props} key={item.id}>
                    <ListItemText>{item.title}</ListItemText>
                  </li>
                )}
                getOptionLabel={option => option.title || t('NoRows')}
                renderInput={params => <TextField {...params} label={t('Period')} />}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: 'center',
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <Button
            color='primary'
            variant='contained'
            data-cy='submit-btn'
            sx={{ mr: 2 }}
            disabled={isSubmitting}
            onClick={() => {
              onSubmit()
            }}
          >
            {isSubmitting ? (
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
            variant='tonal'
            color='secondary'
            onClick={() => {
              if (isSubmitting) {
                return
              } else {
                handleClose()
              }
            }}
          >
            <Translations text='GoBack' />
          </Button>
        </DialogActions>
      </Dialog>

      <MenuFooterWrapper
        data-shortcut-key='school-select'
        className='nav-footer'
        sx={{
          p: 6,
          marginTop: 'auto',
          cursor: 'pointer',
          ...(navCollapsed ? { display: 'none' } : { display: 'block' })
        }}
        onClick={() => {
          setDialogOpen(true)
        }}
      >
        {!online.loading && online.status === 'success' && online.data && (
          <CustomChip
            rounded
            label={t('Online') + ': ' + online.data.online_count}
            size='small'
            color='success'
            sx={{ marginBottom: 3 }}
          />
        )}
        <Box display='flex' width='100%' justifyContent='space-between' alignItems='center'>
          <Box display='flex' flexDirection='column' gap={2}>
            <Typography>
              <Translations text='SelectedSchool' />
            </Typography>
            <Typography variant='h5' fontWeight={600} data-cy='active-school'>
              {current_school !== null ? (
                current_school.name
              ) : current_region !== null ? (
                current_region.name
              ) : (
                <Translations text='All' />
              )}
            </Typography>
            <Typography variant='h5' fontWeight={600} data-cy='active-period'>
              <Translations text='Year' />:{' '}
              {current_period !== null ? current_period.title : <Translations text='All' />}
            </Typography>
          </Box>
          <Icon fontSize='1.5rem' icon='tabler:chevron-right' />
        </Box>
      </MenuFooterWrapper>
    </>
  )
}

export default VerticalNavFooter
