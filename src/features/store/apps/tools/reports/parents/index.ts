// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  school_id?: string | null
}

// ** Fetch Report Parents
export const fetchReportParents = createAsyncThunk('appReport/fetchReportParents', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/parents')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Fetch Report Parents Details
export const fetchReportParentsDetails = createAsyncThunk(
  'appReport/fetchReportParentsDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/parents', {
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

export const appReportParentsSlice = createSlice({
  name: 'appReportParents',
  initialState: {
    report_parents: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_parents_details: {
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
      .addCase(fetchReportParents.fulfilled, (state, action) => {
        state.report_parents.status = 'success'
        state.report_parents.data = action.payload.report
        state.report_parents.total = action.payload.total
        state.report_parents.error = null
        state.report_parents.loading = false
      })
      .addCase(fetchReportParents.rejected, (state, action) => {
        state.report_parents.status = 'failed'
        state.report_parents.error = action.payload as ErrorType
        state.report_parents.loading = false
      })
      .addCase(fetchReportParents.pending, state => {
        state.report_parents.status = 'loading'
        state.report_parents.error = null
        state.report_parents.loading = true
      })
      .addCase(fetchReportParentsDetails.fulfilled, (state, action) => {
        state.report_parents_details.status = 'success'
        state.report_parents_details.data = action.payload.report
        state.report_parents_details.total = action.payload.total
        state.report_parents_details.error = null
        state.report_parents_details.loading = false
      })
      .addCase(fetchReportParentsDetails.rejected, (state, action) => {
        state.report_parents_details.status = 'failed'
        state.report_parents_details.error = action.payload as ErrorType
        state.report_parents_details.loading = false
      })
      .addCase(fetchReportParentsDetails.pending, state => {
        state.report_parents_details.status = 'loading'
        state.report_parents_details.error = null
        state.report_parents_details.loading = true
      })
  }
})

export default appReportParentsSlice.reducer
