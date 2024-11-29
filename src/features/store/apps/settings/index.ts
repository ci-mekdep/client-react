// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { AppSettingsType, AppSettingsUpdateType } from 'src/entities/app/AppSettingsType'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  school_id?: string
}

// ** Fetch Settings
export const fetchSettings = createAsyncThunk(
  'appSettings/fetchSettings',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/settings', { params })

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

// ** Update Settings
export const updateSettings = createAsyncThunk(
  'appSettings/updateSettings',
  async (data: AppSettingsUpdateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/settings', data)

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

export const appSettingsSlice = createSlice({
  name: 'appSettings',
  initialState: {
    settings: {
      data: {} as AppSettingsType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    settings_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings.status = 'success'
        state.settings.data = action.payload
        state.settings.error = null
        state.settings.loading = false
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settings.status = 'failed'
        state.settings.error = action.payload as ErrorType
        state.settings.loading = false
      })
      .addCase(fetchSettings.pending, state => {
        state.settings.status = 'loading'
        state.settings.error = null
        state.settings.loading = true
      })
      .addCase(updateSettings.fulfilled, state => {
        state.settings_update.status = 'success'
        state.settings_update.error = null
        state.settings_update.loading = false
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.settings_update.status = 'failed'
        state.settings_update.error = action.payload as ErrorType
        state.settings_update.loading = false
      })
      .addCase(updateSettings.pending, state => {
        state.settings_update.status = 'loading'
        state.settings_update.error = null
        state.settings_update.loading = true
      })
  }
})

export default appSettingsSlice.reducer
