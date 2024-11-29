// ** React Import
import { useEffect } from 'react'

// ** Icon Imports
import MuiAvatar from '@mui/material/Avatar'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

// ** Custom Components Imports
import OptionsMenu from 'src/shared/components/option-menu'

const LanguageDropdown = () => {
  // ** Hook
  const { i18n } = useTranslation()

  const handleLangItemClick = (lang: 'tm' | 'en' | 'ru') => {
    i18n.changeLanguage(lang)
  }

  // ** Change html `lang` attribute when changing locale
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language)
  }, [i18n.language])

  return (
    <OptionsMenu
      iconButtonProps={{ color: 'inherit' }}
      icon={<MuiAvatar src={`/images/lang/${i18n.language}.png`} alt={i18n.language} sx={{ width: 26, height: 26 }} />}
      menuProps={{ sx: { '& .MuiMenu-paper': { mt: 4.25, minWidth: 130 } } }}
      options={[
        {
          text: 'Türkmen dili',
          icon: <MuiAvatar src={'/images/lang/tm.png'} alt={'tm'} sx={{ width: 26, height: 26, marginRight: 2 }} />,
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'tm',
            onClick: () => {
              handleLangItemClick('tm')
            }
          }
        },
        {
          text: 'Iňlis dili',
          icon: <MuiAvatar src={'/images/lang/en.png'} alt={'en'} sx={{ width: 26, height: 26, marginRight: 2 }} />,
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'en',
            onClick: () => {
              handleLangItemClick('en')
            }
          }
        },
        {
          text: 'Rus dili',
          icon: <MuiAvatar src={'/images/lang/ru.png'} alt={'ru'} sx={{ width: 26, height: 26, marginRight: 2 }} />,
          menuItemProps: {
            sx: { py: 2 },
            selected: i18n.language === 'ru',
            onClick: () => {
              handleLangItemClick('ru')
            }
          }
        }
      ]}
    />
  )
}

export default LanguageDropdown
