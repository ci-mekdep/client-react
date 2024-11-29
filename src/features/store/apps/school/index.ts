// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType, LiteModelType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { SchoolType } from 'src/entities/school/SchoolType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
  parent_id?: string
  is_select?: true
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Schools
export const fetchSchools = createAsyncThunk(
  'appSchool/fetchSchool',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/schools', {
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

// ** Fetch Schools Lite
export const fetchSchoolsLite = createAsyncThunk(
  'appSchool/fetchSchoolsLite',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/schools/values', {
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

// ** Get Current School
export const getCurrentSchool = createAsyncThunk('appSchools/selectSchool', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/schools/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit School
export const updateSchool = createAsyncThunk(
  'appSchools/updateSchool',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/schools/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
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

// ** Add School
export const addSchool = createAsyncThunk('appSchools/addSchool', async (data: FormData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/schools', data, {
      headers: {
        'Content-Type': 'multipart/form-data'
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
})

// ** Delete School
export const deleteSchool = createAsyncThunk('appSchools/deleteSchool', async (ids: string[], { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/schools', {
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
})

export const appSchoolsSlice = createSlice({
  name: 'appSchools',
  initialState: {
    schools_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    schools_lite_list: {
      data: [] as LiteModelType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_detail: {
      data: {} as SchoolType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSchools.fulfilled, (state, action) => {
        state.schools_list.status = 'success'
        state.schools_list.data = action.payload.schools
        state.schools_list.total = action.payload.total
        state.schools_list.error = null
        state.schools_list.loading = false
      })
      .addCase(fetchSchools.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.schools_list.status = 'failed'
          state.schools_list.error = action.payload as ErrorType
          state.schools_list.loading = false
        }
      })
      .addCase(fetchSchools.pending, state => {
        state.schools_list.status = 'loading'
        state.schools_list.error = null
        state.schools_list.loading = true
      })
      .addCase(fetchSchoolsLite.fulfilled, (state, action) => {
        state.schools_lite_list.status = 'success'
        state.schools_lite_list.data = action.payload.schools
        state.schools_lite_list.total = action.payload.total
        state.schools_lite_list.error = null
        state.schools_lite_list.loading = false
      })
      .addCase(fetchSchoolsLite.rejected, (state, action) => {
        state.schools_lite_list.status = 'failed'
        state.schools_lite_list.error = action.payload as ErrorType
        state.schools_lite_list.loading = false
      })
      .addCase(fetchSchoolsLite.pending, state => {
        state.schools_lite_list.status = 'loading'
        state.schools_lite_list.error = null
        state.schools_lite_list.loading = true
      })
      .addCase(getCurrentSchool.fulfilled, (state, action) => {
        state.school_detail.status = 'success'
        state.school_detail.data = action.payload.school
        state.school_detail.error = null
        state.school_detail.loading = false
      })
      .addCase(getCurrentSchool.rejected, (state, action) => {
        state.school_detail.status = 'failed'
        state.school_detail.error = action.payload as ErrorType
        state.school_detail.loading = false
      })
      .addCase(getCurrentSchool.pending, state => {
        state.school_detail.status = 'loading'
        state.school_detail.error = null
        state.school_detail.loading = true
      })
      .addCase(updateSchool.fulfilled, state => {
        state.school_update.status = 'success'
        state.school_update.error = null
        state.school_update.loading = false
      })
      .addCase(updateSchool.rejected, (state, action) => {
        state.school_update.status = 'failed'
        state.school_update.error = action.payload as ErrorType
        state.school_update.loading = false
      })
      .addCase(updateSchool.pending, state => {
        state.school_update.status = 'loading'
        state.school_update.error = null
        state.school_update.loading = true
      })
      .addCase(addSchool.fulfilled, state => {
        state.school_add.status = 'success'
        state.school_add.error = null
        state.school_add.loading = false
      })
      .addCase(addSchool.rejected, (state, action) => {
        state.school_add.status = 'failed'
        state.school_add.error = action.payload as ErrorType
        state.school_add.loading = false
      })
      .addCase(addSchool.pending, state => {
        state.school_add.status = 'loading'
        state.school_add.error = null
        state.school_add.loading = true
      })
      .addCase(deleteSchool.fulfilled, state => {
        state.school_delete.status = 'success'
        state.school_delete.error = null
        state.school_delete.loading = false
      })
      .addCase(deleteSchool.rejected, (state, action) => {
        state.school_delete.status = 'failed'
        state.school_delete.error = action.payload as ErrorType
        state.school_delete.loading = false
      })
      .addCase(deleteSchool.pending, state => {
        state.school_delete.status = 'loading'
        state.school_delete.error = null
        state.school_delete.loading = true
      })
  }
})

export default appSchoolsSlice.reducer
