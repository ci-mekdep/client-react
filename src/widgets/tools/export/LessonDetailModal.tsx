import { Box, Dialog, DialogContent, Grid, IconButton, IconButtonProps, styled, Typography } from '@mui/material'
import Link from 'next/link'
import Translations from 'src/app/layouts/components/Translations'
import { LessonType } from 'src/entities/journal/LessonType'
import { renderLessonType } from 'src/features/utils/ui/renderLessonType'
import Icon from 'src/shared/components/icon'

type PropsType = {
  isOpen: boolean
  detailData: LessonType
  handleClose: () => void
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

const LessonDetailModal = (props: PropsType) => {
  const { isOpen, detailData, handleClose } = props

  const handleDownloadFile = (file: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = ''
    link.target = '_blank'
    link.click()
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
            <Translations text='LessonInformation' />
          </Typography>
          {detailData !== null && (
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Classroom' />
                </Typography>
                <Typography>{detailData.subject?.classroom?.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Subject' />
                </Typography>
                <Typography>{detailData.subject?.name}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Date' />
                </Typography>
                <Typography>{detailData.date}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Type' />
                </Typography>
                <Typography>{renderLessonType(detailData.type_title)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Lesson' />
                </Typography>
                <Typography>{detailData.title}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Book' />
                </Typography>
                {detailData.book && (
                  <Typography
                    component={Link}
                    href={`/books/view/${detailData.book?.id}`}
                    color={'primary.main'}
                    sx={{ fontWeight: '600', textDecoration: 'none' }}
                  >
                    {detailData.book.title} {detailData.book_page ? `(${detailData.book_page})` : ''}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Homework' />
                </Typography>
                <Typography>{detailData.assignment?.title}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Files' />
                </Typography>
                <Box display='flex' flexDirection='column'>
                  {detailData.assignment?.files?.map((file, index) => (
                    <Typography
                      key={index}
                      onClick={() => handleDownloadFile(file)}
                      sx={{ color: 'primary.main', fontWeight: '600', textDecoration: 'none' }}
                    >
                      {file}
                    </Typography>
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='ProLesson' />
                </Typography>
                <Typography>{detailData.lesson_pro?.title}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ color: 'text.secondary' }}>
                  <Translations text='Files' />
                </Typography>
                <Box display='flex' flexDirection='column'>
                  {detailData.lesson_pro?.files?.map((file, index) => (
                    <Typography
                      key={index}
                      onClick={() => handleDownloadFile(file)}
                      sx={{ color: 'primary.main', fontWeight: '600', textDecoration: 'none' }}
                    >
                      {file}
                    </Typography>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default LessonDetailModal
