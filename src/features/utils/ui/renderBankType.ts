export const renderBankType = (bank_type: string | null) => {
  if (bank_type === null) return
  switch (bank_type) {
    case 'halkbank':
      return 'Halkbank'
    case 'rysgalbank':
      return 'Rysgalbank'
    case 'senagatbank':
      return 'Senagatbank'
    case 'tfeb':
      return 'TFEB'
    default:
      return null
  }
}
