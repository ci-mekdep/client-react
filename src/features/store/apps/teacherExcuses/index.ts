// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { TeacherExcuseType } from 'src/entities/school/TeacherExcuseType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  school_id?: string
  teacher_id?: string
  date?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Excuses
export const fetchTeacherExcuses = createAsyncThunk(
  'appTeacherExcuses/fetchTeacherExcuses',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/teacher-excuses`, {
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

// ** Get Current Teacher Excuse
export const getCurrentTeacherExcuse = createAsyncThunk(
  'appTeacherExcuses/selectTeacherExcuse',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/teacher-excuses/${id}`)

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

// ** Edit Teacher Excuse
export const updateTeacherExcuse = createAsyncThunk(
  'appTeacherExcuses/updateTeacherExcuses',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/teacher-excuses/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
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

// ** Add Teacher Excuse
export const addTeacherExcuse = createAsyncThunk(
  'appTeacherExcuses/addTeacherExcuse',
  async ({ data }: { data: FormData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/teacher-excuses`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
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

// ** Delete Teacher Excuse
export const deleteTeacherExcuse = createAsyncThunk(
  'appTeacherExcuses/deleteTeacherExcuse',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/teacher-excuses`, {
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

export const appTeacherExcusesSlice = createSlice({
  name: 'appTeacherExcuses',
  initialState: {
    teacher_excuses_list: {
      data: [] as TeacherExcuseType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    teacher_excuse_detail: {
      data: {} as TeacherExcuseType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    teacher_excuse_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    teacher_excuse_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    teacher_excuse_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTeacherExcuses.fulfilled, (state, action) => {
        state.teacher_excuses_list.status = 'success'
        state.teacher_excuses_list.data = action.payload.teacher_excuses
        state.teacher_excuses_list.total = action.payload.total
        state.teacher_excuses_list.error = null
        state.teacher_excuses_list.loading = false
      })
      .addCase(fetchTeacherExcuses.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.teacher_excuses_list.status = 'failed'
          state.teacher_excuses_list.error = action.payload as ErrorType
          state.teacher_excuses_list.loading = false
        }
      })
      .addCase(fetchTeacherExcuses.pending, state => {
        state.teacher_excuses_list.error = null
        state.teacher_excuses_list.status = 'loading'
        state.teacher_excuses_list.loading = true
      })
      .addCase(getCurrentTeacherExcuse.fulfilled, (state, action) => {
        state.teacher_excuse_detail.status = 'success'
        state.teacher_excuse_detail.data = action.payload.teacher_excuse
        state.teacher_excuse_detail.error = null
        state.teacher_excuse_detail.loading = false
      })
      .addCase(getCurrentTeacherExcuse.rejected, (state, action) => {
        state.teacher_excuse_detail.status = 'failed'
        state.teacher_excuse_detail.error = action.payload as ErrorType
        state.teacher_excuse_detail.loading = false
      })
      .addCase(getCurrentTeacherExcuse.pending, state => {
        state.teacher_excuse_detail.status = 'loading'
        state.teacher_excuse_detail.error = null
        state.teacher_excuse_detail.loading = true
      })
      .addCase(updateTeacherExcuse.fulfilled, state => {
        state.teacher_excuse_update.status = 'success'
        state.teacher_excuse_update.error = null
        state.teacher_excuse_update.loading = false
      })
      .addCase(updateTeacherExcuse.rejected, (state, action) => {
        state.teacher_excuse_update.status = 'failed'
        state.teacher_excuse_update.error = action.payload as ErrorType
        state.teacher_excuse_update.loading = false
      })
      .addCase(updateTeacherExcuse.pending, state => {
        state.teacher_excuse_update.status = 'loading'
        state.teacher_excuse_update.error = null
        state.teacher_excuse_update.loading = true
      })
      .addCase(addTeacherExcuse.fulfilled, state => {
        state.teacher_excuse_add.status = 'success'
        state.teacher_excuse_add.error = null
        state.teacher_excuse_add.loading = false
      })
      .addCase(addTeacherExcuse.rejected, (state, action) => {
        state.teacher_excuse_add.status = 'failed'
        state.teacher_excuse_add.error = action.payload as ErrorType
        state.teacher_excuse_add.loading = false
      })
      .addCase(addTeacherExcuse.pending, state => {
        state.teacher_excuse_add.status = 'loading'
        state.teacher_excuse_add.error = null
        state.teacher_excuse_add.loading = true
      })
      .addCase(deleteTeacherExcuse.fulfilled, state => {
        state.teacher_excuse_delete.status = 'success'
        state.teacher_excuse_delete.error = null
        state.teacher_excuse_delete.loading = false
      })
      .addCase(deleteTeacherExcuse.rejected, (state, action) => {
        state.teacher_excuse_delete.status = 'failed'
        state.teacher_excuse_delete.error = action.payload as ErrorType
        state.teacher_excuse_delete.loading = false
      })
      .addCase(deleteTeacherExcuse.pending, state => {
        state.teacher_excuse_delete.status = 'loading'
        state.teacher_excuse_delete.error = null
        state.teacher_excuse_delete.loading = true
      })
  }
})

export default appTeacherExcusesSlice.reducer
