// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { SettingsReportFormKeyType } from 'src/entities/app/ReportFormType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  school_id?: string
}

// ** Fetch Settings Report
export const fetchSettingsReport = createAsyncThunk(
  'appSettingsReport/fetchSettingsReport',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/settings/report', { params })

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

export const appSettingsReportSlice = createSlice({
  name: 'appSettingsReport',
  initialState: {
    report_keys: {
      data: [] as SettingsReportFormKeyType[],
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSettingsReport.fulfilled, (state, action) => {
        state.report_keys.status = 'success'
        state.report_keys.data = action.payload.settings.report_keys
        state.report_keys.error = null
        state.report_keys.loading = false
      })
      .addCase(fetchSettingsReport.rejected, (state, action) => {
        state.report_keys.status = 'failed'
        state.report_keys.error = action.payload as ErrorType
        state.report_keys.loading = false
      })
      .addCase(fetchSettingsReport.pending, state => {
        state.report_keys.status = 'loading'
        state.report_keys.error = null
        state.report_keys.loading = true
      })
  }
})

export default appSettingsReportSlice.reducer
