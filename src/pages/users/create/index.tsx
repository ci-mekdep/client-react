// ** React Imports
import { FormEvent, useEffect, useState } from 'react'

// ** MUI Imports
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import { useTranslation } from 'react-i18next'
import DatePickerWrapper from 'src/shared/styles/libs/react-datepicker'
import { Box, Button, ButtonGroup, CircularProgress, Grid } from '@mui/material'
import ProfileDataPanel from 'src/widgets/users/create/ProfileDataPanel'
import PersonalDataPanel from 'src/widgets/users/create/PersonalDataPanel'
import DocumentsDataPanel from 'src/widgets/users/create/DocumentsDataPanel'
import ChildrenDataPanel from 'src/widgets/users/create/ChildrenDataPanel'
import ParentsDataPanel from 'src/widgets/users/create/ParentsDataPanel'
import RoleDataPanel from 'src/widgets/users/create/RoleDataPanel'
import { UserCreateType, UserListType } from 'src/entities/school/UserType'
import Translations from 'src/app/layouts/components/Translations'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/features/store'
import { addUser, addUserFiles } from 'src/features/store/apps/user'
import toast from 'react-hot-toast'
import { errorHandler } from 'src/features/utils/api/errorHandler'
import { fetchSettings } from 'src/features/store/apps/settings'
import { UserChildrenType, UserParentsType, UserRolesType } from 'src/entities/school/UserSchoolType'
import { fetchSchoolsLite } from 'src/features/store/apps/school'
import { fetchRegionsLite } from 'src/features/store/apps/regions'
import { fetchClassroomsLite } from 'src/features/store/apps/classrooms'
import { convertUserReqData } from 'src/features/utils/api/convertUserReqData'
import { ErrorKeyType, ErrorModelType, LiteModelType } from 'src/entities/app/GeneralTypes'

const defaultValues: UserCreateType = {
  first_name: '',
  status: 'active',
  username: '',
  birthday: '',
  gender: null
}

type SchoolClassroomType = {
  [key: string]: LiteModelType[]
}

type SchoolUserType = {
  [key: string]: UserListType[]
}

