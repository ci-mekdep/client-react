// ** MUI Imports
import {
  CircularProgress,
  Dialog,
  DialogContent,
  Fade,
  FadeProps,
  Grid,
  IconButton,
  IconButtonProps
} from '@mui/material'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { forwardRef, ReactElement, Ref, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import Translations from 'src/app/layouts/components/Translations'
import { AppDispatch, RootState } from 'src/features/store'
import { fetchSettingsPages } from 'src/features/store/apps/settings/pages'
import Icon from 'src/shared/components/icon'

const LinkStyled = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  textDecoration: 'none',
  color: `${theme.palette.text.secondary} !important`,
  '&:hover': {
    color: `${theme.palette.primary.main} !important`
  }
}))

const Transition = forwardRef(function Transition(
  props: FadeProps & { children?: ReactElement<any, any> },
  ref: Ref<unknown>
) {
  return <Fade ref={ref} {...props} />
})

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

const FooterContent = () => {
  const [rules, setRules] = useState<any>(null)
  const [privacy, setPrivacy] = useState<any>(null)
  const [show, setShow] = useState<boolean>(false)
  const [activeData, setActiveData] = useState<string | null>(null)

  // ** Hooks
  const dispatch = useDispatch<AppDispatch>()
  const { pages } = useSelector((state: RootState) => state.settingsPages)

  useEffect(() => {
    dispatch(fetchSettingsPages())
  }, [dispatch])

  useEffect(() => {
    if (!pages.loading && pages.status === 'success') {
      setRules(pages.data.rules)
      setPrivacy(pages.data.privacy)
    }
  }, [pages])

  return (
    <>
      <Dialog
        fullWidth
        open={show}
        maxWidth='lg'
        scroll='body'
        onClose={() => {
          setShow(false)
        }}
        TransitionComponent={Transition}
        onBackdropClick={() => {
          setShow(false)
        }}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <DialogContent
          sx={{
            px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
            py: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
          }}
        >
          <CustomCloseButton
            onClick={() => {
              setShow(false)
            }}
          >
            <Icon icon='tabler:x' fontSize='1.25rem' />
          </CustomCloseButton>
          {!pages.loading ? (
            <>
              <Typography variant='h4' fontWeight={600} textAlign={'center'} mb={4}>
                {activeData === 'rules' ? rules.title : activeData === 'privacy' ? privacy.title : ''}
              </Typography>
              <Grid container spacing={6}>
                <Grid item xs={12} lg={12}>
                  <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                    {activeData === 'rules' ? `${rules.content}` : activeData === 'privacy' ? `${privacy.content}` : ''}
                  </Typography>
                </Grid>
              </Grid>
            </>
          ) : (
            <CircularProgress
              sx={{
                width: '20px !important',
                height: '20px !important'
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ mr: 2, display: 'flex', color: 'text.secondary' }}>
          {`© ${new Date().getFullYear()}, eMekdep`}
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', '& :not(:last-child)': { mr: 4 } }}>
          <LinkStyled
            onClick={() => {
              setShow(true)
              setActiveData('rules')
            }}
          >
            <Translations text='TermsAndConditions' />
          </LinkStyled>
          <LinkStyled
            onClick={() => {
              setShow(true)
              setActiveData('privacy')
            }}
          >
            <Translations text='PrivacyPolicy' />
          </LinkStyled>
        </Box>
      </Box>
    </>
  )
}

export default FooterContent
