import PizZip from 'pizzip'
import { getDataFieldsOfStandardContracts } from '@/app/[locale]/actions/standard_contract_actions'

const extractDataFromAIResponse = (
  aiResponseText: string,
  contractDataFields: any[]
): { [key: string]: string } => {
  const extractedData: { [key: string]: string } = {}

  const keyValuePattern = /([^\n]+?):\s*(.+?)(?=\n|$)/g
  let match

  const contractFieldsMap = contractDataFields.reduce((acc, field) => {
    const normalizedFieldName = field.field_name
      .toLowerCase()
      .replace(/\s+/g, '')
    acc[normalizedFieldName] = field.field_name
    return acc
  }, {} as { [key: string]: string })

  while ((match = keyValuePattern.exec(aiResponseText)) !== null) {
    const key = match[1].trim().toLowerCase().replace(/\s+/g, '')
    const value = match[2].trim()

    if (contractFieldsMap[key]) {
      extractedData[contractFieldsMap[key]] = value
    }
  }

  return extractedData
}

export async function POST(req: Request) {
  try {
    const { base64FileContent, contractId, aiResponseText } = await req.json()

    const contractDataFields = await getDataFieldsOfStandardContracts(
      contractId
    )
    console.log('Contract Data Fields:', contractDataFields)
    console.log('AI Response:', aiResponseText)

    const extractedData = extractDataFromAIResponse(
      aiResponseText,
      contractDataFields
    )
    console.log('Mapped Data Object:', extractedData)

    const base64Data = base64FileContent.split(',')[1]
    if (!base64Data) {
      throw new Error('Invalid base64 string.')
    }

    const binaryContent = Buffer.from(base64Data, 'base64')

    const zip = new PizZip(binaryContent)

    const xmlFile = zip.file('word/document.xml')
    if (!xmlFile) {
      throw new Error('word/document.xml not found in the docx file.')
    }

    let docXml = xmlFile.asText()

    Object.keys(extractedData).forEach((key) => {
      const value = extractedData[key]

      const regex = new RegExp(
        `(<w:b>|<w:i>|<w:u>|<w:strike>)?\\s*\\[?\\s*${key}\\s*\\]?\\s*(</w:b>|</w:i>|</w:u>|</w:strike>)?`,
        'gi'
      )

      docXml = docXml.replace(regex, value)
    })

    zip.file('word/document.xml', docXml)

    const updatedFileBlob = zip.generate({
      type: 'nodebuffer',
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const base64UpdatedFile = updatedFileBlob.toString('base64')

    return new Response(
      JSON.stringify({
        downloadLink: `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64UpdatedFile}`,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing contract:', error)
    return new Response(JSON.stringify({ message: (error as any).message }), {
      status: 500,
    })
  }
}
