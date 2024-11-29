// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { UserCreateType, UserType } from 'src/entities/school/UserType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  sort?: string
  search?: string
  role?: string
  roles?: string[]
  status?: string
  no_classroom?: string
  school_id?: string
  classroom_id?: string
  is_active?: string
  parents_count?: string | null
  children_count?: string | null
  lesson_hours?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource | null = null

// ** Fetch Users
export const fetchUsers = createAsyncThunk('appUsers/fetchUsers', async (params: DataParams, { rejectWithValue }) => {
  if (params.is_list && cancelSource) {
    cancelSource.cancel('Operation canceled due to new request.')
  }

  if (params.is_list) cancelSource = axios.CancelToken.source()

  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users', {
      params,
      cancelToken: params.is_list && cancelSource ? cancelSource.token : undefined
    })

    return response.data
  } catch (error: any) {
    if (axios.isCancel(error)) {
      return rejectWithValue({ message: 'Request canceled', keepLoading: true })
    } else if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Fetch Users Lite
export const fetchUsersLite = createAsyncThunk(
  'appUsers/fetchUsersLite',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/values', {
        params
      })

      return response.data
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data)
      } else {
        return rejectWithValue(createApiErrorObj(error.message))
      }
    }
  }
)

// ** Get Current User
export const getCurrentUser = createAsyncThunk('appUsers/selectUser', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit User
export const updateUser = createAsyncThunk(
  'appUsers/updateUser',
  async ({ data, id }: { data: UserCreateType; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/${id}`, data)

      return response.data
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data)
      } else {
        return rejectWithValue(createApiErrorObj(error.message))
      }
    }
  }
)

// ** Update Premium User
export const updatePremiumUser = createAsyncThunk(
  'appUsers/updatePremiumUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/${id}/promote`, {
        id: id
      })

      return response.data
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data)
      } else {
        return rejectWithValue(createApiErrorObj(error.message))
      }
    }
  }
)

// ** Add User
export const addUser = createAsyncThunk('appUsers/addUser', async (data: UserCreateType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users`, data)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Add User Files
export const addUserFiles = createAsyncThunk(
  'appUsers/addUserFiles',
  async ({ formData, id }: { formData: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      return response.data
    } catch (error: any) {
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data)
      } else {
        return rejectWithValue(createApiErrorObj(error.message))
      }
    }
  }
)

// ** Add Multiple Users
export const addMultipleUsers = createAsyncThunk('appUser/addMultipleUsers', async (data: any, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/batch', data)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Delete User
export const deleteUser = createAsyncThunk('appUsers/deleteUser', async (user_roles: any[], { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users', {
      params: {
        user_roles
      },
      paramsSerializer: {
        indexes: null
      }
    })

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

export const appUsersSlice = createSlice({
  name: 'appUsers',
  initialState: {
    users_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    users_lite_list: {
      data: [] as LiteModelType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_detail: {
      data: {} as UserType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_update_premium: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_add_files: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_add_multiple: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    user_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users_list.status = 'success'
        state.users_list.data = action.payload.users
        state.users_list.total = action.payload.total
        state.users_list.error = null
        state.users_list.loading = false
      })
      .addCase(fetchUsers.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.users_list.status = 'failed'
          state.users_list.error = action.payload as ErrorType
          state.users_list.loading = false
        }
      })
      .addCase(fetchUsers.pending, state => {
        state.users_list.status = 'loading'
        state.users_list.error = null
        state.users_list.loading = true
      })
      .addCase(fetchUsersLite.fulfilled, (state, action) => {
        state.users_lite_list.status = 'success'
        state.users_lite_list.data = action.payload.users
        state.users_lite_list.total = action.payload.total
        state.users_lite_list.error = null
        state.users_lite_list.loading = false
      })
      .addCase(fetchUsersLite.rejected, (state, action) => {
        state.users_lite_list.status = 'failed'
        state.users_lite_list.error = action.payload as ErrorType
        state.users_lite_list.loading = false
      })
      .addCase(fetchUsersLite.pending, state => {
        state.users_lite_list.status = 'loading'
        state.users_lite_list.error = null
        state.users_lite_list.loading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user_detail.status = 'success'
        state.user_detail.data = action.payload.user
        state.user_detail.error = null
        state.user_detail.loading = false
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user_detail.status = 'failed'
        state.user_detail.error = action.payload as ErrorType
        state.user_detail.loading = false
      })
      .addCase(getCurrentUser.pending, state => {
        state.user_detail.status = 'loading'
        state.user_detail.error = null
        state.user_detail.loading = true
      })
      .addCase(updateUser.fulfilled, state => {
        state.user_update.status = 'success'
        state.user_update.error = null
        state.user_update.loading = false
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.user_update.status = 'failed'
        state.user_update.error = action.payload as ErrorType
        state.user_update.loading = false
      })
      .addCase(updateUser.pending, state => {
        state.user_update.status = 'loading'
        state.user_update.error = null
        state.user_update.loading = true
      })
      .addCase(updatePremiumUser.fulfilled, state => {
        state.user_update_premium.status = 'success'
        state.user_update_premium.error = null
        state.user_update_premium.loading = false
      })
      .addCase(updatePremiumUser.rejected, (state, action) => {
        state.user_update_premium.status = 'failed'
        state.user_update_premium.error = action.payload as ErrorType
        state.user_update_premium.loading = false
      })
      .addCase(updatePremiumUser.pending, state => {
        state.user_update_premium.status = 'loading'
        state.user_update_premium.error = null
        state.user_update_premium.loading = true
      })
      .addCase(addUser.fulfilled, state => {
        state.user_add.status = 'success'
        state.user_add.error = null
        state.user_add.loading = false
      })
      .addCase(addUser.rejected, (state, action) => {
        state.user_add.status = 'failed'
        state.user_add.error = action.payload as ErrorType
        state.user_add.loading = false
      })
      .addCase(addUser.pending, state => {
        state.user_add.status = 'loading'
        state.user_add.error = null
        state.user_add.loading = true
      })
      .addCase(addUserFiles.fulfilled, state => {
        state.user_add_files.status = 'success'
        state.user_add_files.error = null
        state.user_add_files.loading = false
      })
      .addCase(addUserFiles.rejected, (state, action) => {
        state.user_add_files.status = 'failed'
        state.user_add_files.error = action.payload as ErrorType
        state.user_add_files.loading = false
      })
      .addCase(addUserFiles.pending, state => {
        state.user_add_files.status = 'loading'
        state.user_add_files.error = null
        state.user_add_files.loading = true
      })
      .addCase(addMultipleUsers.fulfilled, state => {
        state.user_add_multiple.status = 'success'
        state.user_add_multiple.error = null
        state.user_add_multiple.loading = false
      })
      .addCase(addMultipleUsers.rejected, (state, action) => {
        state.user_add_multiple.status = 'failed'
        state.user_add_multiple.error = action.payload as ErrorType
        state.user_add_multiple.loading = false
      })
      .addCase(addMultipleUsers.pending, state => {
        state.user_add_multiple.status = 'loading'
        state.user_add_multiple.error = null
        state.user_add_multiple.loading = true
      })
      .addCase(deleteUser.fulfilled, state => {
        state.user_delete.status = 'success'
        state.user_delete.error = null
        state.user_delete.loading = false
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.user_delete.status = 'failed'
        state.user_delete.error = action.payload as ErrorType
        state.user_delete.loading = false
      })
      .addCase(deleteUser.pending, state => {
        state.user_delete.status = 'loading'
        state.user_delete.error = null
        state.user_delete.loading = true
      })
  }
})

export default appUsersSlice.reducer
