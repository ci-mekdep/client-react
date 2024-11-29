export const renderUserFullname = (
  lastName: string | null | undefined,
  firstName: string | null | undefined,
  middleName?: string | null
) => {
  return `${lastName || ''} ${firstName || ''} ${middleName || ''}`.trim()
}
