// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios, { CancelTokenSource } from 'axios'
import axiosInstance from 'src/app/configs/axiosInstance'
import { BookType } from 'src/entities/app/BooksType'
import { ErrorType } from 'src/entities/app/GeneralTypes'
import { createApiErrorObj } from 'src/features/utils/api/errorCreator'

interface DataParams {
  is_list?: boolean
  limit?: number
  offset?: number
  author?: string
  category?: string
  year?: string
}

// ** Create cancel token source
let cancelSource: CancelTokenSource

// ** Fetch Books
export const fetchBooks = createAsyncThunk('appBooks/fetchBooks', async (params: DataParams, { rejectWithValue }) => {
  if (params.is_list && cancelSource) {
    cancelSource.cancel('Operation canceled due to new request.')
  }

  if (params.is_list) cancelSource = axios.CancelToken.source()

  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/books', {
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
})

// ** Get Current Book
export const getCurrentBook = createAsyncThunk('appBooks/selectBook', async (id: string, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/books/${id}`)

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

// ** Edit Book
export const updateBook = createAsyncThunk(
  'appBooks/updateBook',
  async ({ data, id }: { data: FormData; id: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(process.env.NEXT_PUBLIC_FETCH_API_BASE + `/books/${id}`, data, {
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

// ** Add Book
export const addBook = createAsyncThunk('appBooks/addBook', async (data: FormData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/books', data, {
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
})

// ** Delete Book
export const deleteBook = createAsyncThunk('appBooks/deleteBook', async (ids: string[], { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/books', {
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
})

// ** Fetch Authors
export const fetchAuthors = createAsyncThunk('appBooks/fetchAuthors', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(process.env.NEXT_PUBLIC_FETCH_API_BASE + '/books/authors')

    return response.data
  } catch (error: any) {
    if (error.response && error.response.data) {
      return rejectWithValue(error.response.data)
    } else {
      return rejectWithValue(createApiErrorObj(error.message))
    }
  }
})

export const appBooksSlice = createSlice({
  name: 'appBooks',
  initialState: {
    books_list: {
      data: [] as BookType[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    book_detail: {
      data: {} as BookType,
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    book_update: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    book_add: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    book_delete: {
      status: '',
      error: null as ErrorType | null,
      loading: false
    },
    book_authors: {
      data: [] as string[],
      total: 0,
      status: '',
      error: null as ErrorType | null,
      loading: false
    }
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.books_list.status = 'success'
        state.books_list.data = action.payload.books
        state.books_list.total = action.payload.total
        state.books_list.error = null
        state.books_list.loading = false
      })
      .addCase(fetchBooks.rejected, (state, action: any) => {
        if (action.payload?.message !== 'Request canceled') {
          state.books_list.status = 'failed'
          state.books_list.error = action.payload as ErrorType
          state.books_list.loading = false
        }
      })
      .addCase(fetchBooks.pending, state => {
        state.books_list.status = 'loading'
        state.books_list.error = null
        state.books_list.loading = true
      })
      .addCase(getCurrentBook.fulfilled, (state, action) => {
        state.book_detail.status = 'success'
        state.book_detail.data = action.payload.book
        state.book_detail.error = null
        state.book_detail.loading = false
      })
      .addCase(getCurrentBook.rejected, (state, action) => {
        state.book_detail.status = 'failed'
        state.book_detail.error = action.payload as ErrorType
        state.book_detail.loading = false
      })
      .addCase(getCurrentBook.pending, state => {
        state.book_detail.status = 'loading'
        state.book_detail.error = null
        state.book_detail.loading = true
      })
      .addCase(updateBook.fulfilled, state => {
        state.book_update.status = 'success'
        state.book_update.error = null
        state.book_update.loading = false
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.book_update.status = 'failed'
        state.book_update.error = action.payload as ErrorType
        state.book_update.loading = false
      })
      .addCase(updateBook.pending, state => {
        state.book_update.status = 'loading'
        state.book_update.error = null
        state.book_update.loading = true
      })
      .addCase(addBook.fulfilled, state => {
        state.book_add.status = 'success'
        state.book_add.error = null
        state.book_add.loading = false
      })
      .addCase(addBook.rejected, (state, action) => {
        state.book_add.status = 'failed'
        state.book_add.error = action.payload as ErrorType
        state.book_add.loading = false
      })
      .addCase(addBook.pending, state => {
        state.book_add.status = 'loading'
        state.book_add.error = null
        state.book_add.loading = true
      })
      .addCase(deleteBook.fulfilled, state => {
        state.book_delete.status = 'success'
        state.book_delete.error = null
        state.book_delete.loading = false
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.book_delete.status = 'failed'
        state.book_delete.error = action.payload as ErrorType
        state.book_delete.loading = false
      })
      .addCase(deleteBook.pending, state => {
        state.book_delete.status = 'loading'
        state.book_delete.error = null
        state.book_delete.loading = true
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.book_authors.status = 'success'
        state.book_authors.data = action.payload.authors
        state.book_authors.total = action.payload.total
        state.book_authors.error = null
        state.book_authors.loading = false
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.book_authors.status = 'failed'
        state.book_authors.error = action.payload as ErrorType
        state.book_authors.loading = false
      })
      .addCase(fetchAuthors.pending, state => {
        state.book_authors.status = 'loading'
        state.book_authors.error = null
        state.book_authors.loading = true
      })
  }
})

export default appBooksSlice.reducer
