// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { BaseSubjectCreateType } from 'src/entities/classroom/BaseSubjectType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Base Subjects
export const fetchBaseSubjects = createAsyncThunk(
  'appBaseSubject/fetchBaseSubjects',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/base-subjects', {
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

// ** Get Current Base Subject
export const getCurrentBaseSubject = createAsyncThunk(
  'appBaseSubject/selectBaseSubject',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/base-subjects/${id}`)

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

// ** Edit Base Subject
export const updateBaseSubject = createAsyncThunk(
  'appBaseSubject/updateBaseSubject',
  async (data: BaseSubjectCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/base-subjects/${data.id}`,
        data
      )

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

// ** Add Base Subject
export const addBaseSubject = createAsyncThunk(
  'appBaseSubject/addBaseSubject',
  async (data: BaseSubjectCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/base-subjects', data)

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

// ** Delete Base Subject
export const deleteBaseSubject = createAsyncThunk(
  'appBaseSubject/deleteBaseSubject',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/base-subjects', {
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

export const appBaseSubjectsSlice = createSlice({
  name: 'appBaseSubject',
  initialState: {
    base_subjects_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    base_subject_detail: {
      data: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    base_subject_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    base_subject_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    base_subject_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBaseSubjects.fulfilled, (state, action) => {
        state.base_subjects_list.status = 'success'
        state.base_subjects_list.data = action.payload.base_subjects
        state.base_subjects_list.total = action.payload.total
        state.base_subjects_list.error = null
        state.base_subjects_list.loading = false
      })
      .addCase(fetchBaseSubjects.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.base_subjects_list.status = 'failed'
          state.base_subjects_list.error = action.payload as ErrorType
          state.base_subjects_list.loading = false
        }
      })
      .addCase(fetchBaseSubjects.pending, state => {
        state.base_subjects_list.status = 'loading'
        state.base_subjects_list.error = null
        state.base_subjects_list.loading = true
      })
      .addCase(getCurrentBaseSubject.fulfilled, (state, action) => {
        state.base_subject_detail.status = 'success'
        state.base_subject_detail.data = action.payload.base_subject
        state.base_subject_detail.error = null
        state.base_subject_detail.loading = false
      })
      .addCase(getCurrentBaseSubject.rejected, (state, action) => {
        state.base_subject_detail.status = 'failed'
        state.base_subject_detail.error = action.payload as ErrorType
        state.base_subject_detail.loading = false
      })
      .addCase(getCurrentBaseSubject.pending, state => {
        state.base_subject_detail.status = 'loading'
        state.base_subject_detail.error = null
        state.base_subject_detail.loading = true
      })
      .addCase(updateBaseSubject.fulfilled, state => {
        state.base_subject_update.status = 'success'
        state.base_subject_update.error = null
        state.base_subject_update.loading = false
      })
      .addCase(updateBaseSubject.rejected, (state, action) => {
        state.base_subject_update.status = 'failed'
        state.base_subject_update.error = action.payload as ErrorType
        state.base_subject_update.loading = false
      })
      .addCase(updateBaseSubject.pending, state => {
        state.base_subject_update.status = 'loading'
        state.base_subject_update.error = null
        state.base_subject_update.loading = true
      })
      .addCase(addBaseSubject.fulfilled, state => {
        state.base_subject_add.status = 'success'
        state.base_subject_add.error = null
        state.base_subject_add.loading = false
      })
      .addCase(addBaseSubject.rejected, (state, action) => {
        state.base_subject_add.status = 'failed'
        state.base_subject_add.error = action.payload as ErrorType
        state.base_subject_add.loading = false
      })
      .addCase(addBaseSubject.pending, state => {
        state.base_subject_add.status = 'loading'
        state.base_subject_add.error = null
        state.base_subject_add.loading = true
      })
      .addCase(deleteBaseSubject.fulfilled, state => {
        state.base_subject_delete.status = 'success'
        state.base_subject_delete.error = null
        state.base_subject_delete.loading = false
      })
      .addCase(deleteBaseSubject.rejected, (state, action) => {
        state.base_subject_delete.status = 'failed'
        state.base_subject_delete.error = action.payload as ErrorType
        state.base_subject_delete.loading = false
      })
      .addCase(deleteBaseSubject.pending, state => {
        state.base_subject_delete.status = 'loading'
        state.base_subject_delete.error = null
        state.base_subject_delete.loading = true
      })
  }
})

export default appBaseSubjectsSlice.reducer
