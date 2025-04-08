import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

export function useExcelGenerator() {
    const generateExcel = (data: any[], columns: any[]) => {
        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(
            data.map(item => {
                const row: Record<string, any> = {}
                // Only include columns that are in the columns array
                columns.forEach(col => {
                    row[col.label] = item[col.key]
                })
                return row
            })
        )

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Data')

        // Convert to array buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        
        // Create Blob and save
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
        saveAs(blob, `export_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    const generateTemplateExcel = (columns: any[]) => {
        // Create empty worksheet with headers only
        const ws = XLSX.utils.json_to_sheet([])
        XLSX.utils.sheet_add_aoa(ws, [columns.map(col => col.label)])

        // Create workbook
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template')

        // Convert to array buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        
        // Create Blob and save
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
        saveAs(blob, `template_${new Date().toISOString().split('T')[0]}.xlsx`)
    }

    return {
        generateExcel,
        generateTemplateExcel
    }
} 