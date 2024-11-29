// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { SchoolTransferType, SchoolTransferUpdateType } from 'src/entities/app/SchoolTransferType'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource
let cancelSourceInbox: CancelTokenSource

// ** Fetch School Transfers
export const fetchSchoolTransfers = createAsyncThunk(
  'appSchoolTransfers/fetchSchoolTransfers',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/school-transfers', {
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

// ** Fetch Inbox School Transfers
export const fetchInboxSchoolTransfers = createAsyncThunk(
  'appSchoolTransfers/fetchInboxSchoolTransfers',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSourceInbox) {
      cancelSourceInbox.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSourceInbox = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/school-transfers/inbox', {
        params,
        cancelToken: params.is_list ? cancelSourceInbox.token : undefined
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

// ** Get Current School Transfer
export const getCurrentSchoolTransfer = createAsyncThunk(
  'appSchoolTransfers/selectSchoolTransfer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/school-transfers/${id}`)

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

// ** Get Current Inbox School Transfer
export const getCurrentInboxSchoolTransfer = createAsyncThunk(
  'appSchoolTransfers/selectInboxSchoolTransfer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/school-transfers/inbox/${id}`)

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

// ** Edit School Transfer
export const updateSchoolTransfer = createAsyncThunk(
  'appSchoolTransfers/updateSchoolTransfer',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/school-transfers/${id}`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )

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

// ** Add School Transfer
export const addSchoolTransfer = createAsyncThunk(
  'appSchoolTransfers/addSchoolTransfer',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/school-transfers', data, {
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

// ** Delete School Transfer
export const deleteSchoolTransfer = createAsyncThunk(
  'appSchoolTransfers/deleteSchoolTransfer',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/school-transfers', {
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

// ** Edit Inbox School Transfer
export const updateInboxSchoolTransfer = createAsyncThunk(
  'appSchoolTransfers/updateInboxSchoolTransfer',
  async ({ data, id }: { data: SchoolTransferUpdateType; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/school-transfers/inbox/${id}/status`,
        data
      )

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

export const appSchoolTransfersSlice = createSlice({
  name: 'appSchoolTransfers',
  initialState: {
    school_transfers_list: {
      data: [] as SchoolTransferType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfers_inbox_list: {
      data: [] as SchoolTransferType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfer_detail: {
      data: {} as SchoolTransferType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfer_inbox_detail: {
      data: {} as SchoolTransferType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfer_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfer_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfer_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    school_transfer_inbox_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSchoolTransfers.fulfilled, (state, action) => {
        state.school_transfers_list.status = 'success'
        state.school_transfers_list.data = action.payload.school_transfers
        state.school_transfers_list.total = action.payload.total
        state.school_transfers_list.error = null
        state.school_transfers_list.loading = false
      })
      .addCase(fetchSchoolTransfers.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.school_transfers_list.status = 'failed'
          state.school_transfers_list.error = action.payload as ErrorType
          state.school_transfers_list.loading = false
        }
      })
      .addCase(fetchSchoolTransfers.pending, state => {
        state.school_transfers_list.status = 'loading'
        state.school_transfers_list.error = null
        state.school_transfers_list.loading = true
      })
      .addCase(fetchInboxSchoolTransfers.fulfilled, (state, action) => {
        state.school_transfers_inbox_list.status = 'success'
        state.school_transfers_inbox_list.data = action.payload.school_transfers
        state.school_transfers_inbox_list.total = action.payload.total
        state.school_transfers_inbox_list.error = null
        state.school_transfers_inbox_list.loading = false
      })
      .addCase(fetchInboxSchoolTransfers.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.school_transfers_inbox_list.status = 'failed'
          state.school_transfers_inbox_list.error = action.payload as ErrorType
          state.school_transfers_inbox_list.loading = false
        }
      })
      .addCase(fetchInboxSchoolTransfers.pending, state => {
        state.school_transfers_inbox_list.status = 'loading'
        state.school_transfers_inbox_list.error = null
        state.school_transfers_inbox_list.loading = true
      })
      .addCase(getCurrentSchoolTransfer.fulfilled, (state, action) => {
        state.school_transfer_detail.status = 'success'
        state.school_transfer_detail.data = action.payload.school_transfer
        state.school_transfer_detail.error = null
        state.school_transfer_detail.loading = false
      })
      .addCase(getCurrentSchoolTransfer.rejected, (state, action) => {
        state.school_transfer_detail.status = 'failed'
        state.school_transfer_detail.error = action.payload as ErrorType
        state.school_transfer_detail.loading = false
      })
      .addCase(getCurrentSchoolTransfer.pending, state => {
        state.school_transfer_detail.status = 'loading'
        state.school_transfer_detail.error = null
        state.school_transfer_detail.loading = true
      })
      .addCase(getCurrentInboxSchoolTransfer.fulfilled, (state, action) => {
        state.school_transfer_inbox_detail.status = 'success'
        state.school_transfer_inbox_detail.data = action.payload.school_transfer
        state.school_transfer_inbox_detail.error = null
        state.school_transfer_inbox_detail.loading = false
      })
      .addCase(getCurrentInboxSchoolTransfer.rejected, (state, action) => {
        state.school_transfer_inbox_detail.status = 'failed'
        state.school_transfer_inbox_detail.error = action.payload as ErrorType
        state.school_transfer_inbox_detail.loading = false
      })
      .addCase(getCurrentInboxSchoolTransfer.pending, state => {
        state.school_transfer_inbox_detail.status = 'loading'
        state.school_transfer_inbox_detail.error = null
        state.school_transfer_inbox_detail.loading = true
      })
      .addCase(updateSchoolTransfer.fulfilled, state => {
        state.school_transfer_update.status = 'success'
        state.school_transfer_update.error = null
        state.school_transfer_update.loading = false
      })
      .addCase(updateSchoolTransfer.rejected, (state, action) => {
        state.school_transfer_update.status = 'failed'
        state.school_transfer_update.error = action.payload as ErrorType
        state.school_transfer_update.loading = false
      })
      .addCase(updateSchoolTransfer.pending, state => {
        state.school_transfer_update.status = 'loading'
        state.school_transfer_update.error = null
        state.school_transfer_update.loading = true
      })
      .addCase(addSchoolTransfer.fulfilled, state => {
        state.school_transfer_add.status = 'success'
        state.school_transfer_add.error = null
        state.school_transfer_add.loading = false
      })
      .addCase(addSchoolTransfer.rejected, (state, action) => {
        state.school_transfer_add.status = 'failed'
        state.school_transfer_add.error = action.payload as ErrorType
        state.school_transfer_add.loading = false
      })
      .addCase(addSchoolTransfer.pending, state => {
        state.school_transfer_add.status = 'loading'
        state.school_transfer_add.error = null
        state.school_transfer_add.loading = true
      })
      .addCase(deleteSchoolTransfer.fulfilled, state => {
        state.school_transfer_delete.status = 'success'
        state.school_transfer_delete.error = null
        state.school_transfer_delete.loading = false
      })
      .addCase(deleteSchoolTransfer.rejected, (state, action) => {
        state.school_transfer_delete.status = 'failed'
        state.school_transfer_delete.error = action.payload as ErrorType
        state.school_transfer_delete.loading = false
      })
      .addCase(deleteSchoolTransfer.pending, state => {
        state.school_transfer_delete.status = 'loading'
        state.school_transfer_delete.error = null
        state.school_transfer_delete.loading = true
      })
      .addCase(updateInboxSchoolTransfer.fulfilled, state => {
        state.school_transfer_inbox_update.status = 'success'
        state.school_transfer_inbox_update.error = null
        state.school_transfer_inbox_update.loading = false
      })
      .addCase(updateInboxSchoolTransfer.rejected, (state, action) => {
        state.school_transfer_inbox_update.status = 'failed'
        state.school_transfer_inbox_update.error = action.payload as ErrorType
        state.school_transfer_inbox_update.loading = false
      })
      .addCase(updateInboxSchoolTransfer.pending, state => {
        state.school_transfer_inbox_update.status = 'loading'
        state.school_transfer_inbox_update.error = null
        state.school_transfer_inbox_update.loading = true
      })
  }
})

export default appSchoolTransfersSlice.reducer
