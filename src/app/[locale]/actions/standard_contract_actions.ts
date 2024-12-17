'use server'

import db from '@/db/drizzle'
import {
  getLongRunningPoller,
  AnalyzeResultOperationOutput,
  isUnexpected,
} from '@azure-rest/ai-document-intelligence'
import DocumentIntelligence from '@azure-rest/ai-document-intelligence'
import { AzureKeyCredential } from '@azure/core-auth'
import { generateObject, generateText } from 'ai'
import { asc, desc, eq, inArray } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  standard_contract,
  standard_contract_data_fields,
  standard_contract_drafts,
  standard_contract_files,
  standard_contract_sections,
} from '@/db/schema'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { cookies } from 'next/headers'

// Caching variables for models and Document Intelligence client
let cachedLocale: string | null = null
let cachedLLMModelForTitle: any = null
let cachedLLMModelForSections: any = null
let cachedDocumentIntelligenceClient: any = null

const getLocaleFromCookies = () => {
  if (cachedLocale) return cachedLocale
  const cookieStore = cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  cachedLocale = localeCookie ? localeCookie.value : 'el' // Default to Greek
  return cachedLocale
}

// Cache and reuse the LLM model for generating titles
const getCachedLLMModelForTitle = async () => {
  if (!cachedLLMModelForTitle) {
    cachedLLMModelForTitle = await getLLMModel('claude-3-haiku@20240307')
  }
  return cachedLLMModelForTitle
}

// Cache and reuse the LLM model for generating contract sections
const getCachedLLMModelForSections = async () => {
  if (!cachedLLMModelForSections) {
    cachedLLMModelForSections = await getLLMModel('claude-3-5-sonnet@20241022')
  }
  return cachedLLMModelForSections
}

// Cache and reuse the Document Intelligence client for document analysis
const getDocumentIntelligenceClient = () => {
  if (!cachedDocumentIntelligenceClient) {
    const endpoint = process.env.DI_ENDPOINT
    const key = process.env.DI_KEY
    cachedDocumentIntelligenceClient = DocumentIntelligence(
      endpoint!,
      new AzureKeyCredential(key!)
    )
  }
  return cachedDocumentIntelligenceClient
}

export const getStandardContracts = async (userId: string) => {
  return await db
    .select()
    .from(standard_contract)
    .where(eq(standard_contract.userId, userId))
    .orderBy(desc(standard_contract.createdAt))
}

export const getAStandardContractFile = async (contractId: string) => {
  return await db
    .select()
    .from(standard_contract_files)
    .where(eq(standard_contract_files.standardContractId, contractId))
  // .limit(1)
}

export const createStandardContract = async (userId: string) => {
  const locale = getLocaleFromCookies()
  const data = await db
    .insert(standard_contract)
    .values({ userId, title: generateStandardContractTitle(locale) })
    .returning({ contractId: standard_contract.id })
  const contractId = data[0].contractId
  revalidatePath(`/${locale}/standard-contract/`)
  return contractId
  //   redirect(`/contract/${contactChatId}`);
}

export const createMeaningfulStandardContractTitle = async (
  contractId: string,
  context: string
) => {
  const locale = getLocaleFromCookies()
  const selectedModel = await getCachedLLMModelForTitle()

  const { object: title } = await generateObject({
    model: selectedModel,
    system: `
      You can generate meaningful contract titles based on context.
      Titles must be compact and meaningful.
      Use the context provided to generate title.
      Titles must be no longer than 120 characters.
      The title should always be in ${locale === 'el' ? 'Greek' : 'English'}.
    `,
    prompt: `Generate a title based on this context: ${context}`,
    schema: z.object({
      title: z.string().describe('Title of the contract'),
    }),
  })

  await db
    .update(standard_contract)
    .set({
      title: title.title,
    })
    .where(eq(standard_contract.id, contractId))
  revalidatePath(`/${locale}/standard-contract`)
  revalidatePath(`/${locale}/standard-contract/${contractId}`)
}

const generateStandardContractTitle = (locale: string) => {
  return locale === 'el'
    ? `Σύμβαση ${Math.floor(Math.random() * 10000).toFixed(0)}`
    : `Contract ${Math.floor(Math.random() * 10000).toFixed(0)}`
}

