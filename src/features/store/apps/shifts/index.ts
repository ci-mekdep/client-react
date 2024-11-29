// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { ShiftCreateType, ShiftType } from 'src/entities/classroom/ShiftType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Shifts
export const fetchShifts = createAsyncThunk('appShift/fetchShifts', async (params: DataParams, { rejectWithValue }) => {
  if (params.is_list && cancelSource) {
    cancelSource.cancel('Operation canceled due to new request.')
  }

  if (params.is_list) cancelSource = axios.CancelToken.source()

  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/shifts', {
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

// ** Get Current Shift
export const getCurrentShift = createAsyncThunk('appShift/selectShift', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/shifts/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit Shift
export const updateShift = createAsyncThunk(
  'appShift/updateShift',
  async (data: ShiftCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/shifts/${data.id}`, data)

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

// ** Add Shift
export const addShift = createAsyncThunk('appShift/addShift', async (data: ShiftCreateType, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/shifts', data)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Delete Shift
export const deleteShift = createAsyncThunk('appShift/deleteShift', async (ids: string[], { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/shifts', {
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

export const appShiftsSlice = createSlice({
  name: 'appShift',
  initialState: {
    shifts_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    shift_detail: {
      data: {} as ShiftType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    shift_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    shift_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    shift_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.shifts_list.status = 'success'
        state.shifts_list.data = action.payload.shifts
        state.shifts_list.total = action.payload.total
        state.shifts_list.error = null
        state.shifts_list.loading = false
      })
      .addCase(fetchShifts.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.shifts_list.status = 'failed'
          state.shifts_list.error = action.payload as ErrorType
          state.shifts_list.loading = false
        }
      })
      .addCase(fetchShifts.pending, state => {
        state.shifts_list.status = 'loading'
        state.shifts_list.error = null
        state.shifts_list.loading = true
      })
      .addCase(getCurrentShift.fulfilled, (state, action) => {
        state.shift_detail.status = 'success'
        state.shift_detail.data = action.payload.shift
        state.shift_detail.error = null
        state.shift_detail.loading = false
      })
      .addCase(getCurrentShift.rejected, (state, action) => {
        state.shift_detail.status = 'failed'
        state.shift_detail.error = action.payload as ErrorType
        state.shift_detail.loading = false
      })
      .addCase(getCurrentShift.pending, state => {
        state.shift_detail.status = 'loading'
        state.shift_detail.error = null
        state.shift_detail.loading = true
      })
      .addCase(updateShift.fulfilled, state => {
        state.shift_update.status = 'success'
        state.shift_update.error = null
        state.shift_update.loading = false
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.shift_update.status = 'failed'
        state.shift_update.error = action.payload as ErrorType
        state.shift_update.loading = false
      })
      .addCase(updateShift.pending, state => {
        state.shift_update.status = 'loading'
        state.shift_update.error = null
        state.shift_update.loading = true
      })
      .addCase(addShift.fulfilled, state => {
        state.shift_add.status = 'success'
        state.shift_add.error = null
        state.shift_add.loading = false
      })
      .addCase(addShift.rejected, (state, action) => {
        state.shift_add.status = 'failed'
        state.shift_add.error = action.payload as ErrorType
        state.shift_add.loading = false
      })
      .addCase(addShift.pending, state => {
        state.shift_add.status = 'loading'
        state.shift_add.error = null
        state.shift_add.loading = true
      })
      .addCase(deleteShift.fulfilled, state => {
        state.shift_delete.status = 'success'
        state.shift_delete.error = null
        state.shift_delete.loading = false
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.shift_delete.status = 'failed'
        state.shift_delete.error = action.payload as ErrorType
        state.shift_delete.loading = false
      })
      .addCase(deleteShift.pending, state => {
        state.shift_delete.status = 'loading'
        state.shift_delete.error = null
        state.shift_delete.loading = true
      })
  }
})

export default appShiftsSlice.reducer
