import ExcelJS from 'exceljs'

export function useExcelParser() {
    const parseExcelFile = async (file: File): Promise<Record<string, any>[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            
            reader.onload = async (e: ProgressEvent<FileReader>) => {
                try {
                    if (!e.target || !e.target.result) {
                        reject(new Error('Failed to read file'))
                        return
                    }
                    
                    const data = e.target.result
                    const workbook = new ExcelJS.Workbook()
                    await workbook.xlsx.load(data as ArrayBuffer)
                    
                    const worksheet = workbook.getWorksheet(1)
                    if (!worksheet) {
                        reject(new Error('No worksheet found'))
                        return
                    }
                    
                    // Get headers from first row
                    const headers = worksheet.getRow(1).values as string[]
                    
                    // Convert rows to objects
                    const jsonData: Record<string, any>[] = []
                    worksheet.eachRow((row, rowNumber) => {
                        if (rowNumber === 1) return // Skip header row
                        
                        const rowData: Record<string, any> = {}
                        row.eachCell((cell, colNumber) => {
                            const header = headers[colNumber]
                            if (header) {
                                rowData[header] = cell.value
                            }
                        })
                        jsonData.push(rowData)
                    })
                    
                    resolve(jsonData)
                } catch (error) {
                    reject(error)
                }
            }
            
            reader.onerror = () => {
                reject(new Error('Error reading file'))
            }
            
            // Read as array buffer
            reader.readAsArrayBuffer(file)
        })
    }
    
    return {
        parseExcelFile
    }
}
