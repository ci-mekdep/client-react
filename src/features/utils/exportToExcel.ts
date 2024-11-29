import * as XLSX from 'xlsx'

export const exportReportToExcel = (filename: string, data: any, sum?: any) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  const headers = Object.keys(data[0])
  const wscols = [{ wch: 30 }]
  for (let i = 1; i < headers.length; i++) {
    wscols.push({ wch: headers[i].length })
  }
  worksheet['!cols'] = wscols
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasabat')

  if (sum) {
    const worksheet2 = XLSX.utils.json_to_sheet(sum, { skipHeader: true })
    const headers2 = Object.keys(sum[0])
    const wscols2 = [{ wch: 30 }]
    for (let i = 1; i < headers2.length; i++) {
      wscols2.push({ wch: headers2[i].length })
    }
    worksheet2['!cols'] = wscols2
    XLSX.utils.book_append_sheet(workbook, worksheet2, 'Jemler')
  }

  XLSX.writeFile(workbook, filename)
}

export const exportToExcel = (filename: string, data: any) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  const headers = Object.keys(data[0])
  const wscols = [{ wch: 30 }]
  for (let i = 1; i < headers.length; i++) {
    wscols.push({ wch: headers[i].length })
  }
  worksheet['!cols'] = wscols
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasabat')
  XLSX.writeFile(workbook, filename)
}

export const exportTableToExcel = (data: any, filename: string) => {
  const workbook = XLSX.utils.table_to_book(data)
  XLSX.writeFile(workbook, filename)
}

export const exportReportFormToExcel = (filename: string, data: any, merges: any[], groupHeaders: string[]) => {
  const worksheet = XLSX.utils.json_to_sheet([])
  const workbook = XLSX.utils.book_new()

  XLSX.utils.sheet_add_aoa(worksheet, [groupHeaders], { origin: 'A1' })
  const headers = Object.keys(data[0])
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A2' })
  XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A3', skipHeader: true })

  const wscols = [{ wch: 30 }]
  for (let i = 1; i < headers.length; i++) {
    wscols.push({ wch: headers[i].length })
  }

  worksheet['!cols'] = wscols
  worksheet['!merges'] = merges

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasabat')
  XLSX.writeFile(workbook, filename)
}
