// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

// ** Fetch Rating
export const fetchRating = createAsyncThunk('appRating/fetchRating', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/rating/school')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

export const appRatingSlice = createSlice({
  name: 'appRating',
  initialState: {
    rating_list: {
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
      .addCase(fetchRating.fulfilled, (state, action) => {
        state.rating_list.status = 'success'
        state.rating_list.data = action.payload.rating
        state.rating_list.total = action.payload.total
        state.rating_list.error = null
        state.rating_list.loading = false
      })
      .addCase(fetchRating.rejected, (state, action) => {
        state.rating_list.status = 'failed'
        state.rating_list.error = action.payload as ErrorType
        state.rating_list.loading = false
      })
      .addCase(fetchRating.pending, state => {
        state.rating_list.status = 'loading'
        state.rating_list.error = null
        state.rating_list.loading = true
      })
  }
})

export default appRatingSlice.reducer
