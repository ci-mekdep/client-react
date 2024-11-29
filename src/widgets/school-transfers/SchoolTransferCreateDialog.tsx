import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  IconButtonProps,
  ListItemText,
  styled,
  Typography
} from '@mui/material'
import { SyntheticEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { ErrorKeyType } from 'src/entities/app/GeneralTypes'
import { SchoolTransferCreateType } from 'src/entities/app/SchoolTransferType'
import { SchoolListType } from 'src/entities/school/SchoolType'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchPublicRegionsV2 } from 'src/features/store/apps/publicRegions'
import { fetchPublicSchools } from 'src/features/store/apps/publicSchools'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'
import Icon from 'src/shared/components/icon'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomTextField from 'src/shared/components/mui/text-field'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

type PropsType = {
  isOpen: boolean
  handleClose: () => void
  studentId: string | null
  sourceClassroomId: string | null
  errors: ErrorKeyType
  handleCreateSchoolTransfer: (data: SchoolTransferCreateType) => void
}

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

const SchoolTransferCreateDialog = (props: PropsType) => {
  // ** State
  const { isOpen, handleClose, studentId, sourceClassroomId, errors, handleCreateSchoolTransfer } = props
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [region, setRegion] = useState<SchoolListType | null>(null)
  const [targetSchool, setTargetSchool] = useState<SchoolListType | null>(null)
  const [formData, setFormData] = useState<SchoolTransferCreateType>({
    id: '',
    student_id: studentId,
    source_classroom_id: sourceClassroomId,
    target_school_id: null,
    sender_note: null,
    sender_files: []
  })

  // useEffect()

  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { public_regions_v2 } = useSelector((state: RootState) => state.publicRegions)
  const { public_schools_list } = useSelector((state: RootState) => state.publicSchools)

  useEffect(() => {
    dispatch(fetchPublicRegionsV2({}))
  }, [dispatch])

  useEffect(() => {
    if (region && region.id) {
      dispatch(fetchPublicSchools({ parent_id: region.id }))
    }
  }, [dispatch, region])

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }

  const handleFormChange = (
    field: keyof SchoolTransferCreateType,
    value: SchoolTransferCreateType[keyof SchoolTransferCreateType]
  ) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <>
      <Dialog
        fullWidth
        open={isOpen}
        onClose={handleClose}
        maxWidth='lg'
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            pb: theme => `${theme.spacing(6)} !important`,
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton onClick={handleClose}>
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          <Typography variant='h4' sx={{ mb: 4, textAlign: 'center' }}>
            <Translations text='AddSchoolTransfer' />
          </Typography>
          {studentId && sourceClassroomId && (
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
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
                  renderInput={params => <CustomTextField {...params} label={t('Region')} />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CustomAutocomplete
                  id='target_school_id'
                  value={targetSchool}
                  options={public_schools_list.data}
                  loading={public_schools_list.loading}
                  loadingText={t('ApiLoading')}
                  onChange={(event: SyntheticEvent, newValue: SchoolListType | null) => {
                    setTargetSchool(newValue)
                    handleFormChange('target_school_id', newValue?.id)
                  }}
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item.id}>
                      <ListItemText>{item.name}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => option.name || ''}
                  renderInput={params => (
                    <CustomTextField
                      {...params}
                      label={t('TargetSchool')}
                      {...(errors && errors['target_school_id']
                        ? { error: true, helperText: errorTextHandler(errors['target_school_id']) }
                        : null)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <CustomTextField
                  fullWidth
                  label={t('SenderNote')}
                  value={formData.sender_note}
                  onChange={e => handleFormChange('sender_note', e.target.value)}
                  {...(errors && errors['sender_note']
                    ? { error: true, helperText: errorTextHandler(errors['sender_note']) }
                    : null)}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Card>
                  <CardContent>
                    {filesToSend.map((fileToSend, index) => (
                      <Card key={index} sx={{ marginBottom: 4 }}>
                        <Box
                          display={'flex'}
                          flexDirection={'row'}
                          alignItems={'center'}
                          justifyContent={'space-between'}
                          gap={4}
                          padding={3}
                        >
                          <Box display={'flex'} alignItems={'center'} gap={4}>
                            <Img
                              height={30}
                              alt='device-logo'
                              src={`/images/extensions/${fileToSend.name.split('.').pop()}.png`}
                              onError={(e: any) => (e.target.src = '/images/extensions/default.png')}
                            />
                            <Typography variant='h6' fontWeight={600}>
                              {fileToSend.name}
                            </Typography>
                          </Box>
                          <Box minWidth={20}>
                            <IconButton
                              size='small'
                              onClick={() => {
                                handleDeleteFile(fileToSend)
                              }}
                              sx={{ color: 'text.secondary' }}
                            >
                              <Icon icon='tabler:trash' fontSize={22} />
                            </IconButton>
                          </Box>
                        </Box>
                      </Card>
                    ))}
                    <Button
                      color='primary'
                      component='label'
                      variant='contained'
                      htmlFor='upload-image'
                      sx={{ mr: 4 }}
                      startIcon={<Icon icon='tabler:upload' fontSize={20} />}
                    >
                      <Translations text='SelectFile' />
                      <input hidden id='upload-image' type='file' multiple onChange={handleInputFileChange} />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
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
            sx={{ mr: 2 }}
            onClick={() => handleCreateSchoolTransfer(formData)}
          >
            <Translations text='Submit' />
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            <Translations text='GoBack' />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SchoolTransferCreateDialog
