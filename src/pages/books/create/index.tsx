// ** React Imports
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'

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

// ** Types
import { useRouter } from 'next/router'
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { Box, Checkbox, CircularProgress, IconButton, ListItemText, Typography, styled } from '@mui/material'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import CustomChip from 'src/shared/components/mui/chip'

import { useTranslation } from 'react-i18next'
import Translations from 'src/app/layouts/components/Translations'
import { useSelector } from 'react-redux'
import { errorHandler, errorTextHandler } from 'src/features/utils/api/errorHandler'
import ReactDraftWysiwyg from 'src/shared/components/react-draft-wysiwyg'
import { EditorWrapper } from 'src/shared/styles/libs/react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState } from 'draft-js'

// @ts-ignore
import { stateToMarkdown } from 'draft-js-export-markdown'
import { fetchSettings } from 'src/features/store/apps/settings'
import { BookCreateType } from 'src/entities/app/BooksType'
import { addBook, fetchAuthors } from 'src/features/store/apps/books'
import useKeyboardSubmit from 'src/features/hooks/useKeyboardSubmit'
import { ErrorKeyType, ErrorModelType } from 'src/entities/app/GeneralTypes'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    height: 40
  }
}))

const PreviewImg = styled('img')(() => ({}))

const defaultValues: BookCreateType = {
  title: '',
  year: ''
}

