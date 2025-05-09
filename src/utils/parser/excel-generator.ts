import {saveAs} from 'file-saver'
import ExcelJS from 'exceljs'

export function useExcelGenerator() {
    const generateExcel = async (data: any[], columns: any[]) => {
        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Data')

        // Add headers
        worksheet.columns = columns.map(col => ({
            header: col.label,
            key: col.key,
            width: 15
        }))

        // Add rows
        worksheet.addRows(data)

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()
        
        // Create Blob and save
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, `export_${new Date().toISOString().split('T')[0]}.xlsx`)
    }
    
    const generateTemplateExcel = async (columns: any[]) => {
        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Template')

        // Add headers
        worksheet.columns = columns.map(col => ({
            header: col.label,
            key: col.key,
            width: 15
        }))

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer()
        
        // Create Blob and save
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        saveAs(blob, `template_${new Date().toISOString().split('T')[0]}.xlsx`)
    }
    
    return {
        generateExcel,
        generateTemplateExcel
    }
}
