// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { DataReportsUpdateType } from 'src/entities/app/ReportsType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Fetch Data Reports
export const fetchDataReports = createAsyncThunk('appDataReport/fetchDataReports', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/form/school')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Update Data Reports
export const updateDataReports = createAsyncThunk(
  'appDataReport/updateDataReports',
  async (data: DataReportsUpdateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/form/school', data)

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

export const appDataReportsSlice = createSlice({
  name: 'appDataReports',
  initialState: {
    data_reports: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    update_data_reports: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDataReports.fulfilled, (state, action) => {
        state.data_reports.status = 'success'
        state.data_reports.data = action.payload.settings
        state.data_reports.total = action.payload.total
        state.data_reports.error = null
        state.data_reports.loading = false
      })
      .addCase(fetchDataReports.rejected, (state, action) => {
        state.data_reports.status = 'failed'
        state.data_reports.error = action.payload as ErrorType
        state.data_reports.loading = false
      })
      .addCase(fetchDataReports.pending, state => {
        state.data_reports.status = 'loading'
        state.data_reports.error = null
        state.data_reports.loading = true
      })
      .addCase(updateDataReports.fulfilled, state => {
        state.update_data_reports.status = 'success'
        state.update_data_reports.error = null
        state.update_data_reports.loading = false
      })
      .addCase(updateDataReports.rejected, (state, action) => {
        state.update_data_reports.status = 'failed'
        state.update_data_reports.error = action.payload as ErrorType
        state.update_data_reports.loading = false
      })
      .addCase(updateDataReports.pending, state => {
        state.update_data_reports.status = 'loading'
        state.update_data_reports.error = null
        state.update_data_reports.loading = true
      })
  }
})

export default appDataReportsSlice.reducer
