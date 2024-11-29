// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { SchoolListType } from 'src/entities/school/SchoolType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

type ParamsType = {
  code?: string
}

// ** Fetch Regions
export const fetchPublicRegions = createAsyncThunk(
  'appPublicRegions/fetchPublicRegions',
  async (params: ParamsType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/public/regions')

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

// ** Fetch Regions V2
export const fetchPublicRegionsV2 = createAsyncThunk(
  'appPublicRegions/fetchPublicRegionsV2',
  async (params: ParamsType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/public/regions/v2', {
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

export const appRegionsSlice = createSlice({
  name: 'appPublicRegions',
  initialState: {
    public_regions: {
      data: [] as SchoolListType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    public_regions_v2: {
      data: [] as SchoolListType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPublicRegions.fulfilled, (state, action) => {
        state.public_regions.status = 'success'
        state.public_regions.data = action.payload.regions
        state.public_regions.total = action.payload.total
        state.public_regions.error = null
        state.public_regions.loading = false
      })
      .addCase(fetchPublicRegions.rejected, (state, action) => {
        state.public_regions.status = 'failed'
        state.public_regions.error = action.payload as ErrorType
        state.public_regions.loading = false
      })
      .addCase(fetchPublicRegions.pending, state => {
        state.public_regions.status = 'loading'
        state.public_regions.error = null
        state.public_regions.loading = true
      })
      .addCase(fetchPublicRegionsV2.fulfilled, (state, action) => {
        state.public_regions_v2.status = 'success'
        state.public_regions_v2.data = action.payload.regions
        state.public_regions_v2.total = action.payload.total
        state.public_regions_v2.error = null
        state.public_regions_v2.loading = false
      })
      .addCase(fetchPublicRegionsV2.rejected, (state, action) => {
        state.public_regions_v2.status = 'failed'
        state.public_regions_v2.error = action.payload as ErrorType
        state.public_regions_v2.loading = false
      })
      .addCase(fetchPublicRegionsV2.pending, state => {
        state.public_regions_v2.status = 'loading'
        state.public_regions_v2.error = null
        state.public_regions_v2.loading = true
      })
  }
})

export default appRegionsSlice.reducer
