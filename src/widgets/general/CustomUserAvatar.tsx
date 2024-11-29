import { Box } from '@mui/material'

type PropsType = {
  avatar: string
  width?: number
  height: number
  borderRadius?: number
  marginBottom?: number
}

const CustomUserAvatar = (props: PropsType) => {
  const avatar = props.avatar
  const width = props.width
  const height = props.height
  const borderRadius = props.borderRadius
  const marginBottom = props.marginBottom

  return (
    <Box
      sx={{
        height: height,
        ...(width ? { width: width } : null),
        ...(marginBottom ? { marginBottom: marginBottom } : null),
        ...(borderRadius ? { borderRadius: borderRadius } : null),
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${encodeURI(avatar)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(10px)',
          zIndex: 1
        }
      }}
    >
      <Box
        component='img'
        src={avatar}
        alt='image'
        sx={{
          position: 'relative',
          maxHeight: '100%',
          maxWidth: '100%',
          zIndex: 2,
          objectFit: 'contain'
        }}
      />
    </Box>
  )
}

export default CustomUserAvatar