const UserCreate = () => {
  // ** State
  const [userSchools, setUserSchools] = useState<UserRolesType>({})
  const [userChildren, setUserChildren] = useState<UserChildrenType[]>([])
  const [userParents, setUserParents] = useState<UserParentsType[]>([])
  const [mainSchool, setMainSchool] = useState<LiteModelType | null>(null)
  const [parentOptions, setParentOptions] = useState<SchoolUserType>({})
  const [childrenOptions, setChildrenOptions] = useState<SchoolUserType>({})
  const [classroomOptions, setClassroomOptions] = useState<SchoolClassroomType>({})
  const [avatar, setAvatar] = useState<File | boolean>()
  const [imgSrc, setImgSrc] = useState<string>('')
  const [inputValue, setInputValue] = useState<string>('')
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  const [tabValue, setTabValue] = useState<string>('profile')
  const [formData, setFormData] = useState<UserCreateType>(defaultValues)
  const [errors, setErrors] = useState<ErrorKeyType>({})

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const { settings } = useSelector((state: RootState) => state.settings)
  const { user_add, user_add_files } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    dispatch(fetchSettings({}))
    dispatch(fetchRegionsLite())
    dispatch(fetchSchoolsLite({ limit: 500, offset: 0, is_select: true }))
  }, [dispatch])

  useEffect(() => {
    if (!settings.loading && settings.status === 'success' && settings.data) {
      const documentsArr: any = []
      settings.data.general?.user_document_keys?.map(item => {
        const obj = {
          key: item,
          number: null,
          date: null
        }
        documentsArr.push(obj)
      })
      setFormData(prev => ({ ...prev, documents: documentsArr }))
    }
  }, [settings])

  const handleChangeTab = (newValue: string) => {
    setTabValue(newValue)
  }

  const handleInputImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files as FileList
    setAvatar(selectedFiles?.[0] as File)

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

  const handleInputImageReset = () => {
    setImgSrc('')
    setInputValue('')
    setAvatar(undefined)
  }

  const handleAddUserSchools = (role: string) => {
    setUserSchools(prev => {
      if (prev.hasOwnProperty(role)) {
        const newObj = { ...prev }
        delete newObj[role]

        return newObj
      } else {
        return { ...prev, [role]: [{ role_code: role, school: null }] }
      }
    })
  }

  const handleUpdateUserSchools = (role: string | null, obj: any) => {
    if (obj !== null) {
      const updatedRoleArray = [...userSchools[obj.role]]
      if (obj.is_new) {
        updatedRoleArray.push({
          role_code: obj.role,
          school: obj.school
        })
        setUserSchools(prev => ({
          ...prev,
          [obj.role]: updatedRoleArray
        }))
      } else {
        if (obj.role === 'teacher' || obj.role === 'student') {
          dispatch(fetchClassroomsLite({ limit: 500, offset: 0, school_id: obj.school?.key }))
            .unwrap()
            .then(res => {
              if (res.classrooms !== undefined) {
                updatedRoleArray[obj.index] = {
                  ...updatedRoleArray[obj.index],
                  classroom_options: res.classrooms
                }
              }
            })
            .catch(err => {
              toast.error(errorHandler(err), {
                duration: 2000
              })
            })
            .finally(() => {
              setMainSchool(obj.school)
              updatedRoleArray[obj.index] = {
                ...updatedRoleArray[obj.index],
                school: obj.school,
                classroom: obj.classroom
              }
              setUserSchools(prev => ({
                ...prev,
                [obj.role]: updatedRoleArray
              }))
            })
        } else {
          setMainSchool(obj.school)
          updatedRoleArray[obj.index] = {
            ...updatedRoleArray[obj.index],
            school: obj.school,
            classroom: obj.classroom
          }
          setUserSchools(prev => ({
            ...prev,
            [obj.role]: updatedRoleArray
          }))
        }
      }
    }
  }

  const handleUpdateMainSchool = (newVal: LiteModelType | null) => {
    setMainSchool(newVal)

    const updatedData = { ...userSchools }

    Object.keys(updatedData).forEach(roleType => {
      if (roleType !== 'admin' && roleType !== 'organization' && roleType !== 'parent') {
        updatedData[roleType] = updatedData[roleType].map((role, index) => {
          const updatedRole = { ...role, school: newVal }

          if (roleType === 'teacher' || roleType === 'student') {
            dispatch(fetchClassroomsLite({ limit: 500, offset: 0, school_id: newVal?.key }))
              .unwrap()
              .then(res => {
                if (res.classrooms !== undefined) {
                  updatedRole.classroom_options = res.classrooms
                }
              })
              .catch(err => {
                toast.error(errorHandler(err), { duration: 2000 })
              })
              .finally(() => {
                updatedData[roleType][index] = {
                  ...updatedData[roleType][index],
                  school: newVal,
                  classroom_options: updatedRole.classroom_options
                }
                setUserSchools(updatedData)
              })
          } else {
            return updatedRole
          }

          return updatedRole
        })
      }
    })

    setUserSchools(updatedData)
  }

  const handleUpdateUserSchoolClassroom = (obj: any) => {
    if (obj !== null) {
      const updatedRoleArray = [...userSchools[obj.role]]
      updatedRoleArray[obj.index] = {
        ...updatedRoleArray[obj.index],
        classroom: obj.classroom
      }
      setUserSchools(prev => ({
        ...prev,
        [obj.role]: updatedRoleArray
      }))
    }
  }

  const handleDeleteUserSchools = (obj: any) => {
    if (obj) {
      const updatedRoleArray = userSchools[obj.role].filter((_, idx) => idx !== obj.index)

      setUserSchools(prev => ({
        ...prev,
        [obj.role]: updatedRoleArray
      }))
    }
  }

  const handleAddChildren = (obj: UserChildrenType) => {
    setUserChildren(prev => [...prev, obj])
  }

  const handleDeleteChildren = (index: number) => {
    setUserChildren(prev => prev.filter(item => item.index !== index))
  }

  const handleUpdateChild = (index: number, obj: any) => {
    setUserChildren(prev => prev.map(item => (item.index === index ? { ...item, child: obj } : item)))
  }

  const handleSelectChild = (index: number, selected_child: string | UserListType | null) => {
    setUserChildren(prev =>
      prev.map(item => (item.index === index ? { ...item, selected_child: selected_child } : item))
    )
  }

  const handleUpdateUserChildren = (obj: any) => {
    setUserChildren(prev =>
      prev.map(item =>
        item.index === obj.index
          ? {
              ...item,
              school: obj.school,
              classroom: obj.classroom,
              child_options: obj.child_options
            }
          : item
      )
    )
  }

  const handleAddParent = (obj: UserParentsType) => {
    setUserParents(prev => [...prev, obj])
  }

  const handleDeleteParent = (index: number) => {
    setUserParents(prev => prev.filter(item => item.index !== index))
  }

  const handleUpdateParent = (index: number, obj: any) => {
    setUserParents(prev => prev.map(item => (item.index === index ? { ...item, parent: obj } : item)))
  }

  const handleSelectParent = (index: number, selected_parent: string | UserListType | null) => {
    setUserParents(prev =>
      prev.map(item => (item.index === index ? { ...item, selected_parent: selected_parent } : item))
    )
  }

  const handleUpdateUserParents = (obj: any) => {
    setUserParents(prev =>
      prev.map(item =>
        item.index === obj.index
          ? {
              ...item,
              school: obj.school
            }
          : item
      )
    )
  }

  const handleGetSchoolClassrooms = (school: LiteModelType | null) => {
    if (school) {
      dispatch(fetchClassroomsLite({ limit: 500, offset: 0, school_id: school.key }))
        .unwrap()
        .then(res => {
          if (res.classrooms !== undefined) {
            setClassroomOptions(prev => ({ ...prev, [school.key]: res.classrooms }))
          }
        })
        .catch(err => {
          toast.error(errorHandler(err), {
            duration: 2000
          })
        })
    }
  }

  const handleUpdateParentOptions = (key: string, val: UserListType[], is_delete: boolean) => {
    if (is_delete) {
      if (key) {
        setParentOptions(prev => {
          const newState = { ...prev }
          delete newState[key]

          return newState
        })
      }
    } else {
      setParentOptions(prev => ({
        ...prev,
        [key]: val || []
      }))
    }
  }

  const handleUpdateChildrenOptions = (key: string, val: UserListType[], is_delete: boolean) => {
    if (is_delete) {
      if (key) {
        setChildrenOptions(prev => {
          const newState = { ...prev }
          delete newState[key]

          return newState
        })
      }
    } else {
      setChildrenOptions(prev => ({
        ...prev,
        [key]: val || []
      }))
    }
  }

  const handleInputFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files !== null && Array.from(e.target.files)
    setDocumentFiles([...documentFiles, ...(selectedFiles as File[])])
  }

  const handleDeleteFile = (file: File) => {
    const newFiles = documentFiles.filter(f => f.name !== file.name)
    setDocumentFiles(newFiles)
  }

  const handleFormChange = (field: keyof UserCreateType, value: UserCreateType[keyof UserCreateType]) => {
    setFormData({ ...formData, [field]: value })
  }

  const onSubmit = (
    event: FormEvent<HTMLFormElement> | null,
    avatar: File,
    data: UserCreateType,
    is_list: boolean | string
  ) => {
    event?.preventDefault()

    const dataToSend = convertUserReqData(data, userSchools, userChildren, userParents)

    dispatch(addUser(dataToSend))
      .unwrap()
      .then(res => {
        toast.success(t('ApiSuccessDefault'), {
          duration: 2000
        })
        if ((res?.user?.id && avatar !== undefined) || (res?.user?.id && documentFiles.length > 0)) {
          const formDataToSend = new FormData()
          if (avatar !== undefined) {
            formDataToSend.append('avatar', avatar as File)
          }
          if (documentFiles) {
            documentFiles.map(file => {
              formDataToSend.append('document_files', file)
            })
          }

          dispatch(addUserFiles({ formData: formDataToSend, id: res?.user?.id }))
            .unwrap()
            .then(() => {
              toast.success(t('ApiSuccessDefault'), {
                duration: 2000
              })
            })
            .catch(err => {
              toast.error(errorHandler(err), {
                duration: 2000
              })
            })
            .finally(() => {
              router.push(is_list === true ? '/users' : `/users/view/${res.user.id}`)
            })
        } else {
          router.push(is_list === true ? '/users' : `/users/view/${res.user.id}`)
        }
      })
      .catch(err => {
        let redirectTab = null
        const errorObject: ErrorKeyType = {}
        err.errors?.map((err: ErrorModelType) => {
          if (err.key && err.code) {
            if (err.key.includes('role_code')) {
              errorObject['role'] = err.code
              redirectTab = 'profile'
            } else if (err.key.includes('parents')) {
              errorObject[err.key] = err.code
              redirectTab = 'parent'
            } else if (err.key.includes('children')) {
              errorObject[err.key] = err.code
              redirectTab = 'children'
            } else if (err.key.includes('school_id')) {
              const errKeys = err.key?.split('.')
              const index = errKeys && errKeys[1] ? parseInt(errKeys[1]) : null
              if (dataToSend.schools && index !== null) {
                const errRole = dataToSend.schools[index].role_code
                errorObject[`${errRole}.school_id`] = err.code
              }
              redirectTab = 'role'
            } else if (err.key.includes('classroom')) {
              errorObject['classroom_id'] = err.code
              redirectTab = 'role'
            } else {
              errorObject[err.key] = err.code
              redirectTab = 'profile'
            }
          }
        })
        setErrors(errorObject)
        if (redirectTab) handleChangeTab(redirectTab)

        toast.error(errorHandler(err), {
          duration: 2000
        })
      })
  }

  return (
    <DatePickerWrapper>
      <form
        noValidate
        autoComplete='off'
        onSubmit={e => {
          onSubmit(e, avatar as File, formData, false)
        }}
      >
        <Grid container spacing={0}>
          <TabContext value={tabValue}>
            <Grid item xs={12}>
              <Box display='flex' justifyContent='center'>
                <ButtonGroup variant='tonal' sx={{ justifySelf: 'center' }}>
                  <Button
                    variant={tabValue === 'profile' ? 'contained' : 'tonal'}
                    onClick={() => handleChangeTab('profile')}
                  >
                    <Translations text='ProfileInformation' />
                  </Button>
                  <Button variant={tabValue === 'role' ? 'contained' : 'tonal'} onClick={() => handleChangeTab('role')}>
                    <Translations text='Role' />
                  </Button>
                  <Button
                    variant={tabValue === 'personal' ? 'contained' : 'tonal'}
                    onClick={() => handleChangeTab('personal')}
                  >
                    <Translations text='PersonalInformation' />
                  </Button>
                  <Button
                    variant={tabValue === 'documents' ? 'contained' : 'tonal'}
                    onClick={() => handleChangeTab('documents')}
                  >
                    <Translations text='Documents' />
                  </Button>
                  {userSchools['parent'] && (
                    <Button
                      variant={tabValue === 'children' ? 'contained' : 'tonal'}
                      onClick={() => handleChangeTab('children')}
                    >
                      <Translations text='Children' /> {`(${userChildren.length})`}
                    </Button>
                  )}
                  {userSchools['student'] && (
                    <Button
                      variant={tabValue === 'parent' ? 'contained' : 'tonal'}
                      onClick={() => handleChangeTab('parent')}
                    >
                      <Translations text='Parents' /> {`(${userParents.length})`}
                    </Button>
                  )}
                </ButtonGroup>
              </Box>
              <TabPanel value='profile' sx={{ px: 0 }}>
                <ProfileDataPanel
                  errors={errors}
                  imgSrc={imgSrc}
                  inputValue={inputValue}
                  handleInputImageChange={handleInputImageChange}
                  handleInputImageReset={handleInputImageReset}
                  formData={formData}
                  handleFormChange={handleFormChange}
                  mainSchool={mainSchool}
                  handleUpdateMainSchool={handleUpdateMainSchool}
                  userSchools={userSchools}
                  handleAddUserSchools={handleAddUserSchools}
                />
              </TabPanel>
              <TabPanel value='role' sx={{ px: 0 }}>
                <RoleDataPanel
                  errors={errors}
                  imgSrc={imgSrc}
                  formData={formData}
                  userSchools={userSchools}
                  handleChangeTab={handleChangeTab}
                  handleUpdateUserSchools={handleUpdateUserSchools}
                  handleDeleteUserSchools={handleDeleteUserSchools}
                  handleUpdateUserSchoolClassroom={handleUpdateUserSchoolClassroom}
                />
              </TabPanel>
              <TabPanel value='personal' sx={{ px: 0 }}>
                <PersonalDataPanel
                  errors={errors}
                  imgSrc={imgSrc}
                  formData={formData}
                  handleFormChange={handleFormChange}
                />
              </TabPanel>
              <TabPanel value='documents' sx={{ px: 0 }}>
                <DocumentsDataPanel
                  errors={errors}
                  imgSrc={imgSrc}
                  formData={formData}
                  handleFormChange={handleFormChange}
                  documentFiles={documentFiles}
                  handleDeleteFile={handleDeleteFile}
                  handleInputFilesChange={handleInputFilesChange}
                />
              </TabPanel>
              <TabPanel value='children' sx={{ px: 0 }}>
                <ChildrenDataPanel
                  errors={errors}
                  imgSrc={imgSrc}
                  formData={formData}
                  userChildren={userChildren}
                  childrenOptions={childrenOptions}
                  handleUpdateChildrenOptions={handleUpdateChildrenOptions}
                  classroomOptions={classroomOptions}
                  handleDeleteChildren={handleDeleteChildren}
                  handleAddChildren={handleAddChildren}
                  handleSelectChild={handleSelectChild}
                  handleUpdateChild={handleUpdateChild}
                  handleUpdateUserChildren={handleUpdateUserChildren}
                  handleGetSchoolClassrooms={handleGetSchoolClassrooms}
                />
              </TabPanel>
              <TabPanel value='parent' sx={{ px: 0 }}>
                <ParentsDataPanel
                  errors={errors}
                  imgSrc={imgSrc}
                  formData={formData}
                  userSchools={userSchools}
                  userParents={userParents}
                  parentOptions={parentOptions}
                  handleUpdateParentOptions={handleUpdateParentOptions}
                  handleAddParent={handleAddParent}
                  handleDeleteParent={handleDeleteParent}
                  handleUpdateParent={handleUpdateParent}
                  handleSelectParent={handleSelectParent}
                  handleUpdateUserParents={handleUpdateUserParents}
                />
              </TabPanel>
            </Grid>
          </TabContext>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button
              variant='contained'
              sx={{ mr: 4 }}
              disabled={user_add.loading || user_add_files.loading}
              type='submit'
            >
              {user_add.loading || user_add_files.loading ? (
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
              disabled={user_add.loading || user_add_files.loading}
              onClick={() => {
                onSubmit(null, avatar as File, formData, true)
              }}
            >
              {user_add.loading || user_add_files.loading ? (
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
    </DatePickerWrapper>
  )
}

UserCreate.acl = {
  action: 'write',
  subject: 'admin_users'
}

export default UserCreate
