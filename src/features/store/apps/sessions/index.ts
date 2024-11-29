// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Fetch Sessions
export const fetchSessions = createAsyncThunk('appSession/fetchSessions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/sessions')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Delete Session
export const deleteSession = createAsyncThunk(
  'appSession/deleteSession',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/sessions', {
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

export const appSessionsSlice = createSlice({
  name: 'appSession',
  initialState: {
    sessions_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    delete_session: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.sessions_list.status = 'success'
        state.sessions_list.data = action.payload.session
        state.sessions_list.total = action.payload.total
        state.sessions_list.error = null
        state.sessions_list.loading = false
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.sessions_list.status = 'failed'
        state.sessions_list.error = action.payload as ErrorType
        state.sessions_list.loading = false
      })
      .addCase(fetchSessions.pending, state => {
        state.sessions_list.status = 'loading'
        state.sessions_list.error = null
        state.sessions_list.loading = true
      })
      .addCase(deleteSession.fulfilled, state => {
        state.delete_session.status = 'success'
        state.delete_session.error = null
        state.delete_session.loading = false
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.delete_session.status = 'failed'
        state.delete_session.error = action.payload as ErrorType
        state.delete_session.loading = false
      })
      .addCase(deleteSession.pending, state => {
        state.delete_session.status = 'loading'
        state.delete_session.error = null
        state.delete_session.loading = true
      })
  }
})

export default appSessionsSlice.reducer
