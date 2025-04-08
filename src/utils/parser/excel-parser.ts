import * as XLSX from 'xlsx'

export function useExcelParser() {
    const parseExcelFile = async (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            
            reader.onload = (e: ProgressEvent<FileReader>) => {
                try {
                    if (!e.target || !e.target.result) {
                        reject(new Error('Failed to read file'))
                        return
                    }
                    
                    const data = e.target.result
                    const workbook = XLSX.read(data, { type: 'array' })
                    const firstSheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[firstSheetName]
                    
                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)
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