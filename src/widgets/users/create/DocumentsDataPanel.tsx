import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  styled,
  Theme,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import CustomTextField from 'src/shared/components/mui/text-field'
import { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import i18n from 'i18next'
import format from 'date-fns/format'
import Icon from 'src/shared/components/icon'
import { UserCreateType } from 'src/entities/school/UserType'
import Translations from 'src/app/layouts/components/Translations'
import parse from 'date-fns/parse'
import CustomAvatar from 'src/shared/components/mui/avatar'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import { errorTextHandler } from 'src/features/utils/api/errorHandler'
import { ErrorKeyType } from 'src/entities/app/GeneralTypes'

type PropsType = {
  errors: ErrorKeyType
  imgSrc: string
  formData: UserCreateType
  handleFormChange: (field: any, val: any) => void
  documentFiles: File[]
  oldDocuments?: string[]
  handleInputFilesChange: (val: any) => void
  handleDeleteFile: (file: File) => void
}

const CustomInput = forwardRef((props, ref) => {
  return (
    <CustomTextField
      fullWidth
      {...props}
      inputRef={ref}
      label={i18n.t('Date')}
      InputProps={{
        startAdornment: (
          <InputAdornment position='start'>
            <Icon icon='tabler:calendar' />
          </InputAdornment>
        )
      }}
      autoComplete='off'
    />
  )
})

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const DocumentsDataPanel = (props: PropsType) => {
  // ** State
  const errors = props.errors
  const imgSrc = props.imgSrc
  const formData = props.formData
  const handleFormChange = props.handleFormChange
  const documentFiles = props.documentFiles
  const oldDocuments = props.oldDocuments
  const handleDeleteFile = props.handleDeleteFile
  const handleInputFilesChange = props.handleInputFilesChange

  // ** Hooks
  const { t } = useTranslation()
  const isFixedWidth = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card
          sx={{
            mx: 'auto',
            ...(isFixedWidth && {
              maxWidth: 600
            })
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CustomAvatar
                  src={imgSrc}
                  sx={{
                    width: 100,
                    height: 100,
                    marginRight: theme => theme.spacing(6),
                    borderRadius: theme => theme.shape.borderRadius + 'px!important'
                  }}
                  alt={t('UserAvatarAlt') as string}
                />
                <Box padding={4}>
                  <Typography display={'flex'} alignItems='center' sx={{ mb: 3, gap: 3, fontSize: 21 }}>
                    {renderUserFullname(formData.last_name, formData.first_name, formData.middle_name)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={12}>
        <Card
          sx={{
            mx: 'auto',
            ...(isFixedWidth && {
              maxWidth: 600
            })
          }}
        >
          <CardHeader title={t('Documents')} />
          <Divider />
          <CardContent>
            <Grid container spacing={5}>
              {formData.documents?.map(document => (
                <>
                  <Grid item xs={8}>
                    <CustomTextField
                      fullWidth
                      label={document.key ? t(document.key) : document.key}
                      placeholder=''
                      value={document.number}
                      onChange={e => {
                        const val = e.target.value

                        const newState = formData.documents?.map(item => {
                          if (item.key === document.key) {
                            return { ...item, number: val }
                          }

                          return item
                        })

                        handleFormChange('documents', newState)
                      }}
                      {...(errors && errors['document_files']
                        ? { error: true, helperText: errorTextHandler(errors['document_files']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <DatePicker
                      locale='tm'
                      autoComplete='off'
                      selected={document.date ? parse(document.date, 'dd.MM.yyyy', new Date()) : null}
                      dateFormat='dd.MM.yyyy'
                      showYearDropdown
                      showMonthDropdown
                      preventOpenOnFocus
                      placeholderText='DD.MM.YYYY'
                      customInput={<CustomInput />}
                      id={document.key || 'document_date'}
                      calendarStartDay={1}
                      onChange={(date: Date | null) => {
                        const newState = formData.documents?.map(item => {
                          if (item.key === document.key) {
                            return { ...item, date: date ? format(new Date(date), 'dd.MM.yyyy') : '' }
                          }

                          return item
                        })

                        handleFormChange('documents', newState)
                      }}
                    />
                  </Grid>
                </>
              ))}
              {oldDocuments && oldDocuments.length !== 0 && (
                <Grid item xs={12} sm={12}>
                  <Card>
                    <CardContent sx={{ p: 3, pb: '0.75rem!important' }}>
                      {oldDocuments.map((file, index) => (
                        <Button
                          key={index}
                          variant='tonal'
                          color='success'
                          sx={{ mr: 4, mb: 2 }}
                          onClick={() => {
                            handleDownloadFile(file)
                          }}
                          startIcon={<Icon icon='tabler:download' fontSize={20} />}
                        >
                          {file.split('/')[file.split('/').length - 1]}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    {documentFiles.map((file, index) => (
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
                              src={`/images/extensions/${file.name.split('.').pop()}.png`}
                              onError={(e: any) => (e.target.src = '/images/extensions/default.png')}
                            />
                            <Typography variant='h6' fontWeight={600}>
                              {file.name}
                            </Typography>
                          </Box>
                          <Box minWidth={20}>
                            <IconButton
                              size='small'
                              onClick={() => {
                                handleDeleteFile(file)
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
                      <input hidden id='upload-image' type='file' multiple onChange={handleInputFilesChange} />
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default DocumentsDataPanel
