// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axiosInstance from 'src/app/configs/axiosInstance'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { NotificationCreateType } from 'src/entities/app/NotificationType'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  limit?: number
  offset?: number
}

// ** Fetch Outbox Notifications
export const fetchOutboxNotifications = createAsyncThunk(
  'appOutboxNotifications/fetchOutboxNotifications',
  async (params: DataParams, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/notifications/sender', {
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

// ** Fetch Outbox Notification
export const fetchOutboxNotification = createAsyncThunk(
  'appOutboxNotifications/fetchOutboxNotification',
  async ({ id, params }: { id: string; params: DataParams }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/notifications/sender/${id}`,
        {
          params
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

// ** Create New Notification
export const createNewNotification = createAsyncThunk(
  'appOutboxNotifications/createNewNotification',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + '/users/notifications/sender',
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

// ** Edit Sent Notification
export const editSentNotification = createAsyncThunk(
  'appOutboxNotifications/editSentNotification',
  async (data: NotificationCreateType, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/notifications/sender/${data.id}`,
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

// ** Delete Sent Notification
export const deleteSentNotification = createAsyncThunk(
  'appOutboxNotifications/deleteSentNotification',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(
        process.env.NEXT_PUBLIC_FETCH_API_BASE + `/users/notifications/sender/${id}`
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

export const appOutboxNotificationsSlice = createSlice({
  name: 'appOutboxNotifications',
  initialState: {
    outbox_notifications: {
      data: [] as any,
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    outbox_detail: {
      data: {} as any,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    create_notification: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    edit_notification: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    delete_notification: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchOutboxNotifications.fulfilled, (state, action) => {
        state.outbox_notifications.status = 'success'
        state.outbox_notifications.data = action.payload.items
        state.outbox_notifications.total = action.payload.total
        state.outbox_notifications.error = null
        state.outbox_notifications.loading = false
      })
      .addCase(fetchOutboxNotifications.rejected, (state, action) => {
        state.outbox_notifications.status = 'failed'
        state.outbox_notifications.error = action.payload as ErrorType
        state.outbox_notifications.loading = false
      })
      .addCase(fetchOutboxNotifications.pending, state => {
        state.outbox_notifications.status = 'loading'
        state.outbox_notifications.error = null
        state.outbox_notifications.loading = true
      })
      .addCase(fetchOutboxNotification.fulfilled, (state, action) => {
        state.outbox_detail.status = 'success'
        state.outbox_detail.data = action.payload
        state.outbox_detail.error = null
        state.outbox_detail.loading = false
      })
      .addCase(fetchOutboxNotification.rejected, (state, action) => {
        state.outbox_detail.status = 'failed'
        state.outbox_detail.error = action.payload as ErrorType
        state.outbox_detail.loading = false
      })
      .addCase(fetchOutboxNotification.pending, state => {
        state.outbox_detail.status = 'loading'
        state.outbox_detail.error = null
        state.outbox_detail.loading = true
      })
      .addCase(createNewNotification.fulfilled, state => {
        state.create_notification.status = 'success'
        state.create_notification.error = null
        state.create_notification.loading = false
      })
      .addCase(createNewNotification.rejected, (state, action) => {
        state.create_notification.status = 'failed'
        state.create_notification.error = action.payload as ErrorType
        state.create_notification.loading = false
      })
      .addCase(createNewNotification.pending, state => {
        state.create_notification.status = 'loading'
        state.create_notification.error = null
        state.create_notification.loading = true
      })
      .addCase(editSentNotification.fulfilled, state => {
        state.edit_notification.status = 'success'
        state.edit_notification.error = null
        state.edit_notification.loading = false
      })
      .addCase(editSentNotification.rejected, (state, action) => {
        state.edit_notification.status = 'failed'
        state.edit_notification.error = action.payload as ErrorType
        state.edit_notification.loading = false
      })
      .addCase(editSentNotification.pending, state => {
        state.edit_notification.status = 'loading'
        state.edit_notification.error = null
        state.edit_notification.loading = true
      })
      .addCase(deleteSentNotification.fulfilled, state => {
        state.delete_notification.status = 'success'
        state.delete_notification.error = null
        state.delete_notification.loading = false
      })
      .addCase(deleteSentNotification.rejected, (state, action) => {
        state.delete_notification.status = 'failed'
        state.delete_notification.error = action.payload as ErrorType
        state.delete_notification.loading = false
      })
      .addCase(deleteSentNotification.pending, state => {
        state.delete_notification.status = 'loading'
        state.delete_notification.error = null
        state.delete_notification.loading = true
      })
  }
})

export default appOutboxNotificationsSlice.reducer
