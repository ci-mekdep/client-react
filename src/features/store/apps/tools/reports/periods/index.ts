// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  period_number?: string
  school_id?: string | null
}

// ** Fetch Report Periods
export const fetchReportPeriods = createAsyncThunk(
  'appReport/fetchReportPeriods',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/period_finished', {
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

// ** Fetch Report Periods Details
export const fetchReportPeriodsDetails = createAsyncThunk(
  'appReport/fetchReportPeriodsDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/period_finished', {
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

export const appReportPeriodsSlice = createSlice({
  name: 'appReportPeriods',
  initialState: {
    report_periods: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_periods_details: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReportPeriods.fulfilled, (state, action) => {
        state.report_periods.status = 'success'
        state.report_periods.data = action.payload.report
        state.report_periods.total = action.payload.total
        state.report_periods.error = null
        state.report_periods.loading = false
      })
      .addCase(fetchReportPeriods.rejected, (state, action) => {
        state.report_periods.status = 'failed'
        state.report_periods.error = action.payload as ErrorType
        state.report_periods.loading = false
      })
      .addCase(fetchReportPeriods.pending, state => {
        state.report_periods.status = 'loading'
        state.report_periods.error = null
        state.report_periods.loading = true
      })
      .addCase(fetchReportPeriodsDetails.fulfilled, (state, action) => {
        state.report_periods_details.status = 'success'
        state.report_periods_details.data = action.payload.report
        state.report_periods_details.total = action.payload.total
        state.report_periods_details.error = null
        state.report_periods_details.loading = false
      })
      .addCase(fetchReportPeriodsDetails.rejected, (state, action) => {
        state.report_periods_details.status = 'failed'
        state.report_periods_details.error = action.payload as ErrorType
        state.report_periods_details.loading = false
      })
      .addCase(fetchReportPeriodsDetails.pending, state => {
        state.report_periods_details.status = 'loading'
        state.report_periods_details.error = null
        state.report_periods_details.loading = true
      })
  }
})

export default appReportPeriodsSlice.reducer
