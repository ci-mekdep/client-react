// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ContactItemType } from 'src/entities/app/ContactItemsType'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
  type?: string
  status?: string
  user_id?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource
let cancelReportSource: CancelTokenSource

// ** Fetch Contact Items
export const fetchContactItems = createAsyncThunk(
  'appContactItems/fetchContactItems',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/contact-items', {
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

// ** Get Current Contact Item
export const getCurrentContactItem = createAsyncThunk(
  'appContactItems/selectContactItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/contact-items/${id}`)

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

// ** Edit Contact Item
export const updateContactItem = createAsyncThunk(
  'appContactItems/updateContactItem',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/contact-items/${id}`, data, {
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

// ** Fetch Contact Items Report
export const getContactItemsReport = createAsyncThunk(
  'appContactItems/getContactItemsReport',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelReportSource) {
      cancelReportSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelReportSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/contact-items', {
        params,
        cancelToken: params.is_list ? cancelReportSource.token : undefined
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

export const appContactItemsSlice = createSlice({
  name: 'appContactItems',
  initialState: {
    contact_items_list: {
      data: [] as ContactItemType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    contact_item_detail: {
      data: {} as ContactItemType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    contact_item_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    contact_item_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    contact_items_report: {
      data: [] as ContactItemType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchContactItems.fulfilled, (state, action) => {
        state.contact_items_list.status = 'success'
        state.contact_items_list.data = action.payload.contact_items
        state.contact_items_list.total = action.payload.total
        state.contact_items_list.error = null
        state.contact_items_list.loading = false
      })
      .addCase(fetchContactItems.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.contact_items_list.status = 'failed'
          state.contact_items_list.error = action.payload as ErrorType
          state.contact_items_list.loading = false
        }
      })
      .addCase(fetchContactItems.pending, state => {
        state.contact_items_list.status = 'loading'
        state.contact_items_list.error = null
        state.contact_items_list.loading = true
      })
      .addCase(getCurrentContactItem.fulfilled, (state, action) => {
        state.contact_item_detail.status = 'success'
        state.contact_item_detail.data = action.payload.contact_item
        state.contact_item_detail.error = null
        state.contact_item_detail.loading = false
      })
      .addCase(getCurrentContactItem.rejected, (state, action) => {
        state.contact_item_detail.status = 'failed'
        state.contact_item_detail.error = action.payload as ErrorType
        state.contact_item_detail.loading = false
      })
      .addCase(getCurrentContactItem.pending, state => {
        state.contact_item_detail.status = 'loading'
        state.contact_item_detail.error = null
        state.contact_item_detail.loading = true
      })
      .addCase(updateContactItem.fulfilled, state => {
        state.contact_item_update.status = 'success'
        state.contact_item_update.error = null
        state.contact_item_update.loading = false
      })
      .addCase(updateContactItem.rejected, (state, action) => {
        state.contact_item_update.status = 'failed'
        state.contact_item_update.error = action.payload as ErrorType
        state.contact_item_update.loading = false
      })
      .addCase(updateContactItem.pending, state => {
        state.contact_item_update.status = 'loading'
        state.contact_item_update.error = null
        state.contact_item_update.loading = true
      })
      .addCase(getContactItemsReport.fulfilled, (state, action) => {
        state.contact_items_report.status = 'success'
        state.contact_items_report.data = action.payload.report_contact_items
        state.contact_items_report.total = action.payload.total
        state.contact_items_report.error = null
        state.contact_items_report.loading = false
      })
      .addCase(getContactItemsReport.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.contact_items_report.status = 'failed'
          state.contact_items_report.error = action.payload as ErrorType
          state.contact_items_report.loading = false
        }
      })
      .addCase(getContactItemsReport.pending, state => {
        state.contact_items_report.status = 'loading'
        state.contact_items_report.error = null
        state.contact_items_report.loading = true
      })
  }
})

export default appContactItemsSlice.reducer
