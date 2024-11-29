// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Link from 'next/link'
import subjectColors from 'src/app/configs/subjectColors'

// ** Type Imports
import { UserListType } from 'src/entities/school/UserType'

// ** Utils Imports
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'

// ** Custom Components Imports
import Icon from 'src/shared/components/icon'
import { useSettings } from 'src/shared/hooks/useSettings'

interface SubjectCardData {
  name?: string
  data: any
  teacher?: UserListType
  child_teacher?: UserListType
  second_teacher?: UserListType
  week_hours: number
}

const SubjectCard = (props: SubjectCardData) => {
  const { settings } = useSettings()

  const isNull = props.week_hours <= 0
  const subjectColor = subjectColors.find(subjectColor => subjectColor.name === props.name)
  const bgColor = settings.mode === 'light' ? subjectColor?.color : subjectColor?.dark_color

  return (
    <div
      className='fc-event'
      data-id={props.data}
      data-name={props.name}
      data-hours={props.week_hours}
      data-bg={bgColor}
      data-child-teacher={renderUserFullname(props.child_teacher?.last_name, props.child_teacher?.first_name, null)}
      data-second-teacher={renderUserFullname(props.second_teacher?.last_name, props.second_teacher?.first_name, null)}
      data-teacher={renderUserFullname(props.teacher?.last_name, props.teacher?.first_name, null)}
    >
      <Card
        sx={{
          paddingBottom: '0!important',
          marginBottom: 2,
          backgroundColor: bgColor,
          opacity: isNull ? '0.3' : '1',
          border: 'none',
          cursor: 'move'
        }}
      >
        <CardContent
          sx={{
            p: theme => `${theme.spacing(2.5)} !important`,
            gap: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <Icon icon='tabler:grip-horizontal' fontSize='1.5rem' />
            <Box
              sx={{
                ml: 3,
                mb: 1,
                columnGap: 1.5,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'left',
                flexDirection: 'column'
              }}
            >
              <Typography variant='h6'>{props.name}</Typography>
              <Box sx={{ display: 'flex' }}>
                <Typography
                  component={Link}
                  href={`/users/view/${props.teacher?.id}`}
                  variant='caption'
                  marginRight={1}
                  sx={{ textDecoration: 'none' }}
                >
                  {renderUserFullname(props.teacher?.last_name, props.teacher?.first_name, null)}
                </Typography>
                {props.second_teacher && (
                  <Typography
                    component={Link}
                    href={`/users/view/${props.second_teacher?.id}`}
                    variant='caption'
                    marginRight={1}
                    sx={{ textDecoration: 'none' }}
                  >
                    • {renderUserFullname(props.second_teacher?.last_name, props.second_teacher?.first_name, null)}
                  </Typography>
                )}
                {props.child_teacher && (
                  <Typography
                    component={Link}
                    href={`/users/view/${props.child_teacher?.id}`}
                    variant='caption'
                    marginRight={1}
                    sx={{ textDecoration: 'none' }}
                  >
                    • {renderUserFullname(props.child_teacher?.last_name, props.child_teacher?.first_name, null)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Chip label={props.week_hours} size='small' />
        </CardContent>
      </Card>
    </div>
  )
}

export default SubjectCard
