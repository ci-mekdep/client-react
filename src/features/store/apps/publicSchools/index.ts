// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

type ParamsType = {
  parent_id?: string
}

// ** Fetch Schools
export const fetchPublicSchools = createAsyncThunk(
  'appPublicSchools/fetchPublicSchools',
  async (params: ParamsType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/public/schools', { params })

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

export const appSchoolsSlice = createSlice({
  name: 'appPublicSchools',
  initialState: {
    public_schools_list: {
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
      .addCase(fetchPublicSchools.fulfilled, (state, action) => {
        state.public_schools_list.status = 'success'
        state.public_schools_list.data = action.payload.schools
        state.public_schools_list.total = action.payload.total
        state.public_schools_list.error = null
        state.public_schools_list.loading = false
      })
      .addCase(fetchPublicSchools.rejected, (state, action) => {
        state.public_schools_list.status = 'failed'
        state.public_schools_list.error = action.payload as ErrorType
        state.public_schools_list.loading = false
      })
      .addCase(fetchPublicSchools.pending, state => {
        state.public_schools_list.status = 'loading'
        state.public_schools_list.error = null
        state.public_schools_list.loading = true
      })
  }
})

export default appSchoolsSlice.reducer
