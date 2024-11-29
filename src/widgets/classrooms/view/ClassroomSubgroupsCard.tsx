import { ReactElement, Ref, SyntheticEvent, forwardRef, useContext, useEffect, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Fade,
  FadeProps,
  Grid,
  IconButton,
  IconButtonProps,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  styled
} from '@mui/material'
import Icon from 'src/shared/components/icon'
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'
import { renderSubgroup } from 'src/features/utils/ui/renderSubgroup'
import CustomTextField from 'src/shared/components/mui/text-field'
import { UserListType } from 'src/entities/school/UserType'
import { ClassroomCreateType, SubGroupType } from 'src/entities/classroom/ClassroomType'
import { useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { useTranslation } from 'react-i18next'
import { AbilityContext } from 'src/app/layouts/components/acl/Can'
import { useDispatch } from 'react-redux'
import { getCurrentClassroom, updateClassroomRelations } from 'src/features/store/apps/classrooms'
import toast from 'react-hot-toast'
import { renderUserFullname } from 'src/features/utils/ui/renderUserFullname'
import CustomChip from 'src/shared/components/mui/chip'
import Translations from 'src/app/layouts/components/Translations'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { useDialog } from 'src/app/context/DialogContext'

interface PropsType {
  id: string
  subgroups: any
  selectedStudents: UserListType[] | null
}

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

function not(a: readonly UserListType[], b: readonly UserListType[]) {
  return a.filter(value => b.indexOf(value) === -1)
}

function intersection(a: readonly UserListType[], b: readonly UserListType[]) {
  return a.filter(value => b.indexOf(value) !== -1)
}

function union(a: readonly UserListType[], b: readonly UserListType[]) {
  return [...a, ...not(b, a)]
}

const ClassroomSubgroupsCard = (props: PropsType) => {
  const { selectedStudents, subgroups, id } = props

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [show, setShow] = useState<boolean>(false)
  const [subgroup, setSubgroup] = useState<string | null>(null)
  const [subgroupFormData, setSubgroupFormData] = useState<SubGroupType[]>([])
  const [checked, setChecked] = useState<UserListType[]>([])
  const [left, setLeft] = useState<UserListType[]>([])
  const [right, setRight] = useState<UserListType[]>([])

  const { settings } = useSelector((state: RootState) => state.settings)

  const showDialog = useDialog()
  const { t } = useTranslation()
  const ability = useContext(AbilityContext)
  const dispatch = useDispatch<AppDispatch>()

  const leftChecked = intersection(checked, left)
  const rightChecked = intersection(checked, right)

  const handleToggle = (value: UserListType) => () => {
    const currentIndex = checked.indexOf(value)
    const newChecked = [...checked]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setChecked(newChecked)
  }

  const numberOfChecked = (items: readonly UserListType[]) => intersection(checked, items).length

  const handleToggleAll = (items: readonly UserListType[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items))
    } else {
      setChecked(union(checked, items))
    }
  }

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked))
    setLeft(not(left, leftChecked))
    setChecked(not(checked, leftChecked))
  }

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked))
    setRight(not(right, rightChecked))
    setChecked(not(checked, rightChecked))
  }

  useEffect(() => {
    if (selectedStudents !== null) {
      setLeft(selectedStudents.slice(0, Math.ceil(selectedStudents.length / 2)))
      setRight(selectedStudents.slice(Math.ceil(selectedStudents.length / 2)))
    }
  }, [selectedStudents])


  const handleShowDialog = async (data: SubGroupType[]) => {
    const confirmed = await showDialog()
    if (confirmed) {
      handleUpdateSubgroup(data)
    }
  }

  const handleUpdateSubgroup = (dataT?: SubGroupType[]) => {
    let newSubgroups: SubGroupType[] = []
    if (!dataT) {
      newSubgroups = [
        {
          type: subgroupFormData[0]?.type,
          type_key: 1,
          student_ids: left.map(el => {
            return el.id
          })
        },
        {
          type: subgroupFormData[1]?.type,
          type_key: 2,
          student_ids: right.map(el => {
            return el?.id
          })
        }
      ]
    } else {
      newSubgroups = dataT
    }
    const dataToSend: ClassroomCreateType = { sub_groups: newSubgroups }

    setShow(false)
    setIsSubmitting(true)
    dispatch(updateClassroomRelations({ data: dataToSend, id: id }))
      .unwrap()
      .then(() => {
        setIsSubmitting(false)
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        setSubgroupFormData([])
        setLeft([])
        setRight([])
        setSubgroup(null)
        dispatch(getCurrentClassroom(id))
      })
      .catch(err => {
        toast.error(errorHandler(err), {
          duration: 2000
        })
        setIsSubmitting(false)
      })
  }

  const subGroupColumns = [
    {
      id: 1,
      label: t('Subgroup')
    },
    {
      id: 2,
      label: t('Subgroup1')
    },
    {
      id: 3,
      label: t('Subgroup2')
    },
    {
      id: 4,
      label: t('Actions')
    }
  ]

  const customList = (title: React.ReactNode, items: UserListType[]) => (
    <Card sx={{ width: '100%' }}>
      <CardHeader
        sx={{ px: 2, py: 1 }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items?.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items?.length && numberOfChecked(items) !== 0}
            disabled={items?.length === 0}
            inputProps={{
              'aria-label': 'ählisi saýlanan'
            }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items?.length} ${t('Selected')}`}
      />
      <Divider />
      <List
        sx={{
          width: 350,
          height: 'auto',
          bgcolor: 'background.paper',
          overflow: 'auto'
        }}
        disablePadding
        dense
        component='div'
        role='list'
      >
        {items.map((value: UserListType) => {
          const labelId = `transfer-list-all-item-${value}-label`

          return (
            <ListItem key={value?.id} role='listitem' button onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  disableRipple
                  inputProps={{
                    'aria-labelledby': labelId
                  }}
                  sx={{ padding: 1 }}
                />
              </ListItemIcon>
              <ListItemText
                id={labelId}
                primary={`${renderUserFullname(value?.last_name, value?.first_name, value?.middle_name)}`}
              />
              {value?.is_new === true && (
                <CustomChip rounded label={t('New')} skin='light' size='small' color='primary' />
              )}
            </ListItem>
          )
        })}
      </List>
    </Card>
  )

  return (
    <>
      <Dialog
        fullWidth
        open={show}
        maxWidth='md'
        scroll='body'
        onClose={() => setShow(false)}
        TransitionComponent={Transition}
        onBackdropClick={() => setShow(false)}
        sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
      >
        <form
          autoComplete='off'
          onSubmit={e => {
            e.preventDefault()
            handleUpdateSubgroup()
          }}
        >
          <DialogContent
            sx={{
              pb: theme => `${theme.spacing(8)} !important`,
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pt: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <CustomCloseButton onClick={() => setShow(false)}>
              <Icon icon='tabler:x' fontSize='1.25rem' />
            </CustomCloseButton>
            <Typography variant='h3' textAlign={'center'} fontWeight={600} sx={{ mb: 8 }}>
              <Translations text='AddSubgroup' />
            </Typography>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={12}>
                <CustomAutocomplete
                  id='name'
                  freeSolo
                  autoSelect
                  value={subgroup}
                  options={settings.data.subject?.classroom_group_keys}
                  loadingText={t('ApiLoading')}
                  loading={settings.loading}
                  onChange={(event: SyntheticEvent, newValue: string | null) => {
                    setSubgroup(newValue)
                    const newSubgroups = [
                      {
                        type: newValue as string,
                        type_key: 1,
                        student_ids: subgroupFormData[0]?.student_ids
                      },
                      {
                        type: newValue as string,
                        type_key: 2,
                        student_ids: subgroupFormData[1]?.student_ids
                      }
                    ]
                    setSubgroupFormData(newSubgroups)
                  }}
                  noOptionsText={t('NoRows')}
                  renderOption={(props, item) => (
                    <li {...props} key={item}>
                      <ListItemText>{renderSubgroup(item)}</ListItemText>
                    </li>
                  )}
                  getOptionLabel={option => renderSubgroup(option) as string}
                  renderInput={params => <CustomTextField {...params} label={t('Name')} />}
                />
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2} justifyContent={'space-between'} alignItems={'baseline'}>
                  <Grid item>{customList(t('Subgroup1'), left)}</Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='center'>
                      <Button
                        sx={{ my: 0.5 }}
                        variant='outlined'
                        size='small'
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label='saýlananlary saga'
                      >
                        &gt;
                      </Button>
                      <Button
                        sx={{ my: 0.5 }}
                        variant='outlined'
                        size='small'
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label='saýlananlary çepe'
                      >
                        &lt;
                      </Button>
                    </Grid>
                  </Grid>
                  <Grid item>{customList(t('Subgroup2'), right)}</Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions
            sx={{
              justifyContent: 'center',
              px: theme => [`${theme.spacing(5)} !important`, `${theme.spacing(15)} !important`],
              pb: theme => [`${theme.spacing(8)} !important`, `${theme.spacing(12.5)} !important`]
            }}
          >
            <Button variant='contained' type='submit' sx={{ mr: 4 }} disabled={isSubmitting}>
              {isSubmitting ? (
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
              variant='tonal'
              color='secondary'
              onClick={() => {
                setShow(false)
              }}
            >
              <Translations text='GoBack' />
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={t('Subgroups')}
            action={
              ability.can('write', 'admin_classrooms') ? (
                <Button
                  variant='tonal'
                  onClick={() => setShow(true)}
                  startIcon={<Icon icon='tabler:plus' fontSize={20} />}
                >
                  <Translations text='AddSubgroup' />
                </Button>
              ) : null
            }
          />
          <Divider />
          <CardContent sx={{ p: '0!important' }}>
            <TableContainer component={Paper}>
              <Table stickyHeader aria-label='sticky table'>
                <TableHead>
                  <TableRow>
                    {subGroupColumns.map(column => (
                      <TableCell key={column.id} align={'left'}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subgroups && subgroups.length !== 0 ? (
                    subgroups.map((row: any, index: number) => {
                      return (
                        <TableRow
                          key={index}
                          hover
                          sx={{
                            '&:last-of-type td, &:last-of-type th': {
                              border: 0
                            }
                          }}
                        >
                          <TableCell>
                            <Typography>{renderSubgroup(row.type)}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: '0!important' }}>
                            <Typography>
                              <List>
                                {row.first_student_ids?.map((student: UserListType, index: number) => (
                                  <ListItem disablePadding key={index}>
                                    <ListItemText
                                      primary={
                                        <Tooltip
                                          arrow
                                          title={student?.is_new ? t('StudentIsNotAddedText') : ''}
                                          placement='left'
                                        >
                                          <Typography
                                            noWrap
                                            variant='body1'
                                            sx={{
                                              fontWeight: student?.is_new === true ? 600 : 400,
                                              color: student?.is_new === true ? 'error.main' : 'text.main'
                                            }}
                                          >
                                            {renderUserFullname(
                                              student?.last_name,
                                              student?.first_name,
                                              student?.middle_name
                                            )}{' '}
                                            {student?.is_new === true && t('NotAdded')}
                                            {row.second_student_ids.length - 1 !== index ? ', ' : ''}
                                          </Typography>
                                        </Tooltip>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: '0!important' }}>
                            <Typography>
                              <List>
                                {row.second_student_ids?.map((student: UserListType, index: number) => (
                                  <ListItem disablePadding key={index}>
                                    <ListItemText
                                      primary={
                                        <Tooltip
                                          arrow
                                          title={student?.is_new ? t('StudentIsNotAddedText') : ''}
                                          placement='left'
                                        >
                                          <Typography
                                            noWrap
                                            variant='body1'
                                            sx={{
                                              fontWeight: student?.is_new === true ? 600 : 400,
                                              color: student?.is_new === true ? 'error.main' : 'text.main'
                                            }}
                                          >
                                            {renderUserFullname(
                                              student?.last_name,
                                              student?.first_name,
                                              student?.middle_name
                                            )}{' '}
                                            {student?.is_new === true && t('NotAdded')}
                                            {row.second_student_ids.length - 1 !== index ? ', ' : ''}
                                          </Typography>
                                        </Tooltip>
                                      }
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: '0!important' }}>
                            <Box
                              sx={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-around'
                              }}
                            >
                              <Button
                                size='small'
                                variant='tonal'
                                color='warning'
                                onClick={() => {
                                  setSubgroup(row.type)
                                  setLeft(row.first_student_ids)
                                  setRight(row.second_student_ids)
                                  setSubgroupFormData([
                                    {
                                      type: row.type,
                                      type_key: 1,
                                      student_ids: row.first_student_ids.map((student: UserListType) => student?.id)
                                    },
                                    {
                                      type: row.type,
                                      type_key: 2,
                                      student_ids: row.second_student_ids.map((student: UserListType) => student?.id)
                                    }
                                  ])
                                  setShow(true)
                                }}
                                startIcon={<Icon icon='tabler:edit' fontSize={20} />}
                              >
                                <Translations text='Edit' />
                              </Button>
                              <Button
                                size='small'
                                variant='tonal'
                                color='error'
                                onClick={() => {
                                  handleShowDialog([
                                    {
                                      type: row.type,
                                      type_key: 1
                                    },
                                    {
                                      type: row.type,
                                      type_key: 2
                                    }
                                  ])
                                }}
                                startIcon={<Icon icon='tabler:trash' fontSize={20} />}
                              >
                                <Translations text='Delete' />
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow
                      sx={{
                        '&:last-of-type td, &:last-of-type th': {
                          border: 0
                        }
                      }}
                    >
                      <TableCell colSpan={4}>
                        <Typography textAlign='center' py={4}>
                          <Translations text='NoRows' />
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </>
  )
}

export default ClassroomSubgroupsCard
