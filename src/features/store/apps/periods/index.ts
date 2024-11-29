// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { PeriodCreateType } from 'src/entities/school/PeriodType'
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

// ** Fetch Periods
export const fetchPeriods = createAsyncThunk(
  'appPeriod/fetchPeriods',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/periods', {
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

// ** Get Current Period
export const getCurrentPeriod = createAsyncThunk('appPeriod/selectPeriod', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/periods/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit Period
export const updatePeriod = createAsyncThunk(
  'appPeriod/updatePeriod',
  async (data: PeriodCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/periods/${data.id}`, data)

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

// ** Add Period
export const addPeriod = createAsyncThunk(
  'appPeriod/addPeriod',
  async (data: PeriodCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/periods', data)

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

// ** Delete Period
export const deletePeriod = createAsyncThunk('appPeriod/deletePeriod', async (ids: string[], { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/periods', {
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

export const appPeriodsSlice = createSlice({
  name: 'appPeriod',
  initialState: {
    periods_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    period_detail: {
      data: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    period_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    period_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    period_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPeriods.fulfilled, (state, action) => {
        state.periods_list.status = 'success'
        state.periods_list.data = action.payload.periods
        state.periods_list.total = action.payload.total
        state.periods_list.error = null
        state.periods_list.loading = false
      })
      .addCase(fetchPeriods.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.periods_list.status = 'failed'
          state.periods_list.error = action.payload as ErrorType
          state.periods_list.loading = false
        }
      })
      .addCase(fetchPeriods.pending, state => {
        state.periods_list.status = 'loading'
        state.periods_list.error = null
        state.periods_list.loading = true
      })
      .addCase(getCurrentPeriod.fulfilled, (state, action) => {
        state.period_detail.status = 'success'
        state.period_detail.data = action.payload.period
        state.period_detail.error = null
        state.period_detail.loading = false
      })
      .addCase(getCurrentPeriod.rejected, (state, action) => {
        state.period_detail.status = 'failed'
        state.period_detail.error = action.payload as ErrorType
        state.period_detail.loading = false
      })
      .addCase(getCurrentPeriod.pending, state => {
        state.period_detail.status = 'loading'
        state.period_detail.error = null
        state.period_detail.loading = true
      })
      .addCase(updatePeriod.fulfilled, state => {
        state.period_update.status = 'success'
        state.period_update.error = null
        state.period_update.loading = false
      })
      .addCase(updatePeriod.rejected, (state, action) => {
        state.period_update.status = 'failed'
        state.period_update.error = action.payload as ErrorType
        state.period_update.loading = false
      })
      .addCase(updatePeriod.pending, state => {
        state.period_update.status = 'loading'
        state.period_update.error = null
        state.period_update.loading = true
      })
      .addCase(addPeriod.fulfilled, state => {
        state.period_add.status = 'success'
        state.period_add.error = null
        state.period_add.loading = false
      })
      .addCase(addPeriod.rejected, (state, action) => {
        state.period_add.status = 'failed'
        state.period_add.error = action.payload as ErrorType
        state.period_add.loading = false
      })
      .addCase(addPeriod.pending, state => {
        state.period_add.status = 'loading'
        state.period_add.error = null
        state.period_add.loading = true
      })
      .addCase(deletePeriod.fulfilled, state => {
        state.period_delete.status = 'success'
        state.period_delete.error = null
        state.period_delete.loading = false
      })
      .addCase(deletePeriod.rejected, (state, action) => {
        state.period_delete.status = 'failed'
        state.period_delete.error = action.payload as ErrorType
        state.period_delete.loading = false
      })
      .addCase(deletePeriod.pending, state => {
        state.period_delete.status = 'loading'
        state.period_delete.error = null
        state.period_delete.loading = true
      })
  }
})

export default appPeriodsSlice.reducer
