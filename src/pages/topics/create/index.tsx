// ** React Imports
import { FormEvent, SyntheticEvent, useEffect, useState } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Component Import
import CustomTextField from 'src/shared/components/mui/text-field'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Icon Imports
import Icon from 'src/shared/components/icon'

// ** Store Imports

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { Box, CircularProgress, Collapse, IconButton, ListItemText, MenuItem, Typography, styled } from '@mui/material'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomChip from 'src/shared/components/mui/chip'

import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import { TopicCreateType } from 'src/entities/journal/TopicType'
import { addTopic } from 'src/features/store/apps/topics'
import { SubjectSettingsType } from 'src/entities/classroom/SubjectType'
import ReactDraftWysiwyg from 'src/shared/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/shared/styles/libs/react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState } from 'draft-js'

// @ts-ignore
import { stateToMarkdown } from 'draft-js-export-markdown'
import { fetchSettings } from 'src/features/store/apps/settings'
import { fetchBooks } from 'src/features/store/apps/books'
import { BookType } from 'src/entities/app/BooksType'
import { PageChangeEvent, Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'
import { ErrorKeyType, ErrorModelType } from 'src/entities/app/GeneralTypes'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const defaultValues: TopicCreateType = {
  id: '',
  title: '',
  content: '',
  level: 'Adaty',
  period: '',
  classyear: '',
  language: 'tm',
  subject: null,
  tags: null,
  files: [],
  relation_ids: null
}

const TopicCreate = () => {
  // ** State
  const [formData, setFormData] = useState<TopicCreateType>(defaultValues)
  const [tags, setTags] = useState<string[]>([])
  const [subject, setSubject] = useState<SubjectSettingsType | null>(null)
  const [book, setBook] = useState<BookType | null>(null)
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty())
  const [filesToSend, setFilesToSend] = useState<any[]>([])
  const [showCode, setShowCode] = useState<boolean>(true)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  const { topic_add } = useSelector((state: RootState) => state.topics)
  const { books_list } = useSelector((state: RootState) => state.books)
  const { settings } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    dispatch(fetchSettings({}))
    dispatch(
      fetchBooks({
        limit: 500,
        offset: 0
      })
    )
  }, [dispatch])

  const onSubmit = (
    event: FormEvent<HTMLFormElement> | null,
    data: TopicCreateType,
    is_list: boolean,
    is_new?: boolean
  ) => {
    event?.preventDefault()

    const formDataToSend = new FormData()
    if (data) {
      formDataToSend.append('title', data.title)
      formDataToSend.append('period', data.period)
      formDataToSend.append('classyear', data.classyear)
    }
    if (data.content) {
      formDataToSend.append('content', data.content)
    }
    if (data.level) {
      formDataToSend.append('level', data.level)
    }
    if (data.language) {
      formDataToSend.append('language', data.language)
    }
    if (data.subject) {
      formDataToSend.append('subject', data.subject)
    }
    if (data.book_page) {
      formDataToSend.append('book_page', data.book_page.toString())
    }
    if (book) {
      formDataToSend.append('book_id', book.id.toString())
    }
    if (data.tags) {
      data.tags.map(tag => {
        formDataToSend.append('tags', tag)
      })
    }
    filesToSend.map(fileToSend => {
      formDataToSend.append('files', fileToSend)
    })

    dispatch(addTopic(formDataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_new === true) {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setTags([])
          setSubject(null)
          setMessageValue(EditorState.createEmpty())
          setFilesToSend([])
        } else {
          router.replace(is_list === true ? '/settings/topics' : `/topics/view/${res.topic.id}`)
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

  const handleDeleteFile = (file: File) => {
    const newFiles = filesToSend.filter(f => f.name !== file.name)
    setFilesToSend(newFiles)
  }

  const handleInputImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setFilesToSend([...filesToSend, ...(selectedFiles as File[])])
  }

  const handleBookPageChange = (e: PageChangeEvent) => {
    handleFormChange('book_page', e.currentPage)
  }

  const handleFormChange = (field: keyof TopicCreateType, value: TopicCreateType[keyof TopicCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    onSubmit(null, formData, false, true)
  }

  const handleSubmitAndList = () => {
    onSubmit(null, formData, false)
  }

  useKeyboardSubmit(handleSubmit, handleSubmitAndList)

  return (
    <>
      <form
        autoComplete='off'
        onSubmit={e => {
          onSubmit(e, formData, false)
        }}
        encType='multipart/form-data'
      >
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title={t('TopicInformation')} />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={12}>
                    <CustomTextField
                      fullWidth
                      required
                      label={t('Name')}
                      InputProps={{ inputProps: { tabIndex: 1 } }}
                      value={formData.title}
                      onChange={e => handleFormChange('title', e.target.value)}
                      {...(errors && errors['title']
                        ? { error: true, helperText: errorTextHandler(errors['title']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      select
                      required
                      fullWidth
                      label={t('Level')}
                      InputProps={{ inputProps: { tabIndex: 2 } }}
                      SelectProps={{
                        value: formData.level,
                        onChange: e => handleFormChange('level', e.target.value as string)
                      }}
                      {...(errors && errors['level']
                        ? { error: true, helperText: errorTextHandler(errors['level']) }
                        : null)}
                    >
                      <MenuItem value='Adaty'>
                        <Translations text='SchoolLevelNormal' />
                      </MenuItem>
                      <MenuItem value='Ýörite'>
                        <Translations text='SchoolLevelSpecial' />
                      </MenuItem>
                      <MenuItem value='Hünär'>
                        <Translations text='SchoolLevelProfessional' />
                      </MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      select
                      required
                      fullWidth
                      label={t('ClassroomLangType')}
                      InputProps={{ inputProps: { tabIndex: 3 } }}
                      SelectProps={{
                        value: formData.language,
                        onChange: e => handleFormChange('language', e.target.value as string)
                      }}
                      {...(errors && errors['language']
                        ? { error: true, helperText: errorTextHandler(errors['language']) }
                        : null)}
                    >
                      <MenuItem value='tm'>
                        <Translations text='LangTypeTm' />
                      </MenuItem>
                      <MenuItem value='ru'>
                        <Translations text='LangTypeRu' />
                      </MenuItem>
                      <MenuItem value='en'>
                        <Translations text='LangTypeEn' />
                      </MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      select
                      required
                      fullWidth
                      label={t('Quarter')}
                      InputProps={{ inputProps: { tabIndex: 4 } }}
                      SelectProps={{
                        value: formData.period,
                        onChange: e => handleFormChange('period', e.target.value as string)
                      }}
                      {...(errors && errors['period']
                        ? { error: true, helperText: errorTextHandler(errors['period']) }
                        : null)}
                    >
                      <MenuItem value='1'>1-nji çärýek</MenuItem>
                      <MenuItem value='2'>2-nji çärýek</MenuItem>
                      <MenuItem value='3'>3-nji çärýek</MenuItem>
                      <MenuItem value='4'>4-nji çärýek</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      select
                      required
                      fullWidth
                      label={t('Classroom')}
                      InputProps={{ inputProps: { tabIndex: 5 } }}
                      SelectProps={{
                        value: formData.classyear,
                        onChange: e => handleFormChange('classyear', e.target.value as string)
                      }}
                      {...(errors && errors['classyear']
                        ? { error: true, helperText: errorTextHandler(errors['classyear']) }
                        : null)}
                    >
                      <MenuItem value='1'>1-nji synp</MenuItem>
                      <MenuItem value='2'>2-nji synp</MenuItem>
                      <MenuItem value='3'>3-nji synp</MenuItem>
                      <MenuItem value='4'>4-nji synp</MenuItem>
                      <MenuItem value='5'>5-nji synp</MenuItem>
                      <MenuItem value='6'>6-njy synp</MenuItem>
                      <MenuItem value='7'>7-nji synp</MenuItem>
                      <MenuItem value='8'>8-nji synp</MenuItem>
                      <MenuItem value='9'>9-njy synp</MenuItem>
                      <MenuItem value='10'>10-njy synp</MenuItem>
                      <MenuItem value='11'>11-nji synp</MenuItem>
                      <MenuItem value='12'>12-nji synp</MenuItem>
                    </CustomTextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='subject'
                      size='small'
                      value={subject}
                      options={settings.data.subject ? settings.data.subject.subjects : []}
                      loading={settings.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: SubjectSettingsType | null) => {
                        setSubject(newValue)
                        handleFormChange('subject', newValue?.name)
                      }}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item.full_name}>
                          <ListItemText>{item.full_name}</ListItemText>
                        </li>
                      )}
                      getOptionLabel={option => option.full_name || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          {...(errors && errors['subject']
                            ? { error: true, helperText: errorTextHandler(errors['subject']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 6 }}
                          required
                          label={t('Subject')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      multiple
                      fullWidth
                      size='small'
                      disableCloseOnSelect={true}
                      value={tags}
                      options={settings.data.subject ? settings.data.subject.topic_tags : []}
                      loading={settings.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(e: any, v: string[]) => {
                        setTags(v)
                        handleFormChange('tags', v)
                      }}
                      id='tags'
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item}>
                          <ListItemText>{item}</ListItemText>
                        </li>
                      )}
                      isOptionEqualToValue={(option, value) => option === value}
                      getOptionLabel={option => option || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          {...(errors && errors['tags']
                            ? { error: true, helperText: errorTextHandler(errors['tags']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 7 }}
                          label={t('Tags')}
                        />
                      )}
                      renderTags={(value: string[], getTagProps) =>
                        value.map((option: string, index: number) => (
                          <CustomChip
                            rounded
                            skin='light'
                            color='primary'
                            sx={{ m: 0.5 }}
                            label={option}
                            {...(getTagProps({ index }) as {})}
                            key={index}
                          />
                        ))
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <EditorWrapper
                      sx={{
                        '& .rdw-editor-wrapper .rdw-editor-main': { px: 5 }
                      }}
                    >
                      <ReactDraftWysiwyg
                        tabIndex={8}
                        editorState={messageValue}
                        onEditorStateChange={editorState => {
                          setMessageValue(editorState)
                          handleFormChange('content', stateToMarkdown(editorState.getCurrentContent()))
                        }}
                        placeholder={t('Description') as string}
                        toolbar={{
                          options: ['inline', 'fontSize', 'list', 'link', 'image'],
                          inline: {
                            inDropdown: false,
                            options: ['bold', 'italic']
                          },
                          fontSize: {
                            options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96]
                          },
                          list: {
                            inDropdown: false,
                            options: ['unordered', 'ordered']
                          },
                          link: {
                            inDropdown: false,
                            options: ['link']
                          }
                        }}
                      />
                    </EditorWrapper>
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
                          tabIndex={9}
                          color='primary'
                          component='label'
                          variant='contained'
                          htmlFor='upload-image'
                          sx={{ mr: 4 }}
                          startIcon={<Icon icon='tabler:upload' fontSize={20} />}
                        >
                          <Translations text='SelectFile' />
                          <input hidden id='upload-image' type='file' multiple onChange={handleInputImageChange} />
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title={t('Book')}
                action={
                  <IconButton onClick={() => setShowCode(prev => !prev)}>
                    <Icon icon={showCode ? 'tabler:chevron-up' : 'tabler:chevron-down'} fontSize={24} />
                  </IconButton>
                }
              />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={6}>
                    <CustomAutocomplete
                      id='book'
                      size='small'
                      value={book}
                      options={books_list.data}
                      loading={books_list.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(event: SyntheticEvent, newValue: BookType | null) => {
                        setBook(newValue)
                      }}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item.title}>
                          <ListItemText>{item.title}</ListItemText>
                        </li>
                      )}
                      getOptionLabel={option => option.title || ''}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          {...(errors && errors['book']
                            ? { error: true, helperText: errorTextHandler(errors['book']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 10 }}
                          label={t('Book')}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CustomTextField
                      fullWidth
                      type='text'
                      label={t('BookPage')}
                      value={formData.book_page}
                      InputProps={{ inputProps: { tabIndex: 11 } }}
                      placeholder=''
                      onChange={e => {
                        const input = e.target.value
                        if (!input || !isNaN((input as any) - parseFloat(input)))
                          handleFormChange('book_page', e.target.value)
                      }}
                      {...(errors && errors['book_page']
                        ? { error: true, helperText: errorTextHandler(errors['book_page']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    {book && book.file !== null && (
                      <Collapse in={showCode} timeout='auto'>
                        <Box>
                          <Worker workerUrl={'/pdf.worker.min.js'}>
                            <Box
                              sx={{
                                height: '80vh',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                              }}
                            >
                              <Viewer
                                fileUrl={book.file}
                                defaultScale={1}
                                onPageChange={handleBookPageChange}
                                plugins={[defaultLayoutPluginInstance]}
                              />
                            </Box>
                          </Worker>
                        </Box>
                      </Collapse>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Button variant='contained' sx={{ mr: 4 }} disabled={topic_add.loading} type='submit'>
              {topic_add.loading ? (
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
              disabled={topic_add.loading}
              onClick={() => {
                onSubmit(null, formData, true)
              }}
            >
              {topic_add.loading ? (
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
            <Button
              variant='contained'
              sx={{ mr: 4 }}
              disabled={topic_add.loading}
              onClick={() => {
                onSubmit(null, formData, true, true)
              }}
            >
              {topic_add.loading ? (
                <CircularProgress
                  sx={{
                    width: '20px !important',
                    height: '20px !important',
                    mr: theme => theme.spacing(2)
                  }}
                />
              ) : null}
              <Translations text='AddMore' />
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

TopicCreate.acl = {
  action: 'write',
  subject: 'admin_topics'
}

export default TopicCreate
