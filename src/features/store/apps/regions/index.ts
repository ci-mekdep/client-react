// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Fetch Regions
export const fetchRegions = createAsyncThunk('appRegions/fetchRegions', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/schools/regions')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Fetch Regions Lite
export const fetchRegionsLite = createAsyncThunk('appRegions/fetchRegionsLite', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/schools/regions/values')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

export const appRegionsSlice = createSlice({
  name: 'appRegions',
  initialState: {
    region_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    region_lite_list: {
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
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.region_list.status = 'success'
        state.region_list.data = action.payload.regions
        state.region_list.total = action.payload.total
        state.region_list.error = null
        state.region_list.loading = false
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.region_list.status = 'failed'
        state.region_list.error = action.payload as ErrorType
        state.region_list.loading = false
      })
      .addCase(fetchRegions.pending, state => {
        state.region_list.status = 'loading'
        state.region_list.error = null
        state.region_list.loading = true
      })
      .addCase(fetchRegionsLite.fulfilled, (state, action) => {
        state.region_lite_list.status = 'success'
        state.region_lite_list.data = action.payload.regions
        state.region_lite_list.total = action.payload.total
        state.region_lite_list.error = null
        state.region_lite_list.loading = false
      })
      .addCase(fetchRegionsLite.rejected, (state, action) => {
        state.region_lite_list.status = 'failed'
        state.region_lite_list.error = action.payload as ErrorType
        state.region_lite_list.loading = false
      })
      .addCase(fetchRegionsLite.pending, state => {
        state.region_lite_list.status = 'loading'
        state.region_lite_list.error = null
        state.region_lite_list.loading = true
      })
  }
})

export default appRegionsSlice.reducer
