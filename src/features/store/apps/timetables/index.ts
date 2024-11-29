// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { TimetableCreateType, TimetableType } from 'src/entities/classroom/TimetableType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  search?: string
  limit?: number
  offset?: number
  shift_ids?: string[]
  classroom_ids?: string[]
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Timetables
export const fetchTimetables = createAsyncThunk(
  'appTimetables/fetchTimetable',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/timetables', {
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

// ** Get Current Timetable
export const getCurrentTimetable = createAsyncThunk(
  'appTimetables/selectTimetable',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/timetables/${id}`)

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

// ** Edit Timetable
export const updateTimetable = createAsyncThunk(
  'appTimetables/updateTimetable',
  async (data: TimetableCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/timetables/${data.id}`, data)

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

// ** Add Timetable
export const addTimetable = createAsyncThunk(
  'appTimetables/addTimetable',
  async (data: TimetableCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/timetables', data)

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

// ** Delete Timetable
export const deleteTimetable = createAsyncThunk(
  'appTimetables/deleteTimetable',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/timetables', {
        params: {
          ids: ids
        },
        paramsSerializer: {
          indexes: null
        }
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

// ** Get Sample Timetable
export const getSampleTimetable = createAsyncThunk(
  'appTimetables/getSampleTimetable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/csv')

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

export const appTimetablesSlice = createSlice({
  name: 'appTimetables',
  initialState: {
    timetables_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    timetable_detail: {
      data: {} as TimetableType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    timetable_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    timetable_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    timetable_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    timetable_sample: {
      data: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTimetables.fulfilled, (state, action) => {
        state.timetables_list.status = 'success'
        state.timetables_list.data = action.payload.timetables
        state.timetables_list.total = action.payload.total
        state.timetables_list.error = null
        state.timetables_list.loading = false
      })
      .addCase(fetchTimetables.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.timetables_list.status = 'failed'
          state.timetables_list.error = action.payload as ErrorType
          state.timetables_list.loading = false
        }
      })
      .addCase(fetchTimetables.pending, state => {
        state.timetables_list.status = 'loading'
        state.timetables_list.error = null
        state.timetables_list.loading = true
      })
      .addCase(getCurrentTimetable.fulfilled, (state, action) => {
        state.timetable_detail.status = 'success'
        state.timetable_detail.data = action.payload.timetable
        state.timetable_detail.error = null
        state.timetable_detail.loading = false
      })
      .addCase(getCurrentTimetable.rejected, (state, action) => {
        state.timetable_detail.status = 'failed'
        state.timetable_detail.error = action.payload as ErrorType
        state.timetable_detail.loading = false
      })
      .addCase(getCurrentTimetable.pending, state => {
        state.timetable_detail.status = 'loading'
        state.timetable_detail.error = null
        state.timetable_detail.loading = true
      })
      .addCase(updateTimetable.fulfilled, state => {
        state.timetable_update.status = 'success'
        state.timetable_update.error = null
        state.timetable_update.loading = false
      })
      .addCase(updateTimetable.rejected, (state, action) => {
        state.timetable_update.status = 'failed'
        state.timetable_update.error = action.payload as ErrorType
        state.timetable_update.loading = false
      })
      .addCase(updateTimetable.pending, state => {
        state.timetable_update.status = 'loading'
        state.timetable_update.error = null
        state.timetable_update.loading = true
      })
      .addCase(addTimetable.fulfilled, state => {
        state.timetable_add.status = 'success'
        state.timetable_add.error = null
        state.timetable_add.loading = false
      })
      .addCase(addTimetable.rejected, (state, action) => {
        state.timetable_add.status = 'failed'
        state.timetable_add.error = action.payload as ErrorType
        state.timetable_add.loading = false
      })
      .addCase(addTimetable.pending, state => {
        state.timetable_add.status = 'loading'
        state.timetable_add.error = null
        state.timetable_add.loading = true
      })
      .addCase(deleteTimetable.fulfilled, state => {
        state.timetable_delete.status = 'success'
        state.timetable_delete.error = null
        state.timetable_delete.loading = false
      })
      .addCase(deleteTimetable.rejected, (state, action) => {
        state.timetable_delete.status = 'failed'
        state.timetable_delete.error = action.payload as ErrorType
        state.timetable_delete.loading = false
      })
      .addCase(deleteTimetable.pending, state => {
        state.timetable_delete.status = 'loading'
        state.timetable_delete.error = null
        state.timetable_delete.loading = true
      })
      .addCase(getSampleTimetable.fulfilled, (state, action) => {
        state.timetable_sample.status = 'success'
        state.timetable_sample.data = action.payload
        state.timetable_sample.error = null
        state.timetable_sample.loading = false
      })
      .addCase(getSampleTimetable.rejected, (state, action) => {
        state.timetable_sample.status = 'failed'
        state.timetable_sample.error = action.payload as ErrorType
        state.timetable_sample.loading = false
      })
      .addCase(getSampleTimetable.pending, state => {
        state.timetable_sample.status = 'loading'
        state.timetable_sample.error = null
        state.timetable_sample.loading = true
      })
  }
})

export default appTimetablesSlice.reducer
