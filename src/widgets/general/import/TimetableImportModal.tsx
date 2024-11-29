import { Dialog, DialogContent, IconButton, IconButtonProps, Typography, styled } from '@mui/material'
import Translations from 'src/app/layouts/components/Translations'
import Icon from 'src/shared/components/icon'

type PropsType = {
  dialogOpen: boolean
  handleClose: () => void
}

const Img = styled('img')(() => ({}))

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

const TimetableImportModal = (props: PropsType) => {
  const { dialogOpen, handleClose } = props

  return (
    <Dialog
      fullWidth
      maxWidth='lg'
      open={dialogOpen}
      onClose={handleClose}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogContent
        sx={{
          px: 0,
          pb: 0,
          pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
        }}
      >
        <CustomCloseButton onClick={() => handleClose()}>
          <Icon icon='tabler:x' fontSize='1.25rem' />
        </CustomCloseButton>
        <Typography variant='h4' textAlign='center' fontWeight={600} marginBottom={5}>
          <Translations text='TimetableImportModalTitle' />
        </Typography>
        <Typography variant='body1' textAlign='justify'>
          Käbir mekdeplerde "aSc Timetable" atly programma arkaly awtomat usulda raspisaniýe düzedilýär.
          <br />
          Indi eMekdep'e ady agzalan programmanyň netijesini, ýagny ders rejeleri geçirmek aňsat (importalamak). "aSc
          Timetable" programma işlemegi üçin ders ýükleriň sanawy gerek.
          <br />
          1) Onuň üçin eMekdepde "Ders ýükleri eksport" düwme arkaly ýükläp almaly
          <br />
          2) "aScTimetable" programmada ýokarda çep tarapdaky menýuda "Файл-File" {'>'} "Импорт-Import" {'>'} peýda
          bolan pensjirede import etmek üçin görnüş saýlamaly "Уроки-Lessons". Soňra emekdepden alynan ders ýükleriň
          sanawyny kopýalap (CTRL+C) şu penjirede "Обновить из буфера обмена-Clipboard" düwma basmaly we "Импорт-Import"
          düwmä basmak arkaly importlamaly. Netijede "aScTimetable" programmaňyz öz işine taýýar bolar!
          <br />
          3) Programmada bilşiňiz ýaly "Главная - Main" {'>'} "Генерировать - Generate" basmak arkaly ders reje düzülýär
          <br />
          4) "aScTimetable" programmada ýokarda çep tarapdaky menýuda "Файл-File" {'>'} "Экспорт - Eksport" {'>'} "aSc
          Timetables XML" düwma basmak bilen taýýar ders rejeleri ýükläp alýarys
          <br />
          5) Iň soňky ädim, eMekdep'de degişli synpyň ders rejesini açyp "Import" sahypasyna geçmeli, we her bir synp
          üçin ýüklenen XML faýly saýlap importlamaly. Netijede üýtgedilen ders rejäni "Tassykla" basmaly.
          <br />
        </Typography>
        <Img width={'80%'} alt='device-logo' src={'/images/tutorials/timetable1.png'} />
        <Img width={'70%'} alt='device-logo' src={'/images/tutorials/timetable2.png'} />
      </DialogContent>
    </Dialog>
  )
}

export default TimetableImportModal
