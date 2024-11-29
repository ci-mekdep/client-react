// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  school_id?: string | null
}

// ** Fetch Report Students
export const fetchReportStudents = createAsyncThunk('appReport/fetchReportStudents', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/students')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Fetch Report Students Details
export const fetchReportStudentsDetails = createAsyncThunk(
  'appReport/fetchReportStudentsDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/students', {
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

export const appReportStudentsSlice = createSlice({
  name: 'appReportStudents',
  initialState: {
    report_students: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_students_details: {
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
      .addCase(fetchReportStudents.fulfilled, (state, action) => {
        state.report_students.status = 'success'
        state.report_students.data = action.payload.report
        state.report_students.total = action.payload.total
        state.report_students.error = null
        state.report_students.loading = false
      })
      .addCase(fetchReportStudents.rejected, (state, action) => {
        state.report_students.status = 'failed'
        state.report_students.error = action.payload as ErrorType
        state.report_students.loading = false
      })
      .addCase(fetchReportStudents.pending, state => {
        state.report_students.status = 'loading'
        state.report_students.error = null
        state.report_students.loading = true
      })
      .addCase(fetchReportStudentsDetails.fulfilled, (state, action) => {
        state.report_students_details.status = 'success'
        state.report_students_details.data = action.payload.report
        state.report_students_details.total = action.payload.total
        state.report_students_details.error = null
        state.report_students_details.loading = false
      })
      .addCase(fetchReportStudentsDetails.rejected, (state, action) => {
        state.report_students_details.status = 'failed'
        state.report_students_details.error = action.payload as ErrorType
        state.report_students_details.loading = false
      })
      .addCase(fetchReportStudentsDetails.pending, state => {
        state.report_students_details.status = 'loading'
        state.report_students_details.error = null
        state.report_students_details.loading = true
      })
  }
})

export default appReportStudentsSlice.reducer
