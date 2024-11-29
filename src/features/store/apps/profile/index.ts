// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { SecurityType } from 'src/entities/app/ProfileTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Fetch Profile
export const fetchProfile = createAsyncThunk('appProfile/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/me')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit Profile
export const updateProfile = createAsyncThunk(
  'appProfile/updateProfile',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/me', data, {
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

// ** Edit Password
export const updatePassword = createAsyncThunk(
  'appProfile/updatePassword',
  async (data: SecurityType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/security', data)

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

export const appProfileSlice = createSlice({
  name: 'appProfile',
  initialState: {
    profile: {
      data: {},
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    profile_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    profile_password: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile.status = 'success'
        state.profile.data = action.payload
        state.profile.total = action.payload.total
        state.profile.error = null
        state.profile.loading = false
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.profile.status = 'failed'
        state.profile.error = action.payload as ErrorType
        state.profile.loading = false
      })
      .addCase(fetchProfile.pending, state => {
        state.profile.status = 'loading'
        state.profile.error = null
        state.profile.loading = true
      })
      .addCase(updateProfile.fulfilled, state => {
        state.profile_update.status = 'success'
        state.profile_update.error = null
        state.profile_update.loading = false
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profile_update.status = 'failed'
        state.profile_update.error = action.payload as ErrorType
        state.profile_update.loading = false
      })
      .addCase(updateProfile.pending, state => {
        state.profile_update.status = 'loading'
        state.profile_update.error = null
        state.profile_update.loading = true
      })
      .addCase(updatePassword.fulfilled, state => {
        state.profile_password.status = 'success'
        state.profile_password.error = null
        state.profile_password.loading = false
      })
      .addCase(updatePassword.rejected, (state, action) => {
        state.profile_password.status = 'failed'
        state.profile_password.error = action.payload as ErrorType
        state.profile_password.loading = false
      })
      .addCase(updatePassword.pending, state => {
        state.profile_password.status = 'loading'
        state.profile_password.error = null
        state.profile_password.loading = true
      })
  }
})

export default appProfileSlice.reducer
