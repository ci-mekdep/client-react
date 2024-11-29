// ** React Import
import { ElementType, forwardRef, SyntheticEvent, useEffect } from 'react'

// ** MUI Import
import { useRouter } from 'next/router'
import Paper from '@mui/material/Paper'
import { AutocompleteValue } from '@mui/material'
import Autocomplete, { AutocompleteProps } from '@mui/material/Autocomplete'

const pagePaths = ['/create', '/tools', '/settings']

const CustomAutocomplete = forwardRef(
  <
    T,
    Multiple extends boolean | undefined,
    DisableClearable extends boolean | undefined,
    FreeSolo extends boolean | undefined,
    ChipComponent extends ElementType
  >(
    props: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo, ChipComponent>,
    ref: any
  ) => {
    const { options, value, freeSolo, onChange } = props
    const router = useRouter()

    useEffect(() => {
      let isPageToSelect = false
      pagePaths.map((path: string) => {
        if (router.pathname.includes(path)) {
          isPageToSelect = true
        }
      })
      if (
        !freeSolo &&
        !router.pathname.includes('/users/create') &&
        router.pathname &&
        isPageToSelect &&
        options &&
        options.length === 1 &&
        !value &&
        onChange
      ) {
        const firstOption = options[0] as AutocompleteValue<T, Multiple, DisableClearable, FreeSolo>
        const syntheticEvent = {} as SyntheticEvent
        onChange(syntheticEvent, firstOption, 'selectOption')
      }
    }, [freeSolo, options, value, onChange, router])

    return (
      // eslint-disable-next-line lines-around-comment
      // @ts-expect-error - AutocompleteProps is not compatible with PaperProps
      <Autocomplete
        {...props}
        ref={ref}
        PaperComponent={props => <Paper {...props} className='custom-autocomplete-paper' />}
      />
    )
  }
) as typeof Autocomplete

export default CustomAutocomplete
