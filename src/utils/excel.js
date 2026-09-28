/**
 * Excel I/O via SheetJS — loaded on demand so it never weighs on first paint.
 */
let xlsxPromise
const loadXlsx = () => (xlsxPromise ??= import('xlsx'))

/** Read a File → { sheets: [{ name, rows }] } (first row = header). */
export async function readWorkbook(file) {
  const XLSX = await loadXlsx()
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true })
  return {
    sheets: wb.SheetNames.map((name) => ({
      name,
      rows: XLSX.utils.sheet_to_json(wb.Sheets[name], { defval: '', raw: true }),
    })),
  }
}

/**
 * Write sheets to an .xlsx download.
 * @param sheets [{ name, rows: object[] } | { name, aoa: any[][] }]
 */
export async function downloadWorkbook(filename, sheets) {
  const XLSX = await loadXlsx()
  const wb = XLSX.utils.book_new()
  for (const s of sheets) {
    const ws = s.aoa ? XLSX.utils.aoa_to_sheet(s.aoa) : XLSX.utils.json_to_sheet(s.rows)
    const widthSource = s.aoa ?? [Object.keys(s.rows[0] ?? {}), ...s.rows.slice(0, 50).map(Object.values)]
    ws['!cols'] = (widthSource[0] ?? []).map((_, c) => ({
      wch: Math.min(48, Math.max(10, ...widthSource.map((r) => String(r[c] ?? '').length + 2))),
    }))
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31))
  }
  XLSX.writeFile(wb, filename, { compression: true })
}
