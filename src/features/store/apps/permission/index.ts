// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Fetch Permissions
export const fetchPermissions = createAsyncThunk('appPermission/fetchPermissions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/permissions')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

export const appPermissionsSlice = createSlice({
  name: 'appPermission',
  initialState: {
    permissions_store: {
      permissions: {},
      permissions_write: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.permissions_store.status = 'success'
        state.permissions_store.permissions = action.payload.permissions
        state.permissions_store.permissions_write = action.payload.permissions_write
        state.permissions_store.error = null
        state.permissions_store.loading = false
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.permissions_store.status = 'failed'
        state.permissions_store.error = action.payload as ErrorType
        state.permissions_store.loading = false
      })
      .addCase(fetchPermissions.pending, state => {
        state.permissions_store.status = 'loading'
        state.permissions_store.error = null
        state.permissions_store.loading = true
      })
  }
})

export default appPermissionsSlice.reducer
