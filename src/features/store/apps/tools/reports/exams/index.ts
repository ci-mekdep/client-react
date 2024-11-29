// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  school_id?: string | null
}

// ** Fetch Report Exams
export const fetchReportExams = createAsyncThunk('appReport/fetchReportExams', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/exams', {
      params: { is_graduate: 0 }
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

// ** Fetch Report Exams Graduate
export const fetchReportExamsGraduate = createAsyncThunk(
  'appReport/fetchReportExamsGraduate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/exams', {
        params: { is_graduate: 1 }
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

// ** Fetch Report Exams Details
export const fetchReportExamsDetails = createAsyncThunk(
  'appReport/fetchReportExamsDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/exams', {
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

export const appReportExamsSlice = createSlice({
  name: 'appReportExams',
  initialState: {
    report_exams: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_exams_graduate: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_exams_details: {
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
      .addCase(fetchReportExams.fulfilled, (state, action) => {
        state.report_exams.status = 'success'
        state.report_exams.data = action.payload.report
        state.report_exams.total = action.payload.total
        state.report_exams.error = null
        state.report_exams.loading = false
      })
      .addCase(fetchReportExams.rejected, (state, action) => {
        state.report_exams.status = 'failed'
        state.report_exams.error = action.payload as ErrorType
        state.report_exams.loading = false
      })
      .addCase(fetchReportExams.pending, state => {
        state.report_exams.status = 'loading'
        state.report_exams.error = null
        state.report_exams.loading = true
      })
      .addCase(fetchReportExamsGraduate.fulfilled, (state, action) => {
        state.report_exams_graduate.status = 'success'
        state.report_exams_graduate.data = action.payload.report
        state.report_exams_graduate.total = action.payload.total
        state.report_exams_graduate.error = null
        state.report_exams_graduate.loading = false
      })
      .addCase(fetchReportExamsGraduate.rejected, (state, action) => {
        state.report_exams_graduate.status = 'failed'
        state.report_exams_graduate.error = action.payload as ErrorType
        state.report_exams_graduate.loading = false
      })
      .addCase(fetchReportExamsGraduate.pending, state => {
        state.report_exams_graduate.status = 'loading'
        state.report_exams_graduate.error = null
        state.report_exams_graduate.loading = true
      })
      .addCase(fetchReportExamsDetails.fulfilled, (state, action) => {
        state.report_exams_details.status = 'success'
        state.report_exams_details.data = action.payload.report
        state.report_exams_details.total = action.payload.total
        state.report_exams_details.error = null
        state.report_exams_details.loading = false
      })
      .addCase(fetchReportExamsDetails.rejected, (state, action) => {
        state.report_exams_details.status = 'failed'
        state.report_exams_details.error = action.payload as ErrorType
        state.report_exams_details.loading = false
      })
      .addCase(fetchReportExamsDetails.pending, state => {
        state.report_exams_details.status = 'loading'
        state.report_exams_details.error = null
        state.report_exams_details.loading = true
      })
  }
})

export default appReportExamsSlice.reducer
