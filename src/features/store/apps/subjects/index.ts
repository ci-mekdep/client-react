// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { SubjectCreateType } from 'src/entities/classroom/SubjectType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
  teacher_ids?: string[]
  classroom_ids?: string[]
  subject_names?: string[] | string
  week_hours?: number[]
  is_second_teacher?: boolean
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Subjects
export const fetchSubjects = createAsyncThunk(
  'appSubject/fetchSubjects',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects', {
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

// ** Fetch Subjects Lite
export const fetchSubjectsLite = createAsyncThunk(
  'appSubject/fetchSubjectsLite',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/values', {
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

// ** Get Current Subject
export const getCurrentSubject = createAsyncThunk(
  'appSubject/selectSubject',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/subjects/${id}`)

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

// ** Edit Subject
export const updateSubject = createAsyncThunk(
  'appSubject/updateSubject',
  async (data: SubjectCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/subjects/${data.id}`, data)

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

// ** Add Subject
export const addSubject = createAsyncThunk(
  'appSubject/addSubject',
  async (data: SubjectCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects', data)

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

// ** Add Multiple Subject
export const addMultipleSubject = createAsyncThunk(
  'appSubject/addMultipleSubjects',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/batch', data)

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

// ** Delete Subject
export const deleteSubject = createAsyncThunk(
  'appSubject/deleteSubject',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects', {
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

export const appSubjectsSlice = createSlice({
  name: 'appSubject',
  initialState: {
    subjects_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subjects_lite_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_detail: {
      data: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_add_multiple: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjects_list.status = 'success'
        state.subjects_list.data = action.payload.subjects
        state.subjects_list.total = action.payload.total
        state.subjects_list.error = null
        state.subjects_list.loading = false
      })
      .addCase(fetchSubjects.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.subjects_list.status = 'failed'
          state.subjects_list.error = action.payload as ErrorType
          state.subjects_list.loading = false
        }
      })
      .addCase(fetchSubjects.pending, state => {
        state.subjects_list.status = 'loading'
        state.subjects_list.error = null
        state.subjects_list.loading = true
      })
      .addCase(fetchSubjectsLite.fulfilled, (state, action) => {
        state.subjects_lite_list.status = 'success'
        state.subjects_lite_list.data = action.payload.subjects
        state.subjects_lite_list.total = action.payload.total
        state.subjects_lite_list.error = null
        state.subjects_lite_list.loading = false
      })
      .addCase(fetchSubjectsLite.rejected, (state, action) => {
        state.subjects_lite_list.status = 'failed'
        state.subjects_lite_list.error = action.payload as ErrorType
        state.subjects_lite_list.loading = false
      })
      .addCase(fetchSubjectsLite.pending, state => {
        state.subjects_lite_list.status = 'loading'
        state.subjects_lite_list.error = null
        state.subjects_lite_list.loading = true
      })
      .addCase(getCurrentSubject.fulfilled, (state, action) => {
        state.subject_detail.status = 'success'
        state.subject_detail.data = action.payload.subject
        state.subject_detail.error = null
        state.subject_detail.loading = false
      })
      .addCase(getCurrentSubject.rejected, (state, action) => {
        state.subject_detail.status = 'failed'
        state.subject_detail.error = action.payload as ErrorType
        state.subject_detail.loading = false
      })
      .addCase(getCurrentSubject.pending, state => {
        state.subject_detail.status = 'loading'
        state.subject_detail.error = null
        state.subject_detail.loading = true
      })
      .addCase(updateSubject.fulfilled, state => {
        state.subject_update.status = 'success'
        state.subject_update.error = null
        state.subject_update.loading = false
      })
      .addCase(updateSubject.rejected, (state, action) => {
        state.subject_update.status = 'failed'
        state.subject_update.error = action.payload as ErrorType
        state.subject_update.loading = false
      })
      .addCase(updateSubject.pending, state => {
        state.subject_update.status = 'loading'
        state.subject_update.error = null
        state.subject_update.loading = true
      })
      .addCase(addSubject.fulfilled, state => {
        state.subject_add.status = 'success'
        state.subject_add.error = null
        state.subject_add.loading = false
      })
      .addCase(addSubject.rejected, (state, action) => {
        state.subject_add.status = 'failed'
        state.subject_add.error = action.payload as ErrorType
        state.subject_add.loading = false
      })
      .addCase(addSubject.pending, state => {
        state.subject_add.status = 'loading'
        state.subject_add.error = null
        state.subject_add.loading = true
      })
      .addCase(addMultipleSubject.fulfilled, state => {
        state.subject_add_multiple.status = 'success'
        state.subject_add_multiple.error = null
        state.subject_add_multiple.loading = false
      })
      .addCase(addMultipleSubject.rejected, (state, action) => {
        state.subject_add_multiple.status = 'failed'
        state.subject_add_multiple.error = action.payload as ErrorType
        state.subject_add_multiple.loading = false
      })
      .addCase(addMultipleSubject.pending, state => {
        state.subject_add_multiple.status = 'loading'
        state.subject_add_multiple.error = null
        state.subject_add_multiple.loading = true
      })
      .addCase(deleteSubject.fulfilled, state => {
        state.subject_delete.status = 'success'
        state.subject_delete.error = null
        state.subject_delete.loading = false
      })
      .addCase(deleteSubject.rejected, (state, action) => {
        state.subject_delete.status = 'failed'
        state.subject_delete.error = action.payload as ErrorType
        state.subject_delete.loading = false
      })
      .addCase(deleteSubject.pending, state => {
        state.subject_delete.status = 'loading'
        state.subject_delete.error = null
        state.subject_delete.loading = true
      })
  }
})

export default appSubjectsSlice.reducer
