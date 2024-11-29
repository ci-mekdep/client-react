// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
  status?: string
  bank_type?: string
  school_id?: string
  tariff_type?: string
  payer_id?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Payments
export const fetchPayments = createAsyncThunk(
  'appPayments/fetchPayments',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/payment', {
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

// ** Fetch Payment Report
export const fetchPaymentReport = createAsyncThunk(
  'appPayments/fetchPaymentReport',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/reports/payments', {
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

// ** Get Current Payment
export const getCurrentPayment = createAsyncThunk(
  'appPayments/selectPayment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/payment/${id}`)

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

export const appPaymentsSlice = createSlice({
  name: 'appPayments',
  initialState: {
    payments_list: {
      data: [],
      total: 0,
      total_amount: {},
      total_transactions: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    payment_report: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    payment_detail: {
      data: {},
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.payments_list.status = 'success'
        state.payments_list.data = action.payload.transactions
        state.payments_list.total = action.payload.total
        state.payments_list.total_amount = action.payload.total_amount
        state.payments_list.total_transactions = action.payload.total_transactions
        state.payments_list.error = null
        state.payments_list.loading = false
      })
      .addCase(fetchPayments.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.payments_list.status = 'failed'
          state.payments_list.error = action.payload as ErrorType
          state.payments_list.loading = false
        }
      })
      .addCase(fetchPayments.pending, state => {
        state.payments_list.status = 'loading'
        state.payments_list.error = null
        state.payments_list.loading = true
      })
      .addCase(fetchPaymentReport.fulfilled, (state, action) => {
        state.payment_report.status = 'success'
        state.payment_report.data = action.payload.report_payments
        state.payment_report.total = action.payload.total
        state.payment_report.error = null
        state.payment_report.loading = false
      })
      .addCase(fetchPaymentReport.rejected, (state, action) => {
        state.payment_report.status = 'failed'
        state.payment_report.error = action.payload as ErrorType
        state.payment_report.loading = false
      })
      .addCase(fetchPaymentReport.pending, state => {
        state.payment_report.status = 'loading'
        state.payment_report.error = null
        state.payment_report.loading = true
      })
      .addCase(getCurrentPayment.fulfilled, (state, action) => {
        state.payment_detail.status = 'success'
        state.payment_detail.data = action.payload.transaction
        state.payment_detail.error = null
        state.payment_detail.loading = false
      })
      .addCase(getCurrentPayment.rejected, (state, action) => {
        state.payment_detail.status = 'failed'
        state.payment_detail.error = action.payload as ErrorType
        state.payment_detail.loading = false
      })
      .addCase(getCurrentPayment.pending, state => {
        state.payment_detail.status = 'loading'
        state.payment_detail.error = null
        state.payment_detail.loading = true
      })
  }
})

export default appPaymentsSlice.reducer