const BookCreate = () => {
  // ** State
  const [formData, setFormData] = useState<BookCreateType>(defaultValues)
  const [messageValue, setMessageValue] = useState(EditorState.createEmpty())
  const [fileToSend, setFileToSend] = useState<any>()
  const [authors, setAuthors] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [imgSrc, setImgSrc] = useState<string>('')
  const [filePreview, setFilePreview] = useState<any>()
  const [inputValue, setInputValue] = useState<string>('')
  const [freeSoloInputValue, setFreeSoloInputValue] = useState<string>('')
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { book_add, book_authors } = useSelector((state: RootState) => state.books)
  const { settings } = useSelector((state: RootState) => state.settings)

  useEffect(() => {
    dispatch(fetchSettings({}))
    dispatch(fetchAuthors())
  }, [dispatch])

  const handleKeyDown = (event: any) => {
    if (event.key === ',') {
      event.preventDefault()
      const newTag = event.target.value.trim()
      if (newTag && !authors.includes(newTag)) {
        setAuthors([...authors, newTag])
        handleFormChange(
          'authors',
          [...authors, newTag].map(item => item)
        )
        setFreeSoloInputValue('')
      }
    }
  }

  const onSubmit = (event: FormEvent<HTMLFormElement> | null, data: BookCreateType, is_list: boolean | string) => {
    event?.preventDefault()

    const formDataToSend = new FormData()
    if (data.title) {
      formDataToSend.append('title', data.title)
    }
    if (data.description) {
      formDataToSend.append('description', data.description)
    }
    if (data.year) {
      formDataToSend.append('year', data.year.toString())
    }
    if (data.pages) {
      formDataToSend.append('pages', data.pages.toString())
    }
    if (data.is_downloadable) {
      formDataToSend.append('is_downloadable', data.is_downloadable)
    }
    if (data.categories) {
      data.categories.map(category => {
        formDataToSend.append('categories', category)
      })
    }
    if (data.authors) {
      data.authors.map(author => {
        formDataToSend.append('authors', author)
      })
    }
    if (fileToSend) {
      formDataToSend.append('file', fileToSend as File)
    }
    if (filePreview) {
      formDataToSend.append('file_preview', filePreview as File)
    }

    dispatch(addBook(formDataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if (is_list === 'new') {
          router.replace(router.asPath)
          setFormData(defaultValues)
          setMessageValue(EditorState.createEmpty())
          setFileToSend(null)
          setAuthors([])
          setCategories([])
          setImgSrc('')
          setFilePreview(null)
          setInputValue('')
          setFreeSoloInputValue('')
        } else {
          router.replace(is_list === true ? '/settings/books' : `/books/view/${res.book.id}`)
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

  const handleInputBookChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files as FileList
    setFileToSend(selectedFiles?.[0] as File)
  }

  const handleInputPreviewImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files as FileList
    setFilePreview(selectedFiles?.[0] as File)

    const reader = new FileReader()
    const { files } = event.target as HTMLInputElement
    if (files && files.length !== 0) {
      reader.onload = () => {
        setImgSrc(reader.result as string)
      }
      reader.readAsDataURL(files[0])

      if (reader.result !== null) {
        setInputValue(reader.result as string)
      }
    }
  }

  const handleFormChange = (field: keyof BookCreateType, value: BookCreateType[keyof BookCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = () => {
    onSubmit(null, formData, 'new')
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
              <CardHeader title={t('BookInformation')} />
              <Divider />
              <CardContent>
                <Grid container spacing={6}>
                  <Grid item xs={12} sm={10} md={9} lg={9}>
                    <CustomTextField
                      fullWidth
                      required
                      label={t('Name')}
                      InputProps={{ inputProps: { tabIndex: 1 } }}
                      value={formData.title}
                      onChange={e => handleFormChange('title', e.target.value)}
                      {...(errors && errors['name']
                        ? { error: true, helperText: errorTextHandler(errors['name']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2} md={3} lg={3}>
                    <Box
                      onClick={() => {
                        handleFormChange(
                          'is_downloadable',
                          formData.is_downloadable === '1' ? '0' : formData.is_downloadable === '0' ? '1' : '1'
                        )
                      }}
                      sx={{
                        px: 4,
                        py: 2,
                        mt: 4.6,
                        display: 'flex',
                        borderRadius: 1,
                        cursor: 'pointer',
                        position: 'relative',
                        alignItems: 'flex-start',
                        border: theme =>
                          `1px solid ${
                            formData.is_downloadable === '1' ? theme.palette.primary.main : theme.palette.divider
                          }`,
                        '&:hover': {
                          borderColor: theme =>
                            `rgba(${
                              formData.is_downloadable === '1'
                                ? theme.palette.primary.light
                                : theme.palette.customColors.main
                            }, 0.25)`
                        }
                      }}
                    >
                      <Checkbox
                        size='small'
                        name='is_downloadable'
                        tabIndex={2}
                        checked={formData.is_downloadable === '1' ? true : false}
                        sx={{ mb: -2, mt: -2.5, ml: -2.75 }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          handleFormChange('is_downloadable', event.target.checked === true ? '1' : '0')
                        }}
                      />
                      <Translations text='IsDownloadableInput' />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomTextField
                      fullWidth
                      type='text'
                      label={t('Year')}
                      InputProps={{ inputProps: { tabIndex: 3 } }}
                      value={formData.year}
                      placeholder=''
                      onChange={e => {
                        const input = e.target.value
                        if (!input || !isNaN((input as any) - parseFloat(input)))
                          handleFormChange('year', e.target.value)
                      }}
                      {...(errors && errors['year']
                        ? { error: true, helperText: errorTextHandler(errors['year']) }
                        : null)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <CustomAutocomplete
                      id='categories'
                      size='small'
                      multiple
                      fullWidth
                      value={categories}
                      options={settings.data.general?.book_categories ? settings.data.general.book_categories : []}
                      loading={settings.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(e: any, v: string[]) => {
                        setCategories(v)
                        handleFormChange(
                          'categories',
                          v.map(item => item)
                        )
                      }}
                      disableCloseOnSelect={true}
                      isOptionEqualToValue={(option, value) => option === value}
                      getOptionLabel={option => option}
                      noOptionsText={t('NoRows')}
                      renderOption={(props, item) => (
                        <li {...props} key={item}>
                          <ListItemText>{item}</ListItemText>
                        </li>
                      )}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          {...(errors && errors['categories']
                            ? { error: true, helperText: errorTextHandler(errors['categories']) }
                            : null)}
                          inputProps={{ ...params.inputProps, tabIndex: 4 }}
                          label={t('Categories')}
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
                  <Grid item xs={12} sm={4}>
                    <CustomAutocomplete
                      id='authors'
                      size='small'
                      freeSolo
                      multiple
                      fullWidth
                      value={authors}
                      options={book_authors.data ? book_authors.data : []}
                      loading={book_authors.loading}
                      loadingText={t('ApiLoading')}
                      onChange={(e: any, v: string[]) => {
                        setAuthors(v)
                        handleFormChange(
                          'authors',
                          v.map(item => item)
                        )
                      }}
                      disableCloseOnSelect={true}
                      isOptionEqualToValue={(option, value) => option === value}
                      getOptionLabel={option => option}
                      noOptionsText={t('NoRows')}
                      inputValue={freeSoloInputValue}
                      onInputChange={(event, newInputValue) => {
                        setFreeSoloInputValue(newInputValue)
                      }}
                      renderOption={(props, item) => (
                        <li {...props} key={item}>
                          <ListItemText>{item}</ListItemText>
                        </li>
                      )}
                      renderInput={params => (
                        <CustomTextField
                          {...params}
                          {...(errors && errors['authors']
                            ? { error: true, helperText: errorTextHandler(errors['authors']) }
                            : null)}
                          onKeyDown={handleKeyDown}
                          label={t('Authors')}
                          inputProps={{ ...params.inputProps, tabIndex: 5 }}
                          helperText={'Täze awtor goşmak üçin adyny ýazyp Enter ýa-da otur (",") basyň.'}
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
                        tabIndex={6}
                        editorState={messageValue}
                        onEditorStateChange={editorState => {
                          setMessageValue(editorState)
                          handleFormChange('description', stateToMarkdown(editorState.getCurrentContent()))
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
                  <Grid item xs={12} sm={12} md={8} lg={8} xl={8}>
                    <Card>
                      <CardHeader title={t('Book') + ' (PDF)'} />
                      <Divider />
                      <CardContent>
                        {fileToSend && (
                          <Card sx={{ marginBottom: 4 }}>
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
                                  alt='file'
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
                                    setFileToSend(undefined)
                                  }}
                                  sx={{ color: 'text.secondary' }}
                                >
                                  <Icon icon='tabler:trash' fontSize={22} />
                                </IconButton>
                              </Box>
                            </Box>
                          </Card>
                        )}
                        <Button
                          color='primary'
                          component='label'
                          variant='contained'
                          htmlFor='upload-pdf'
                          sx={{ mr: 4 }}
                          tabIndex={7}
                          startIcon={<Icon icon='tabler:upload' fontSize={20} />}
                        >
                          <Translations text='SelectFile' />
                          <input
                            hidden
                            id='upload-pdf'
                            type='file'
                            accept='application/pdf'
                            onChange={handleInputBookChange}
                          />
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={12} md={4} lg={4} xl={4}>
                    <Card>
                      <CardHeader title={t('BookCover')} />
                      <Divider />
                      <CardContent>
                        {filePreview && (
                          <Box
                            position={'relative'}
                            display={'flex'}
                            justifyContent={'center'}
                            width={'100%'}
                            height={300}
                            mb={3}
                          >
                            <PreviewImg
                              src={imgSrc}
                              alt='file-preview'
                              sx={{
                                flexGrow: 1,
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                              }}
                            />
                          </Box>
                        )}
                        <Button
                          color='primary'
                          component='label'
                          variant='contained'
                          htmlFor='upload-preview'
                          sx={{ mr: 4 }}
                          tabIndex={8}
                          startIcon={<Icon icon='tabler:upload' fontSize={20} />}
                        >
                          <Translations text='SelectFile' />
                          <input
                            hidden
                            id='upload-preview'
                            value={inputValue}
                            type='file'
                            accept='image/*'
                            onChange={handleInputPreviewImageChange}
                          />
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'right', pt: theme => `${theme.spacing(6.5)} !important` }}>
            <Button variant='contained' sx={{ mr: 4 }} disabled={book_add.loading} type='submit'>
              {book_add.loading ? (
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
              disabled={book_add.loading}
              onClick={() => {
                onSubmit(null, formData, true)
              }}
            >
              {book_add.loading ? (
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

BookCreate.acl = {
  action: 'write',
  subject: 'admin_books'
}

export default BookCreate
