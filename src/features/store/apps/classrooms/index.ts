// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType, LiteModelType } from 'src/entities/app/GeneralTypes'
import { ClassroomCreateType, ClassroomType } from 'src/entities/classroom/ClassroomType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
  school_id?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Classrooms
export const fetchClassrooms = createAsyncThunk(
  'appClassroom/fetchClassroom',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/classrooms', {
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

// ** Fetch Classrooms Lite
export const fetchClassroomsLite = createAsyncThunk(
  'appClassroom/fetchClassroomsLite',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/classrooms/values', {
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

// ** Get Current Classroom
export const getCurrentClassroom = createAsyncThunk(
  'appClassroom/selectClassroom',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/classrooms/${id}`)

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

// ** Edit Classroom
export const updateClassroom = createAsyncThunk(
  'appClassroom/updateClassroom',
  async (data: ClassroomCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/classrooms/${data.id}`, data)

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

// ** Edit Classroom Relations
export const updateClassroomRelations = createAsyncThunk(
  'appClassroom/updateClassroomRelations',
  async ({ data, id }: { data: ClassroomCreateType; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/classrooms/${id}/relations`,
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

// ** Add Classroom
export const addClassroom = createAsyncThunk(
  'appClassroom/addClassroom',
  async (data: ClassroomCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/classrooms', data)

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

// ** Delete Classroom
export const deleteClassroom = createAsyncThunk(
  'appClassroom/deleteClassroom',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/classrooms', {
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

export const appClassroomsSlice = createSlice({
  name: 'appClassroom',
  initialState: {
    classrooms_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    classrooms_lite_list: {
      data: [] as LiteModelType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    classroom_detail: {
      data: {} as ClassroomType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    classroom_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    classroom_update_relations: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    classroom_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    classroom_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchClassrooms.fulfilled, (state, action) => {
        state.classrooms_list.status = 'success'
        state.classrooms_list.data = action.payload.classrooms
        state.classrooms_list.total = action.payload.total
        state.classrooms_list.error = null
        state.classrooms_list.loading = false
      })
      .addCase(fetchClassrooms.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.classrooms_list.status = 'failed'
          state.classrooms_list.error = action.payload as ErrorType
          state.classrooms_list.loading = false
        }
      })
      .addCase(fetchClassrooms.pending, state => {
        state.classrooms_list.status = 'loading'
        state.classrooms_list.error = null
        state.classrooms_list.loading = true
      })
      .addCase(fetchClassroomsLite.fulfilled, (state, action) => {
        state.classrooms_lite_list.status = 'success'
        state.classrooms_lite_list.data = action.payload.classrooms
        state.classrooms_lite_list.total = action.payload.total
        state.classrooms_lite_list.error = null
        state.classrooms_lite_list.loading = false
      })
      .addCase(fetchClassroomsLite.rejected, (state, action) => {
        state.classrooms_lite_list.status = 'failed'
        state.classrooms_lite_list.error = action.payload as ErrorType
        state.classrooms_lite_list.loading = false
      })
      .addCase(fetchClassroomsLite.pending, state => {
        state.classrooms_lite_list.status = 'loading'
        state.classrooms_lite_list.error = null
        state.classrooms_lite_list.loading = true
      })
      .addCase(getCurrentClassroom.fulfilled, (state, action) => {
        state.classroom_detail.status = 'success'
        state.classroom_detail.data = action.payload.classroom
        state.classroom_detail.error = null
        state.classroom_detail.loading = false
      })
      .addCase(getCurrentClassroom.rejected, (state, action) => {
        state.classroom_detail.status = 'failed'
        state.classroom_detail.error = action.payload as ErrorType
        state.classroom_detail.loading = false
      })
      .addCase(getCurrentClassroom.pending, state => {
        state.classroom_detail.status = 'loading'
        state.classroom_detail.error = null
        state.classroom_detail.loading = true
      })
      .addCase(updateClassroom.fulfilled, state => {
        state.classroom_update.status = 'success'
        state.classroom_update.error = null
        state.classroom_update.loading = false
      })
      .addCase(updateClassroom.rejected, (state, action) => {
        state.classroom_update.status = 'failed'
        state.classroom_update.error = action.payload as ErrorType
        state.classroom_update.loading = false
      })
      .addCase(updateClassroom.pending, state => {
        state.classroom_update.status = 'loading'
        state.classroom_update.error = null
        state.classroom_update.loading = true
      })
      .addCase(updateClassroomRelations.fulfilled, state => {
        state.classroom_update_relations.status = 'success'
        state.classroom_update_relations.error = null
        state.classroom_update_relations.loading = false
      })
      .addCase(updateClassroomRelations.rejected, (state, action) => {
        state.classroom_update_relations.status = 'failed'
        state.classroom_update_relations.error = action.payload as ErrorType
        state.classroom_update_relations.loading = false
      })
      .addCase(updateClassroomRelations.pending, state => {
        state.classroom_update_relations.status = 'loading'
        state.classroom_update_relations.error = null
        state.classroom_update_relations.loading = true
      })
      .addCase(addClassroom.fulfilled, state => {
        state.classroom_add.status = 'success'
        state.classroom_add.error = null
        state.classroom_add.loading = false
      })
      .addCase(addClassroom.rejected, (state, action) => {
        state.classroom_add.status = 'failed'
        state.classroom_add.error = action.payload as ErrorType
        state.classroom_add.loading = false
      })
      .addCase(addClassroom.pending, state => {
        state.classroom_add.status = 'loading'
        state.classroom_add.error = null
        state.classroom_add.loading = true
      })
      .addCase(deleteClassroom.fulfilled, state => {
        state.classroom_delete.status = 'success'
        state.classroom_delete.error = null
        state.classroom_delete.loading = false
      })
      .addCase(deleteClassroom.rejected, (state, action) => {
        state.classroom_delete.status = 'failed'
        state.classroom_delete.error = action.payload as ErrorType
        state.classroom_delete.loading = false
      })
      .addCase(deleteClassroom.pending, state => {
        state.classroom_delete.status = 'loading'
        state.classroom_delete.error = null
        state.classroom_delete.loading = true
      })
  }
})

export default appClassroomsSlice.reducer