export const deleteStandardContract = async (contractId: string) => {
  const locale = getLocaleFromCookies()
  await db.delete(standard_contract).where(eq(standard_contract.id, contractId))
  revalidatePath(`/${locale}/standard-contract`)
  redirect(`/${locale}/standard-contract`)
}

export const getSectionsOfStandardContract = async (contractId: string) => {
  return await db
    .select()
    .from(standard_contract_sections)
    .where(eq(standard_contract_sections.standardContractId, contractId))
    .orderBy(asc(standard_contract_sections.createdAt))
}

export const getDataFieldsOfStandardContracts = async (contractId: string) => {
  return await db
    .select()
    .from(standard_contract_data_fields)
    .where(eq(standard_contract_data_fields.standardContractId, contractId))
    .orderBy(asc(standard_contract_data_fields.createdAt))
}

export const saveStandardContractDataFieldValue = async (
  contractId: string,
  fieldId: string,
  value: string
) => {
  const locale = getLocaleFromCookies()
  await db
    .update(standard_contract_data_fields)
    .set({
      value,
    })
    .where(eq(standard_contract_data_fields.id, fieldId))
  revalidatePath(`/${locale}/standard-contract/${contractId}`)
}

export const getStandardContractDrafts = async (contractId: string) => {
  const drafts = await db
    .select()
    .from(standard_contract_drafts)
    .where(eq(standard_contract_drafts.standardContractId, contractId))
    .orderBy(asc(standard_contract_drafts.createdAt))

  return drafts.map((draft) => {
    const match = draft.draft.match(/^\[(USER|ASSISTANT)\]\s*([\s\S]*)/)
    if (match) {
      return {
        ...draft,
        role: match[1].toLowerCase(),
        draft: match[2],
      }
    }
    return { ...draft, role: 'unknown' }
  })
}

export const addStandardContractDraft = async (
  contractId: string,
  draft: string,
  role: 'user' | 'assistant'
) => {
  const locale = getLocaleFromCookies()
  const draftWithRole = `[${role.toUpperCase()}] ${draft}`
  await db.insert(standard_contract_drafts).values({
    draft: draftWithRole,
    standardContractId: contractId,
  })
  revalidatePath(`/${locale}/standard-contract/${contractId}`)
}

export const createSectionsOfStandardContracts = async ({
  userId,
  contractId,
  base64Source,
  fileName,
  fileType,
  fileSize,
}: {
  userId: string
  contractId: string
  base64Source: string
  fileName: string
  fileType: string
  fileSize: number
}) => {
  const locale = getLocaleFromCookies()

  const base64Content = base64Source.split(',')[1]

  const [extractedText, _] = await Promise.all([
    analyzeDocument(base64Content),
    db.insert(standard_contract_files).values({
      file_content: base64Source,
      file_name: fileName,
      file_path: '',
      file_size: fileSize.toString(),
      file_type: fileType,
      standardContractId: contractId,
    }),
  ])

  if (!extractedText) return

  const generatedSections = await generateStandardContractSections(
    extractedText!
  )

  const sectionInserts = generatedSections.sections.map((section) =>
    db.insert(standard_contract_sections).values({
      standardContractId: contractId,
      title: section,
      description: '',
    })
  )

  const fieldInserts = generatedSections.fields.map((field) =>
    db.insert(standard_contract_data_fields).values({
      standardContractId: contractId,
      field_name: field.field_name,
      field_type: field.field_type,
    })
  )

  await Promise.all([...sectionInserts, ...fieldInserts])

  // Old approach
  // const locale = getLocaleFromCookies()
  // const formatted64 = base64Source.split(',')[1]
  // const extractedText = await analyzeDocument(formatted64)

  // const generatedSections = await generateStandardContractSections(
  //   extractedText!
  // )

  // await db.insert(standard_contract_files).values({
  //   file_content: extractedText!,
  //   file_name: fileName,
  //   file_path: '',
  //   file_size: fileSize.toString(),
  //   file_type: fileType,
  //   standardContractId: contractId,
  // })

  // console.log(generatedSections)

  // for (const section of generatedSections.sections) {
  //   await db.insert(standard_contract_sections).values({
  //     standardContractId: contractId,
  //     title: section,
  //     description: '',
  //   })
  // }
  // for (const field of generatedSections.fields) {
  //   await db.insert(standard_contract_data_fields).values({
  //     standardContractId: contractId,
  //     field_name: field.field_name,
  //     field_type: field.field_type,
  //   })
  // }

  revalidatePath(`/${locale}/standard-contract/${contractId}`)
}

