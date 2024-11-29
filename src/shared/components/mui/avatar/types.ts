// ** MUI Imports
import { AvatarProps } from '@mui/material/Avatar'

// ** Types
import { ThemeColor } from 'src/shared/layouts/types'

export type CustomAvatarProps = AvatarProps & {
  color?: ThemeColor
  skin?: 'filled' | 'light' | 'light-static'
}
