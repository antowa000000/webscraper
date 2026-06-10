import ExcelJS from 'exceljs'

export async function toExcel(data) {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('data')

  ws.columns = Object.keys(data[0]).map(key => ({ header: key, key, width: 28 }))
  ws.getRow(1).font = { bold: true }
  data.forEach(row => ws.addRow(row))

  return wb
}