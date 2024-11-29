export const renderSubgroup = (subgroup: string | null) => {
  if (subgroup === null || subgroup?.length === 0) return

  switch (subgroup) {
    case 'informatics':
      return 'Informatika'
    case 'lang1':
      return 'Daşary ýurt dili 1'
    case 'lang2':
      return 'Daşary ýurt dili 2'
    case 'lang3':
      return 'Daşary ýurt dili 3'
    case 'lang4':
      return 'Iňlis dili'
    case 'lang5':
      return 'Rus dili'
    case 'labor1':
      return 'Zähmet'
    case 'other1':
      return 'Başga ders'
    default:
      return subgroup
  }
}
