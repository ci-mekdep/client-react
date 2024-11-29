// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { LoginParams } from 'src/app/context/types'
import { ChangeSchoolParams, ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Login
export const userLogin = createAsyncThunk('appLogin/login', async (data: LoginParams, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/login', data)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Change School
export const userChangeSchool = createAsyncThunk(
  'appLogin/changeSchool',
  async (data: ChangeSchoolParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/me/change/school',
        data
      )

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

export const appLoginSlice = createSlice({
  name: 'appLogin',
  initialState: {
    login: {
      data: {} as any,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    change_school: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(userLogin.fulfilled, (state, action) => {
        state.login.status = 'success'
        state.login.data = action.payload
        state.login.error = null
        state.login.loading = false
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.login.status = 'failed'
        state.login.error = action.payload as ErrorType
        state.login.loading = false
      })
      .addCase(userLogin.pending, state => {
        state.login.status = 'loading'
        state.login.error = null
        state.login.loading = true
      })
      .addCase(userChangeSchool.fulfilled, state => {
        state.change_school.status = 'success'
        state.change_school.error = null
        state.change_school.loading = false
      })
      .addCase(userChangeSchool.rejected, (state, action) => {
        state.change_school.status = 'failed'
        state.change_school.error = action.payload as ErrorType
        state.change_school.loading = false
      })
      .addCase(userChangeSchool.pending, state => {
        state.change_school.status = 'loading'
        state.change_school.error = null
        state.change_school.loading = true
      })
  }
})

export default appLoginSlice.reducer
