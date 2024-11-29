// ** MUI Imports
import Box from '@mui/material/Box'
import { Grid, ListItemText, TextField } from '@mui/material'

// ** Custom Components Imports
import CustomAutocomplete from 'src/shared/components/mui/autocomplete'

// ** Type Imports
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from 'src/features/store'

interface TableHeaderProps {
  authors: string[]
  categories: string[]
  authorQuery: string | null
  handleFilterAuthor: (val: string | null) => void
  categoryQuery: string | null
  handleFilterCategory: (val: string | null) => void
  yearQuery: number | null
  handleFilterYear: (val: number | null) => void
}

const TableHeader = (props: TableHeaderProps) => {
  // ** Props
  const {
    authors,
    categories,
    authorQuery,
    handleFilterAuthor,
    categoryQuery,
    handleFilterCategory,
    yearQuery,
    handleFilterYear
  } = props

  const { settings } = useSelector((state: RootState) => state.settings)
  const { book_authors } = useSelector((state: RootState) => state.books)

  const { t } = useTranslation()

  return (
    <Box
      sx={{
        p: 6,
        pb: 5
      }}
    >
      <Grid container spacing={6}>
        <Grid item xs={12} lg={4} md={6} sm={12}>
          <CustomAutocomplete
            fullWidth
            id='category'
            size='small'
            value={categoryQuery}
            options={categories}
            loading={settings.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: string | null) => {
              handleFilterCategory(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item}>
                <ListItemText>{item}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option || ''}
            renderInput={params => <TextField {...params} label={t('Category')} />}
          />
        </Grid>
        <Grid item xs={12} lg={4} md={6} sm={12}>
          <CustomAutocomplete
            fullWidth
            id='author'
            size='small'
            value={authorQuery}
            options={authors}
            loading={book_authors.loading}
            loadingText={t('ApiLoading')}
            onChange={(e: any, v: string | null) => {
              handleFilterAuthor(v)
            }}
            noOptionsText={t('NoRows')}
            renderOption={(props, item) => (
              <li {...props} key={item}>
                <ListItemText>{item}</ListItemText>
              </li>
            )}
            getOptionLabel={option => option || ''}
            renderInput={params => <TextField {...params} label={t('Author')} />}
          />
        </Grid>
        <Grid item xs={12} lg={4} md={6} sm={12}>
          <TextField
            fullWidth
            size='small'
            value={yearQuery}
            label={t('Year') as string}
            onChange={e => {
              handleFilterYear(parseInt(e.target.value))
            }}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default TableHeader
