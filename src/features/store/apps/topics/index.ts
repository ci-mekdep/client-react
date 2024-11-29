// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { TopicType } from 'src/entities/journal/TopicType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
  classyear?: number
  subject?: string
  level?: string
  period?: number
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Topics
export const fetchTopics = createAsyncThunk('appTopic/fetchTopics', async (params: DataParams, { rejectWithValue }) => {
  if (params.is_list && cancelSource) {
    cancelSource.cancel('Operation canceled due to new request.')
  }

  if (params.is_list) cancelSource = axios.CancelToken.source()

  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/topics', {
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
})

// ** Get Current Topic
export const getCurrentTopic = createAsyncThunk('appTopic/selectTopic', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/topics/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit Topic
export const updateTopic = createAsyncThunk(
  'appTopic/updateTopic',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/topics/${id}`, data, {
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

// ** Add Topic
export const addTopic = createAsyncThunk('appTopic/addTopic', async (data: FormData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/topics', data, {
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

// ** Add Multiple Topic
export const addMultipleTopic = createAsyncThunk(
  'appTopic/addMultipleTopics',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/topics/batch', data)

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

// ** Delete Topic
export const deleteTopic = createAsyncThunk('appTopic/deleteTopic', async (ids: string[], { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/topics', {
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

export const appTopicsSlice = createSlice({
  name: 'appTopic',
  initialState: {
    topics_list: {
      data: [] as TopicType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    topic_detail: {
      data: {} as TopicType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    topic_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    topic_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    topic_add_multiple: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    topic_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.topics_list.status = 'success'
        state.topics_list.data = action.payload.topics
        state.topics_list.total = action.payload.total
        state.topics_list.error = null
        state.topics_list.loading = false
      })
      .addCase(fetchTopics.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.topics_list.status = 'failed'
          state.topics_list.error = action.payload as ErrorType
          state.topics_list.loading = false
        }
      })
      .addCase(fetchTopics.pending, state => {
        state.topics_list.status = 'loading'
        state.topics_list.error = null
        state.topics_list.loading = true
      })
      .addCase(getCurrentTopic.fulfilled, (state, action) => {
        state.topic_detail.status = 'success'
        state.topic_detail.data = action.payload.topic
        state.topic_detail.error = null
        state.topic_detail.loading = false
      })
      .addCase(getCurrentTopic.rejected, (state, action) => {
        state.topic_detail.status = 'failed'
        state.topic_detail.error = action.payload as ErrorType
        state.topic_detail.loading = false
      })
      .addCase(getCurrentTopic.pending, state => {
        state.topic_detail.status = 'loading'
        state.topic_detail.error = null
        state.topic_detail.loading = true
      })
      .addCase(updateTopic.fulfilled, state => {
        state.topic_update.status = 'success'
        state.topic_update.error = null
        state.topic_update.loading = false
      })
      .addCase(updateTopic.rejected, (state, action) => {
        state.topic_update.status = 'failed'
        state.topic_update.error = action.payload as ErrorType
        state.topic_update.loading = false
      })
      .addCase(updateTopic.pending, state => {
        state.topic_update.status = 'loading'
        state.topic_update.error = null
        state.topic_update.loading = true
      })
      .addCase(addTopic.fulfilled, state => {
        state.topic_add.status = 'success'
        state.topic_add.error = null
        state.topic_add.loading = false
      })
      .addCase(addTopic.rejected, (state, action) => {
        state.topic_add.status = 'failed'
        state.topic_add.error = action.payload as ErrorType
        state.topic_add.loading = false
      })
      .addCase(addTopic.pending, state => {
        state.topic_add.status = 'loading'
        state.topic_add.error = null
        state.topic_add.loading = true
      })
      .addCase(addMultipleTopic.fulfilled, state => {
        state.topic_add_multiple.status = 'success'
        state.topic_add_multiple.error = null
        state.topic_add_multiple.loading = false
      })
      .addCase(addMultipleTopic.rejected, (state, action) => {
        state.topic_add_multiple.status = 'failed'
        state.topic_add_multiple.error = action.payload as ErrorType
        state.topic_add_multiple.loading = false
      })
      .addCase(addMultipleTopic.pending, state => {
        state.topic_add_multiple.status = 'loading'
        state.topic_add_multiple.error = null
        state.topic_add_multiple.loading = true
      })
      .addCase(deleteTopic.fulfilled, state => {
        state.topic_delete.status = 'success'
        state.topic_delete.error = null
        state.topic_delete.loading = false
      })
      .addCase(deleteTopic.rejected, (state, action) => {
        state.topic_delete.status = 'failed'
        state.topic_delete.error = action.payload as ErrorType
        state.topic_delete.loading = false
      })
      .addCase(deleteTopic.pending, state => {
        state.topic_delete.status = 'loading'
        state.topic_delete.error = null
        state.topic_delete.loading = true
      })
  }
})

export default appTopicsSlice.reducer
