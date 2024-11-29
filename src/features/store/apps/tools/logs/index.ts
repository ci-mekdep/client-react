// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  ip?: string
  date_range?: string[]
  user_id?: string
  subject_name?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Logs
export const fetchLogs = createAsyncThunk('appLogs/fetchLogs', async (params: DataParams, { rejectWithValue }) => {
  if (params.is_list && cancelSource) {
    cancelSource.cancel('Operation canceled due to new request.')
  }

  if (params.is_list) cancelSource = axios.CancelToken.source()

  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/logs', {
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

export const appLogsSlice = createSlice({
  name: 'appLogs',
  initialState: {
    logs_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.logs_list.status = 'success'
        state.logs_list.data = action.payload.items
        state.logs_list.total = action.payload.total
        state.logs_list.error = null
        state.logs_list.loading = false
      })
      .addCase(fetchLogs.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.logs_list.status = 'failed'
          state.logs_list.error = action.payload as ErrorType
          state.logs_list.loading = false
        }
      })
      .addCase(fetchLogs.pending, state => {
        state.logs_list.status = 'loading'
        state.logs_list.error = null
        state.logs_list.loading = true
      })
  }
})

export default appLogsSlice.reducer
