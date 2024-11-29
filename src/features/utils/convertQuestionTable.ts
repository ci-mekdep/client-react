import { ReportFormRowType } from 'src/entities/app/ReportFormType'

type RowType = {
  id: string
  key: string | null
  header: string
  type: string
  type_options: string[] | null
  parent_id?: string | null
}

export const convertQuestionTable = (rows: RowType[]) => {
  let keyIndex = 0
  const arr = rows
    .map(item => {
      if (item.parent_id === null && rows.some(row => row.parent_id === item.id) !== false) {
        return null
      } else if (item.parent_id === null && rows.some(row => row.parent_id === item.id) === false) {
        keyIndex++

        return {
          key: item.key ? item.key : keyIndex.toString(),
          header: item.header,
          type: item.type,
          type_options: item.type_options,
          group: null
        }
      } else {
        keyIndex++

        return {
          key: item.key ? item.key : keyIndex.toString(),
          header: item.header,
          type: item.type,
          type_options: item.type_options,
          group: rows.find(row => row.id === item.parent_id)?.header
        }
      }
    })
    .filter(row => row !== null)

  return arr as ReportFormRowType[]
}