const analyzeDocument = async (base64Source: string) => {
  const client = getDocumentIntelligenceClient()
  try {
    const initialResponse = await client
      .path('/documentModels/{modelId}:analyze', 'prebuilt-layout')
      .post({
        contentType: 'application/json',
        body: {
          base64Source,
        },
        queryParameters: { locale: 'en-IN', outputContentFormat: 'markdown' },
      })

    if (isUnexpected(initialResponse)) {
      throw initialResponse.body.error
    }

    const poller = await getLongRunningPoller(client, initialResponse)
    const result = (await poller.pollUntilDone())
      .body as AnalyzeResultOperationOutput

    return result.analyzeResult?.content
  } catch (error) {
    console.error('Document analysis failed:', error)
    return null
  }
}

const generateStandardContractSections = async (contract: string) => {
  const selectedModel = await getCachedLLMModelForSections()

  const { object } = await generateObject({
    model: selectedModel,
    schema: z.object({
      sections: z.array(
        z.string().describe('Title of the section or header of the section')
      ),
      fields: z.array(
        z.object({
          field_name: z.string().describe('Field Name Eg: Contract Date'),
          field_type: z.string().describe('Field HTML input type Eg: date'),
        })
      ),
    }),
    maxTokens: 4000,
    system: `
			You are tasked with extracting the section headers or titles from legal contracts. Your goal is to identify and list these headers exactly as they appear in the original text, without adding any additional details or modifying them in any way.

			Here is the contract text you will be working with:

			<contract_text>
			{{CONTRACT_TEXT}}
			</contract_text>

			Follow these steps to extract the section headers:

			1. Carefully read through the entire contract text.
			2. Identify section headers or titles. These are typically short phrases that introduce new sections of the contract and are often formatted differently (e.g., bold, underlined, or in all caps).
			3. Extract these headers exactly as they appear in the text, maintaining their original capitalization and formatting, if no title section found give a suitable title as well.
			4. List each header on a new line.
			5. Do not include any additional text, explanations, or modifications to the headers.
			6. As you go through the text, also look for important details such as client names, company names, dates, and other relevant information that would typically be filled in on a contract form.
			7. For each relevant detail you find:
				a. Determine an appropriate field name (e.g., "Client Name", "Company Name", "Effective Date")
				b. Choose a suitable HTML input type (e.g., "text" for names, "date" for dates)
				c. Add this information to your output list
			8. If nothing found do not add fake data
			Provide your output in the following format:

			Remember:
			- Extract headers exactly as they appear in the original text.
			- Do not add any additional details or explanations.
			- Do not modify the headers in any way.
			- If you're unsure if something is a header, it's better to include it than to omit it.
			- If there are no clear section headers in the provided text, output "No section headers found" within the <headers> tags.

			Now, please extract the section headers from the provided contract text and list them as instructed.
		`,
    prompt: `
			<contract_text>
				${contract}
			</contract_text>
			`,
  })
  return object
}

const ContractSectionSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string().describe('Title for the section'),
      section: z.string().describe('Extracted section of the contract'),
      description: z
        .string()
        .describe('A short and precise description about the section'),
    })
  ),
  fields: z.array(
    z
      .object({
        field_name: z.string().describe('Name of the field'),
        field_type: z
          .string()
          .describe('HTML input type of the field: Eg: text, date, file'),
      })
      .describe(
        'Extracted data fields that should be replaced with new data. Eg: Company Name, Client Name, Addresses, Dates'
      )
  ),
})

export type ContractSection = z.infer<typeof ContractSectionSchema>
