// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'

// ** Type Imports
import { SubjectExamCreateType } from 'src/entities/classroom/SubjectType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  limit?: number
  offset?: number
  search?: string
  teacher_ids?: string[]
}

interface DetailDataParams {
  subject_id?: string
}

// ** Fetch Subject Exams
export const fetchSubjectExams = createAsyncThunk(
  'appSubjectExam/fetchSubjectExams',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/exams', {
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

// ** Get Current Subject Exam
export const getCurrentSubjectExam = createAsyncThunk(
  'appSubjectExam/selectSubjectExam',
  async (params: DetailDataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/exams', {
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

// ** Edit Subject Exam
export const updateSubjectExam = createAsyncThunk(
  'appSubjectExam/updateSubjectExam',
  async (data: SubjectExamCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/subjects/exams/${data.id}`,
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

// ** Add Subject Exam
export const addSubjectExam = createAsyncThunk(
  'appSubjectExam/addSubjectExam',
  async (data: SubjectExamCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/exams', data)

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

// ** Delete Subject Exam
export const deleteSubjectExam = createAsyncThunk(
  'appSubjectExam/deleteSubjectExam',
  async (ids: string[], { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/subjects/exams', {
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

export const appSubjectExamsSlice = createSlice({
  name: 'appSubjectExam',
  initialState: {
    subject_exams_list: {
      data: [],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_exam_detail: {
      data: [],
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_exam_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_exam_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    subject_exam_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSubjectExams.fulfilled, (state, action) => {
        state.subject_exams_list.status = 'success'
        state.subject_exams_list.data = action.payload.subject_exams
        state.subject_exams_list.total = action.payload.total
        state.subject_exams_list.error = null
        state.subject_exams_list.loading = false
      })
      .addCase(fetchSubjectExams.rejected, (state, action) => {
        state.subject_exams_list.status = 'failed'
        state.subject_exams_list.error = action.payload as ErrorType
        state.subject_exams_list.loading = false
      })
      .addCase(fetchSubjectExams.pending, state => {
        state.subject_exams_list.status = 'loading'
        state.subject_exams_list.error = null
        state.subject_exams_list.loading = true
      })
      .addCase(getCurrentSubjectExam.fulfilled, (state, action) => {
        state.subject_exam_detail.status = 'success'
        state.subject_exam_detail.data = action.payload.subject_exams
        state.subject_exam_detail.error = null
        state.subject_exam_detail.loading = false
      })
      .addCase(getCurrentSubjectExam.rejected, (state, action) => {
        state.subject_exam_detail.status = 'failed'
        state.subject_exam_detail.error = action.payload as ErrorType
        state.subject_exam_detail.loading = false
      })
      .addCase(getCurrentSubjectExam.pending, state => {
        state.subject_exam_detail.status = 'loading'
        state.subject_exam_detail.error = null
        state.subject_exam_detail.loading = true
      })
      .addCase(updateSubjectExam.fulfilled, state => {
        state.subject_exam_update.status = 'success'
        state.subject_exam_update.error = null
        state.subject_exam_update.loading = false
      })
      .addCase(updateSubjectExam.rejected, (state, action) => {
        state.subject_exam_update.status = 'failed'
        state.subject_exam_update.error = action.payload as ErrorType
        state.subject_exam_update.loading = false
      })
      .addCase(updateSubjectExam.pending, state => {
        state.subject_exam_update.status = 'loading'
        state.subject_exam_update.error = null
        state.subject_exam_update.loading = true
      })
      .addCase(addSubjectExam.fulfilled, state => {
        state.subject_exam_add.status = 'success'
        state.subject_exam_add.error = null
        state.subject_exam_add.loading = false
      })
      .addCase(addSubjectExam.rejected, (state, action) => {
        state.subject_exam_add.status = 'failed'
        state.subject_exam_add.error = action.payload as ErrorType
        state.subject_exam_add.loading = false
      })
      .addCase(addSubjectExam.pending, state => {
        state.subject_exam_add.status = 'loading'
        state.subject_exam_add.error = null
        state.subject_exam_add.loading = true
      })
      .addCase(deleteSubjectExam.fulfilled, state => {
        state.subject_exam_delete.status = 'success'
        state.subject_exam_delete.error = null
        state.subject_exam_delete.loading = false
      })
      .addCase(deleteSubjectExam.rejected, (state, action) => {
        state.subject_exam_delete.status = 'failed'
        state.subject_exam_delete.error = action.payload as ErrorType
        state.subject_exam_delete.loading = false
      })
      .addCase(deleteSubjectExam.pending, state => {
        state.subject_exam_delete.status = 'loading'
        state.subject_exam_delete.error = null
        state.subject_exam_delete.loading = true
      })
  }
})

export default appSubjectExamsSlice.reducer
