// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { AdminDashboardDataType } from 'src/entities/app/DashboardType'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface ParamsProp {
  start_date?: string | null
  end_date?: string | null
}

interface DetailParamsProp {
  start_date?: string | null
  end_date?: string | null
  school_id?: string
}

// ** Fetch Dashboard Stats
export const fetchDashboardsStats = createAsyncThunk(
  'appDashboard/fetchDashboardsStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/dashboards/v2')

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

// ** Fetch Dashboard Data
export const fetchDashboardsData = createAsyncThunk(
  'appDashboard/fetchDashboardsData',
  async (params: ParamsProp, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/dashboards/details/v2', {
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

// ** Fetch Dashboard Data Detail
export const fetchDashboardsDataDetail = createAsyncThunk(
  'appDashboard/fetchDashboardsDataDetail',
  async (params: DetailParamsProp, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/dashboards/details/v2', {
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

export const appDashboardSlice = createSlice({
  name: 'appDashboard',
  initialState: {
    dashboard_stats: {
      data: {},
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    dashboard_data: {
      data: {} as AdminDashboardDataType,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    dashboard_data_detail: {
      data: {} as AdminDashboardDataType,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchDashboardsStats.fulfilled, (state, action) => {
        state.dashboard_stats.status = 'success'
        state.dashboard_stats.data = action.payload.dashboards
        state.dashboard_stats.total = action.payload.total
        state.dashboard_stats.error = null
        state.dashboard_stats.loading = false
      })
      .addCase(fetchDashboardsStats.rejected, (state, action) => {
        state.dashboard_stats.status = 'failed'
        state.dashboard_stats.error = action.payload as ErrorType
        state.dashboard_stats.loading = false
      })
      .addCase(fetchDashboardsStats.pending, state => {
        state.dashboard_stats.status = 'loading'
        state.dashboard_stats.error = null
        state.dashboard_stats.loading = true
      })
      .addCase(fetchDashboardsData.fulfilled, (state, action) => {
        state.dashboard_data.status = 'success'
        state.dashboard_data.data = action.payload.dashboards
        state.dashboard_data.total = action.payload.total
        state.dashboard_data.error = null
        state.dashboard_data.loading = false
      })
      .addCase(fetchDashboardsData.rejected, (state, action) => {
        state.dashboard_data.status = 'failed'
        state.dashboard_data.error = action.payload as ErrorType
        state.dashboard_data.loading = false
      })
      .addCase(fetchDashboardsData.pending, state => {
        state.dashboard_data.status = 'loading'
        state.dashboard_data.error = null
        state.dashboard_data.loading = true
      })
      .addCase(fetchDashboardsDataDetail.fulfilled, (state, action) => {
        state.dashboard_data_detail.status = 'success'
        state.dashboard_data_detail.data = action.payload.dashboards
        state.dashboard_data_detail.total = action.payload.total
        state.dashboard_data_detail.error = null
        state.dashboard_data_detail.loading = false
      })
      .addCase(fetchDashboardsDataDetail.rejected, (state, action) => {
        state.dashboard_data_detail.status = 'failed'
        state.dashboard_data_detail.error = action.payload as ErrorType
        state.dashboard_data_detail.loading = false
      })
      .addCase(fetchDashboardsDataDetail.pending, state => {
        state.dashboard_data_detail.status = 'loading'
        state.dashboard_data_detail.error = null
        state.dashboard_data_detail.loading = true
      })
  }
})

export default appDashboardSlice.reducer
