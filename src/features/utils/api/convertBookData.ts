import { BookCreateType, BookType } from 'src/entities/app/BooksType'

export const convertBookData = (data: BookType) => {
  const bookCreate = <BookCreateType>{}

  bookCreate.id = data.id
  bookCreate.title = data.title
  bookCreate.categories = data.categories
  bookCreate.authors = data.authors
  bookCreate.year = data.year ? data.year.toString() : ''
  bookCreate.is_downloadable = data.is_downloadable === true ? '1' : '0'

  return bookCreate
}
