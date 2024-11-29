// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import {
  ReportFormCreateType,
  ReportFormRatingType,
  ReportFormSubmitType,
  ReportFormType
} from 'src/entities/app/ReportFormType'

// ** Type Imports
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  search?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Report Forms
export const fetchReportForms = createAsyncThunk(
  'appReportForms/fetchReportForms',
  async (params: DataParams, { rejectWithValue }) => {
    if (params.is_list && cancelSource) {
      cancelSource.cancel('Operation canceled due to new request.')
    }

    if (params.is_list) cancelSource = axios.CancelToken.source()

    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/report-forms', {
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

// ** Fetch Unfilled Report Forms
export const fetchUnfilledReportForms = createAsyncThunk(
  'appReportForms/fetchUnfilledReportForms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/report-forms/total')

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

// ** Get Current Report Forms
export const getCurrentReportForm = createAsyncThunk(
  'appReportForms/selectReportForm',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/report-forms/${id}`)

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

// ** Get Current Report Form Rating
export const getReportFormRating = createAsyncThunk(
  'appReportForms/getReportFormRating',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/report-forms/rating/${id}/center`
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

// ** Edit Report Form
export const updateReportForm = createAsyncThunk(
  'appReportForms/updateReportForm',
  async (data: ReportFormCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/report-forms/${data.id}`,
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

// ** Submit Report Form
export const submitReportForm = createAsyncThunk(
  'appReportForms/submitReportForm',
  async ({ data, id }: { data: ReportFormSubmitType; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/report-forms/items/${id}`,
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

// ** Add Report Form
export const addReportForm = createAsyncThunk(
  'appReportForms/addReportForm',
  async (data: ReportFormCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/report-forms', data)

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

// ** Delete Report Form
export const deleteReportForm = createAsyncThunk(
  'appReportForms/deleteReportForm',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/report-forms', {
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

export const appReportFormsSlice = createSlice({
  name: 'appReportForms',
  initialState: {
    report_forms_list: {
      data: [] as ReportFormType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_forms_unfilled: {
      data: {} as any,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_form_detail: {
      data: {} as ReportFormType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_form_rating: {
      data: {} as ReportFormRatingType,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_form_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_form_submit: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_form_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    report_form_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchReportForms.fulfilled, (state, action) => {
        state.report_forms_list.status = 'success'
        state.report_forms_list.data = action.payload.reports
        state.report_forms_list.total = action.payload.total
        state.report_forms_list.error = null
        state.report_forms_list.loading = false
      })
      .addCase(fetchReportForms.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.report_forms_list.status = 'failed'
          state.report_forms_list.error = action.payload as ErrorType
          state.report_forms_list.loading = false
        }
      })
      .addCase(fetchReportForms.pending, state => {
        state.report_forms_list.status = 'loading'
        state.report_forms_list.error = null
        state.report_forms_list.loading = true
      })
      .addCase(fetchUnfilledReportForms.fulfilled, (state, action) => {
        state.report_forms_unfilled.status = 'success'
        state.report_forms_unfilled.data = action.payload
        state.report_forms_unfilled.error = null
        state.report_forms_unfilled.loading = false
      })
      .addCase(fetchUnfilledReportForms.rejected, (state, action) => {
        state.report_forms_unfilled.status = 'failed'
        state.report_forms_unfilled.error = action.payload as ErrorType
        state.report_forms_unfilled.loading = false
      })
      .addCase(fetchUnfilledReportForms.pending, state => {
        state.report_forms_unfilled.status = 'loading'
        state.report_forms_unfilled.error = null
        state.report_forms_unfilled.loading = true
      })
      .addCase(getCurrentReportForm.fulfilled, (state, action) => {
        state.report_form_detail.status = 'success'
        state.report_form_detail.data = action.payload.report
        state.report_form_detail.error = null
        state.report_form_detail.loading = false
      })
      .addCase(getCurrentReportForm.rejected, (state, action) => {
        state.report_form_detail.status = 'failed'
        state.report_form_detail.error = action.payload as ErrorType
        state.report_form_detail.loading = false
      })
      .addCase(getCurrentReportForm.pending, state => {
        state.report_form_detail.status = 'loading'
        state.report_form_detail.error = null
        state.report_form_detail.loading = true
      })
      .addCase(getReportFormRating.fulfilled, (state, action) => {
        state.report_form_rating.status = 'success'
        state.report_form_rating.data = action.payload.report_rating
        state.report_form_rating.total = action.payload.total
        state.report_form_rating.error = null
        state.report_form_rating.loading = false
      })
      .addCase(getReportFormRating.rejected, (state, action) => {
        state.report_form_rating.status = 'failed'
        state.report_form_rating.error = action.payload as ErrorType
        state.report_form_rating.loading = false
      })
      .addCase(getReportFormRating.pending, state => {
        state.report_form_rating.status = 'loading'
        state.report_form_rating.error = null
        state.report_form_rating.loading = true
      })
      .addCase(updateReportForm.fulfilled, state => {
        state.report_form_update.status = 'success'
        state.report_form_update.error = null
        state.report_form_update.loading = false
      })
      .addCase(updateReportForm.rejected, (state, action) => {
        state.report_form_update.status = 'failed'
        state.report_form_update.error = action.payload as ErrorType
        state.report_form_update.loading = false
      })
      .addCase(updateReportForm.pending, state => {
        state.report_form_update.status = 'loading'
        state.report_form_update.error = null
        state.report_form_update.loading = true
      })
      .addCase(submitReportForm.fulfilled, state => {
        state.report_form_submit.status = 'success'
        state.report_form_submit.error = null
        state.report_form_submit.loading = false
      })
      .addCase(submitReportForm.rejected, (state, action) => {
        state.report_form_submit.status = 'failed'
        state.report_form_submit.error = action.payload as ErrorType
        state.report_form_submit.loading = false
      })
      .addCase(submitReportForm.pending, state => {
        state.report_form_submit.status = 'loading'
        state.report_form_submit.error = null
        state.report_form_submit.loading = true
      })
      .addCase(addReportForm.fulfilled, state => {
        state.report_form_add.status = 'success'
        state.report_form_add.error = null
        state.report_form_add.loading = false
      })
      .addCase(addReportForm.rejected, (state, action) => {
        state.report_form_add.status = 'failed'
        state.report_form_add.error = action.payload as ErrorType
        state.report_form_add.loading = false
      })
      .addCase(addReportForm.pending, state => {
        state.report_form_add.status = 'loading'
        state.report_form_add.error = null
        state.report_form_add.loading = true
      })
      .addCase(deleteReportForm.fulfilled, state => {
        state.report_form_delete.status = 'success'
        state.report_form_delete.error = null
        state.report_form_delete.loading = false
      })
      .addCase(deleteReportForm.rejected, (state, action) => {
        state.report_form_delete.status = 'failed'
        state.report_form_delete.error = action.payload as ErrorType
        state.report_form_delete.loading = false
      })
      .addCase(deleteReportForm.pending, state => {
        state.report_form_delete.status = 'loading'
        state.report_form_delete.error = null
        state.report_form_delete.loading = true
      })
  }
})

export default appReportFormsSlice.reducer
