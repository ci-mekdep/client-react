export type BookType = {
  id: string
  title: string
  categories: string[]
  description: string
  year: number
  pages: number
  authors: string[]
  file: string
  file_size: number
  file_preview: string
  is_downloadable: boolean
}

export type BookCreateType = {
  id?: string
  title: string
  categories?: string[]
  description?: string
  year: string
  pages?: number
  authors?: string[]
  file?: string
  is_downloadable?: string
}
