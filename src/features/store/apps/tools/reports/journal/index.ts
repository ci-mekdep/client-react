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
  period_number?: string | null
}

// ** Fetch Report Journal
export const fetchReportJournal = createAsyncThunk(
  'appReport/fetchReportJournal',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/journal', {
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

// ** Fetch Report Journal Details
export const fetchReportJournalDetails = createAsyncThunk(
  'appReport/fetchReportJournalDetails',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/journal', {
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

export const appReportJournalSlice = createSlice({
  name: 'appReportJournnal',
  initialState: {
    report_journal: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_journal_details: {
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
      .addCase(fetchReportJournal.fulfilled, (state, action) => {
        state.report_journal.status = 'success'
        state.report_journal.data = action.payload.report
        state.report_journal.total = action.payload.total
        state.report_journal.error = null
        state.report_journal.loading = false
      })
      .addCase(fetchReportJournal.rejected, (state, action) => {
        state.report_journal.status = 'failed'
        state.report_journal.error = action.payload as ErrorType
        state.report_journal.loading = false
      })
      .addCase(fetchReportJournal.pending, state => {
        state.report_journal.status = 'loading'
        state.report_journal.error = null
        state.report_journal.loading = true
      })
      .addCase(fetchReportJournalDetails.fulfilled, (state, action) => {
        state.report_journal_details.status = 'success'
        state.report_journal_details.data = action.payload.report
        state.report_journal_details.total = action.payload.total
        state.report_journal_details.error = null
        state.report_journal_details.loading = false
      })
      .addCase(fetchReportJournalDetails.rejected, (state, action) => {
        state.report_journal_details.status = 'failed'
        state.report_journal_details.error = action.payload as ErrorType
        state.report_journal_details.loading = false
      })
      .addCase(fetchReportJournalDetails.pending, state => {
        state.report_journal_details.status = 'loading'
        state.report_journal_details.error = null
        state.report_journal_details.loading = true
      })
  }
})

export default appReportJournalSlice.reducer
