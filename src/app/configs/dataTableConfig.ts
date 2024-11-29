import { MRT_SortingFn } from 'material-react-table'

declare module '@tanstack/table-core' {
  interface SortingFns {
    customSorting: MRT_SortingFn<any>
  }
}

const customSort = (rowA: any, rowB: any, columnId: any) => {
  const valueA = rowA.getValue(columnId)
  const valueB = rowB.getValue(columnId)

  return valueA?.localeCompare(valueB, undefined, { sensitivity: 'base' })
}

const dataTableConfig = {
  localization: {
    actions: 'Amallar',
    and: 'we',
    cancel: 'Goý bolsun et',
    changeFilterMode: 'Filter görnüşi çalyş',
    changeSearchMode: 'Gözleg görnüşi çalyş',
    clearFilter: 'Filteri arassala',
    clearSearch: 'Gözlegi arassala',
    clearSelection: 'Saýlananlary arassala',
    clearSort: 'Sortlamany arassala',
    clickToCopy: 'Göçürip al',
    collapse: 'Ýap',
    collapseAll: 'Ählisini ýap',
    columnActions: 'Goşmaça amallar',
    copiedToClipboard: 'Göçürip alyndy',
    copy: 'Göçür',
    edit: 'Üýtget',
    expand: 'Aç',
    expandAll: 'Ählisini aç',
    filterBetween: 'Aralykda',
    filterBetweenInclusive: 'Aralykda özi bilen',
    filterByColumn: '{column} boýunça filter',
    filterContains: 'Bar',
    filterEmpty: 'Boş',
    filterEndsWith: 'Gutarýar',
    filterEquals: 'Deň',
    filterEqualsString: 'Deň',
    filterGreaterThan: 'Ulydyr',
    filterGreaterThanOrEqualTo: 'Ulydyr ýa deňdir',
    filterInNumberRange: 'Aralykda',
    filterIncludesString: 'Bar',
    filterLessThan: 'Kiçidir',
    filterLessThanOrEqualTo: 'Kiçidir ýa deňdir',
    filterMode: 'Filter görnüşi: {filterType}',
    filterNotEmpty: 'Boş däl',
    filterNotEquals: 'Deň däl',
    filterStartsWith: 'Başlanýar',
    filterWeakEquals: 'Deň',
    filteringByColumn: '{column} - {filterType} {filterValue} filtrlemek',
    goToFirstPage: 'Birinji sahypa geç',
    goToLastPage: 'Soňky sahypa geç',
    goToNextPage: 'Indiki sahypa geç',
    goToPreviousPage: 'Öňki sahypa geç',
    grab: 'Tutmak',
    groupByColumn: '{column} boýunça toparlamak',
    groupedBy: 'Toparlandy',
    hideAll: 'Ählisini gizlemek',
    hideColumn: '{column} ýitir',
    max: 'maksimum',
    min: 'minumum',
    move: 'Süýşür',
    noRecordsToDisplay: 'Maglumat ýok',
    noResultsFound: 'Maglumat ýok',
    of: 'nyň',
    or: 'ýa-da',
    pin: 'birikdir',
    pinToLeft: 'Çepde birikdir',
    pinToRight: 'Sagda birikdir',
    resetColumnSize: 'Sütün inini goýmak',
    resetOrder: 'Tertibi arassala',
    rowActions: 'Setir amallary',
    rowNumber: 'T/b',
    rowNumbers: 'Setir sany',
    rowsPerPage: 'Sahypada sany',
    save: 'Ýatda sakla',
    search: 'Gözleg',
    select: 'Saýla',
    selectedCountOfRowCountRowsSelected: '{rowCount}-den {selectedCount} sany saýlandy',
    showAll: 'Ählisini görkez',
    showAllColumns: 'Ähli sütünleri görkez',
    showHideColumns: 'Görkez/ýitir',
    showHideFilters: 'Görkez/ýitir',
    showHideSearch: 'Görkez/ýitir',
    sortByColumnAsc: '{column} boýunça tertiple',
    sortByColumnDesc: '{column} boýunça tertiple',
    sortedByColumnAsc: '{column} boýunça tertiplenen',
    sortedByColumnDesc: '{column} boýunça tertiplenen',
    thenBy: ', we ',
    toggleSelectAll: 'Ählisini saýla',
    toggleSelectRow: 'Saýla'
  },
  sortingFns: {
    customSorting: customSort
  }
}

export default dataTableConfig
