import { SyntheticEvent, useEffect } from 'react'

// ** MUI Components
import Box from '@mui/material/Box'
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Third Party Imports
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'

// ** Hooks
import { fetchPublicSchools } from 'src/features/store/apps/publicSchools'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { SchoolListType } from 'src/entities/school/SchoolType'
import { Button, ListItemText } from '@mui/material'
import { ApiInstanceType } from 'src/entities/app/AppSettingsType'
import { fetchPublicRegionsV2 } from 'src/features/store/apps/publicRegions'
import Translations from 'src/app/layouts/components/Translations'

type PropsType = {
  school: any
  setSchool: any
  welayat: any
  setWelayat: any
  region: any
  setRegion: any
  setStep: any
}

const defaultVelayat = {
  code: 'beta',
  name: 'Başga serwer',
  url: ''
}

const SchoolSelect = (props: PropsType) => {
  const { school, setSchool, welayat, setWelayat, region, setRegion, setStep } = props

  // ** Hooks
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { public_schools_list } = useSelector((state: RootState) => state.publicSchools)
  const { public_regions_v2 } = useSelector((state: RootState) => state.publicRegions)
  const { settings } = useSelector((state: RootState) => state.settings)
  const thisDomain = process.env.NEXT_PUBLIC_DOMAIN

  useEffect(() => {
    if (!settings.loading && settings.data && settings.data?.general?.api_instances) {
      const currentWelayat =
        settings.data?.general?.api_instances?.find((item: any) => item.url === thisDomain) || defaultVelayat
      if (currentWelayat) {
        setWelayat(currentWelayat)
      }
    }
  }, [setWelayat, settings, thisDomain])

  useEffect(() => {
    if (welayat) {
      dispatch(fetchPublicRegionsV2({ ...(welayat.code !== 'beta' && { code: welayat.code }) }))
    }
  }, [dispatch, welayat])

  useEffect(() => {
    if (region) {
      dispatch(fetchPublicSchools({ parent_id: region.id }))
    }
  }, [dispatch, region])

  return (
    <>
      <Box mb={4}>
        <CustomAutocomplete
          id='welayat_id'
          value={welayat}
          options={settings.data?.general?.api_instances ? settings.data?.general.api_instances : []}
          loading={settings.loading}
          loadingText={t('ApiLoading')}
          onChange={(event: SyntheticEvent, newValue: ApiInstanceType | null) => {
            if (newValue && newValue?.url !== thisDomain) {
              window.open(newValue.url, '_blank')
            } else {
              setWelayat(newValue)
            }
          }}
          noOptionsText={t('NoRows')}
          renderOption={(props, item) => (
            <li {...props} key={item.code}>
              <ListItemText>{item.name}</ListItemText>
            </li>
          )}
          getOptionLabel={option => option.name || ''}
          renderInput={params => <CustomTextField {...params} label={t('SelectVelayat')} />}
        />
      </Box>
      <Box mb={4}>
        <CustomAutocomplete
          id='region_id'
          value={region}
          options={public_regions_v2.data}
          loading={public_regions_v2.loading}
          loadingText={t('ApiLoading')}
          onChange={(event: SyntheticEvent, newValue: SchoolListType | null) => {
            setRegion(newValue)
          }}
          noOptionsText={t('NoRows')}
          renderOption={(props, item) => (
            <li {...props} key={item.id}>
              <ListItemText>{item.name}</ListItemText>
            </li>
          )}
          getOptionLabel={option => option.name || ''}
          renderInput={params => <CustomTextField {...params} label={t('SelectRegion')} />}
        />
      </Box>
      <Box mb={4}>
        <CustomAutocomplete
          id='school_id'
          value={school}
          options={public_schools_list.data}
          loading={public_schools_list.loading}
          loadingText={t('ApiLoading')}
          onChange={(event: SyntheticEvent, newValue: SchoolListType | null) => {
            setSchool(newValue)
            setStep('phone')
          }}
          noOptionsText={t('NoRows')}
          renderOption={(props, item) => (
            <li {...props} key={item.id}>
              <ListItemText>{item.name}</ListItemText>
            </li>
          )}
          getOptionLabel={option => option.name || ''}
          renderInput={params => <CustomTextField {...params} label={t('SelectSchool')} />}
        />
      </Box>
      <Box>
        <Button fullWidth type='submit' variant='contained' onClick={() => setStep('phone')}>
          <Translations text='Submit' />
        </Button>
      </Box>
    </>
  )
}

export default SchoolSelect
