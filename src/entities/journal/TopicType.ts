import { BookType } from '../app/BooksType'
import { SubjectSettingsType } from '../classroom/SubjectType'

export type TopicType = {
  id: string
  title: string
  content: string
  level: string | null
  period: string
  classyear: string
  language: string | null
  subject: string | null
  tags: string[] | null
  files: string[]
  book: BookType | null
  book_page: number | null
  relation_ids: string[] | null
}

export type TopicImportType = {
  id: string
  subject: string
  period: string
  level: string
  language: string
  title: string
  classyear: string
}

export type TopicListType = {
  id: string
  title: string
  level: string | null
  period: string
  classyear: string
  language: string | null
  subject: SubjectSettingsType | null
  tags: string[] | null
}

export type TopicCreateType = {
  id: string
  title: string
  content?: string
  level: string | null
  period: string
  classyear: string
  language: string | null
  subject: string | null
  tags?: string[] | null
  files?: string[]
  book_id?: string
  book_page?: number | null
  relation_ids?: string[] | null
}
