// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  start_date?: string | null
  end_date?: string | null
  school_id?: string | null
}

// ** Fetch Report Attendance
export const fetchReportAttendance = createAsyncThunk(
  'appReport/fetchReportAttendance',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/attendance', {
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

// ** Fetch Report Attendance Details
export const fetchReportAttendanceDetails = createAsyncThunk(
  'appReport/fetchReportAttendanceDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/attendance', {
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

export const appReportAttendanceSlice = createSlice({
  name: 'appReportAttendance',
  initialState: {
    report_attendance: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_attendance_details: {
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
      .addCase(fetchReportAttendance.fulfilled, (state, action) => {
        state.report_attendance.status = 'success'
        state.report_attendance.data = action.payload.report
        state.report_attendance.total = action.payload.total
        state.report_attendance.error = null
        state.report_attendance.loading = false
      })
      .addCase(fetchReportAttendance.rejected, (state, action) => {
        state.report_attendance.status = 'failed'
        state.report_attendance.error = action.payload as ErrorType
        state.report_attendance.loading = false
      })
      .addCase(fetchReportAttendance.pending, state => {
        state.report_attendance.status = 'loading'
        state.report_attendance.error = null
        state.report_attendance.loading = true
      })
      .addCase(fetchReportAttendanceDetails.fulfilled, (state, action) => {
        state.report_attendance_details.status = 'success'
        state.report_attendance_details.data = action.payload.report
        state.report_attendance_details.total = action.payload.total
        state.report_attendance_details.error = null
        state.report_attendance_details.loading = false
      })
      .addCase(fetchReportAttendanceDetails.rejected, (state, action) => {
        state.report_attendance_details.status = 'failed'
        state.report_attendance_details.error = action.payload as ErrorType
        state.report_attendance_details.loading = false
      })
      .addCase(fetchReportAttendanceDetails.pending, state => {
        state.report_attendance_details.status = 'loading'
        state.report_attendance_details.error = null
        state.report_attendance_details.loading = true
      })
  }
})

export default appReportAttendanceSlice.reducer
