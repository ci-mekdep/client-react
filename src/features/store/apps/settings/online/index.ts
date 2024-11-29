// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface Params {
  school_id?: string
}

// ** Fetch Settings Online
export const fetchSettingsOnline = createAsyncThunk(
  'appSettingsOnline/fetchSettingsOnline',
  async (params: Params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/settings/online', {
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

export const appSettingsOnlineSlice = createSlice({
  name: 'appSettingsOnline',
  initialState: {
    online: {
      data: {} as { online_count: number },
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSettingsOnline.fulfilled, (state, action) => {
        state.online.status = 'success'
        state.online.data = action.payload
        state.online.error = null
        state.online.loading = false
      })
      .addCase(fetchSettingsOnline.rejected, (state, action) => {
        state.online.status = 'failed'
        state.online.error = action.payload as ErrorType
        state.online.loading = false
      })
      .addCase(fetchSettingsOnline.pending, state => {
        state.online.status = 'loading'
        state.online.error = null
        state.online.loading = true
      })
  }
})

export default appSettingsOnlineSlice.reducer
