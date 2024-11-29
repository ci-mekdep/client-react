// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  school_id?: string | null
  user_id?: string | null
}

// ** Fetch Reports
export const fetchReports = createAsyncThunk('appReport/fetchReports', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/data')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Fetch Reports Details
export const fetchReportsDetails = createAsyncThunk(
  'appReport/fetchReportsDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/data', {
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

export const appReportsSlice = createSlice({
  name: 'appReports',
  initialState: {
    reports: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    reports_details: {
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
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.reports.status = 'success'
        state.reports.data = action.payload.report
        state.reports.total = action.payload.total
        state.reports.error = null
        state.reports.loading = false
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.reports.status = 'failed'
        state.reports.error = action.payload as ErrorType
        state.reports.loading = false
      })
      .addCase(fetchReports.pending, state => {
        state.reports.status = 'loading'
        state.reports.error = null
        state.reports.loading = true
      })
      .addCase(fetchReportsDetails.fulfilled, (state, action) => {
        state.reports_details.status = 'success'
        state.reports_details.data = action.payload.report
        state.reports_details.total = action.payload.total
        state.reports_details.error = null
        state.reports_details.loading = false
      })
      .addCase(fetchReportsDetails.rejected, (state, action) => {
        state.reports_details.status = 'failed'
        state.reports_details.error = action.payload as ErrorType
        state.reports_details.loading = false
      })
      .addCase(fetchReportsDetails.pending, state => {
        state.reports_details.status = 'loading'
        state.reports_details.error = null
        state.reports_details.loading = true
      })
  }
})

export default appReportsSlice.reducer
