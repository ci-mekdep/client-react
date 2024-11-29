// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

type PageType = {
  content: string
  title: string
}

type SettingsPagesType = {
  rules: PageType
  privacy: PageType
}

// ** Fetch Settings Pages
export const fetchSettingsPages = createAsyncThunk(
  'appSettingsPages/fetchSettingsPages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/settings/pages')

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

export const appSettingsPagesSlice = createSlice({
  name: 'appSettingsPages',
  initialState: {
    pages: {
      data: {} as SettingsPagesType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSettingsPages.fulfilled, (state, action) => {
        state.pages.status = 'success'
        state.pages.data = action.payload.settings
        state.pages.error = null
        state.pages.loading = false
      })
      .addCase(fetchSettingsPages.rejected, (state, action) => {
        state.pages.status = 'failed'
        state.pages.error = action.payload as ErrorType
        state.pages.loading = false
      })
      .addCase(fetchSettingsPages.pending, state => {
        state.pages.status = 'loading'
        state.pages.error = null
        state.pages.loading = true
      })
  }
})

export default appSettingsPagesSlice.reducer
