// ** React Imports
import { useEffect, useContext } from 'react'

// ** Next Import
import { useRouter } from 'next/router'
import Link from 'next/link'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

// ** Custom Components Import
import Icon from 'src/shared/components/icon'

// ** Store
import { useDispatch } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import Translations from 'src/app/layouts/components/Translations'
import { Box, CircularProgress, styled } from '@mui/material'
import { useSelector } from 'react-redux'
import Error from 'src/widgets/general/Error'
import Markdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'
import { BookType } from 'src/entities/app/BooksType'
import { deleteBook, getCurrentBook } from 'src/features/store/apps/books'
import CustomChip from 'src/shared/components/mui/chip'

const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.down('xl')]: {
    width: '100%',
    height: 'auto'
  }
}))

const BookView = () => {
  const router = useRouter()
  const id = router.query.bookId
  const { book_detail } = useSelector((state: RootState) => state.books)
  const data: BookType = { ...(book_detail.data as BookType) }

  const { t } = useTranslation()
  const showDialog = useDialog()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (id !== undefined) {
      dispatch(getCurrentBook(id as string))
    }
  }, [dispatch, id])

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
  }

  const handleShowDialog = async (id: string) => {
    const confirmed = await showDialog()
    if (confirmed && id) {
      handleDeleteBook(id)
    }
  }

  const handleDeleteBook = async (id: string) => {
    const toastId = toast.loading(t('ApiLoading'))
    await dispatch(deleteBook([id]))
      .unwrap()
      .then(() => {
        toast.dismiss(toastId)
        toast.success(t('ApiSuccessDefault'), { duration: 2000 })
        router.push('/settings/books')
      })
      .catch(err => {
        toast.dismiss(toastId)
        toast.error(errorHandler(err), { duration: 2000 })
      })
  }

  if (book_detail.error) {
    return <Error error={book_detail.error} />
  }

  if (!book_detail.loading && id) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={t('BookInformation') as string}
              action={
                ability.can('write', 'admin_books') ? (
                  <Box display='flex' gap='15px'>
                    <Button
                      variant='tonal'
                      component={Link}
                      href={`/books/edit/${data.id}`}
                      startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                    >
                      <Translations text='Edit' />
                    </Button>
                    <Button
                      color='error'
                      variant='tonal'
                      onClick={() => {
                        handleShowDialog(id as string)
                      }}
                      startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                    >
                      <Translations text='Delete' />
                    </Button>
                  </Box>
                ) : null
              }
            />
            <Divider />
            <CardContent>
              <Grid container spacing={5}>
                <Grid item xs={4}>
                  <Box display='flex' flexDirection='column' justifyContent='center' alignItems='start'>
                    <Box display='flex' position='relative' justifyContent='center' width='100%' height={400} mb={3}>
                      <Img
                        alt='book-preview'
                        src={data.file_preview !== null ? data.file_preview : '/images/default_cover.png'}
                        sx={{
                          flexGrow: 1,
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                        onError={(e: any) => (e.target.src = '/images/default_cover.png')}
                      />
                    </Box>
                    <Button
                      variant='tonal'
                      color='success'
                      sx={{ mr: 4, mb: 2 }}
                      onClick={() => {
                        handleDownloadFile(data.file)
                      }}
                      startIcon={<Icon icon='tabler:download' fontSize={20} />}
                    >
                      <Translations text='DownloadFile' />{' '}
                      {data.file_size && `(${(data.file_size / 1024).toFixed(2)} MB)`}
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={8}>
                  <Grid container spacing={5}>
                    <Grid item xs={12} sm={12}>
                      <Box display='flex' justifyContent='space-between'>
                        <Box>
                          <Typography sx={{ color: 'text.secondary' }}>
                            <Translations text='Name' />
                          </Typography>
                          <Typography>{data.title}</Typography>
                        </Box>
                        <CustomChip
                          rounded
                          label={data.is_downloadable ? t('IsDownloadable') : t('IsNotDownloadable')}
                          skin='light'
                          color={data.is_downloadable ? 'success' : 'error'}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='PageCount' />
                      </Typography>
                      <Typography>{data.pages}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='Year' />
                      </Typography>
                      <Typography>{data.year}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='Categories' />
                      </Typography>
                      <Box display='flex' flexDirection='column'>
                        {data.categories &&
                          data.categories.map((category, index) => <Typography key={index}>{category}</Typography>)}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} lg={6}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='Authors' />
                      </Typography>
                      <Box display='flex' flexDirection='column'>
                        {data.authors &&
                          data.authors.map((author, index) => <Typography key={index}>{author}</Typography>)}
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={12} md={12} lg={12}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        <Translations text='Description' />
                      </Typography>
                      <Markdown>{data.description}</Markdown>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  } else {
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
}

BookView.acl = {
  action: 'read',
  subject: 'admin_books'
}

export default BookView
