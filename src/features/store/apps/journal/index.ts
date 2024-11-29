// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  subject_id?: string
  classroom_id?: string
  period_number?: number | string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Lessons Journal
export const fetchLessonsJournal = createAsyncThunk(
  'appJournal/fetchLessonsJournal',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/lessons/journal', {
        params,
        cancelToken: params.is_list ? cancelSource.token : undefined
      })

      return response.data
    } catch (error: any) {
      if (axios.isCancel(error)) {
        return rejectWithValue({ message: 'Request canceled', keepLoading: true })
      } else if (error.response && error.response.data) {
        return rejectWithValue(error.response.data)
      } else {
        return rejectWithValue(createApiErrorObj(error.message))
      }
    }
  }
)

// ** Fetch Lessons Quarter
export const fetchLessonsQuarter = createAsyncThunk(
  'appJournal/fetchLessonsQuarter',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/lessons/final/${id}`)

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

// ** Fetch Lessons Final
export const fetchLessonsFinal = createAsyncThunk(
  'appJournal/fetchLessonsFinal',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/lessons/final/subjects', {
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

export const appJournalSlice = createSlice({
  name: 'appJournal',
  initialState: {
    lessons_journal: {
      data: {} as any,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    lessons_quarter: {
      data: [] as any,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },

    lessons_final: {
      data: [] as any,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLessonsJournal.fulfilled, (state, action) => {
        state.lessons_journal.status = 'success'
        state.lessons_journal.data = action.payload.data
        state.lessons_journal.error = null
        state.lessons_journal.loading = false
      })
      .addCase(fetchLessonsJournal.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.lessons_journal.status = 'failed'
          state.lessons_journal.error = action.payload as ErrorType
          state.lessons_journal.loading = false
        }
      })
      .addCase(fetchLessonsJournal.pending, state => {
        state.lessons_journal.status = 'loading'
        state.lessons_journal.error = null
        state.lessons_journal.loading = true
      })
      .addCase(fetchLessonsQuarter.fulfilled, (state, action) => {
        state.lessons_quarter.status = 'success'
        state.lessons_quarter.data = action.payload.students
        state.lessons_quarter.error = null
        state.lessons_quarter.loading = false
      })
      .addCase(fetchLessonsQuarter.rejected, (state, action) => {
        state.lessons_quarter.status = 'failed'
        state.lessons_quarter.error = action.payload as ErrorType
        state.lessons_quarter.loading = false
      })
      .addCase(fetchLessonsQuarter.pending, state => {
        state.lessons_quarter.status = 'loading'
        state.lessons_quarter.error = null
        state.lessons_quarter.loading = true
      })
      .addCase(fetchLessonsFinal.fulfilled, (state, action) => {
        state.lessons_final.status = 'success'
        state.lessons_final.data = action.payload
        state.lessons_final.error = null
        state.lessons_final.loading = false
      })
      .addCase(fetchLessonsFinal.rejected, (state, action) => {
        state.lessons_final.status = 'failed'
        state.lessons_final.error = action.payload as ErrorType
        state.lessons_final.loading = false
      })
      .addCase(fetchLessonsFinal.pending, state => {
        state.lessons_final.status = 'loading'
        state.lessons_final.error = null
        state.lessons_final.loading = true
      })
  }
})

export default appJournalSlice.reducer
