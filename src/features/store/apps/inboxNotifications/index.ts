// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  limit?: number
  offset?: number
  ids?: string[] | string
  read?: number
}

// ** Fetch Inbox Notifications
export const fetchInboxNotifications = createAsyncThunk(
  'appInboxNotifications/fetchInboxNotifications',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/notifications', {
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

// ** Read Inbox Notifications
export const readInboxNotifications = createAsyncThunk(
  'appInboxNotifications/readInboxNotifications',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/notifications', {
        params,
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

// ** Reply Inbox Notification
export const replyInboxNotification = createAsyncThunk(
  'appInboxNotifications/replyInboxNotification',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/notifications/${id}`,
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

export const appInboxNotificationsSlice = createSlice({
  name: 'appInboxNotifications',
  initialState: {
    inbox_notifications: {
      data: [] as any,
      total: 0,
      total_unread: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    read_notification: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    reply_notification: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchInboxNotifications.fulfilled, (state, action) => {
        state.inbox_notifications.status = 'success'
        state.inbox_notifications.data = action.payload.items
        state.inbox_notifications.total = action.payload.total
        state.inbox_notifications.total_unread = action.payload.total_unread
        state.inbox_notifications.error = null
        state.inbox_notifications.loading = false
      })
      .addCase(fetchInboxNotifications.rejected, (state, action) => {
        state.inbox_notifications.status = 'failed'
        state.inbox_notifications.error = action.payload as ErrorType
        state.inbox_notifications.loading = false
      })
      .addCase(fetchInboxNotifications.pending, state => {
        state.inbox_notifications.status = 'loading'
        state.inbox_notifications.error = null
        state.inbox_notifications.loading = true
      })
      .addCase(readInboxNotifications.fulfilled, state => {
        state.read_notification.status = 'success'
        state.read_notification.error = null
        state.read_notification.loading = false
      })
      .addCase(readInboxNotifications.rejected, (state, action) => {
        state.read_notification.status = 'failed'
        state.read_notification.error = action.payload as ErrorType
        state.read_notification.loading = false
      })
      .addCase(readInboxNotifications.pending, state => {
        state.read_notification.status = 'loading'
        state.read_notification.error = null
        state.read_notification.loading = true
      })
      .addCase(replyInboxNotification.fulfilled, state => {
        state.reply_notification.status = 'success'
        state.reply_notification.error = null
        state.reply_notification.loading = false
      })
      .addCase(replyInboxNotification.rejected, (state, action) => {
        state.reply_notification.status = 'failed'
        state.reply_notification.error = action.payload as ErrorType
        state.reply_notification.loading = false
      })
      .addCase(replyInboxNotification.pending, state => {
        state.reply_notification.status = 'loading'
        state.reply_notification.error = null
        state.reply_notification.loading = true
      })
  }
})

export default appInboxNotificationsSlice.reducer
