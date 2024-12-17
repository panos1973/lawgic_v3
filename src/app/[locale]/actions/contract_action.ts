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
  contract,
  contract_data_fields,
  contract_drafts,
  contract_files,
  contract_sections,
  user_contract_chat_preferences,
} from '@/db/schema'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { cookies } from 'next/headers'

let cachedLLMModelForTitle: any = null
let cachedLLMModelForSections: any = null
let cachedDocumentIntelligenceClient: any = null

const getLocaleFromCookies = () => {
  const cookieStore = cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  return localeCookie ? localeCookie.value : 'el' // Default to Greek
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

export const getContractChatPreferences = async (userId: string) => {
  const prefs = await db
    .select()
    .from(user_contract_chat_preferences)
    .where(eq(user_contract_chat_preferences.userId, userId))
    .limit(1)

  if (prefs.length === 0) {
    const defaultPrefs = await db
      .insert(user_contract_chat_preferences)
      .values({
        userId,
        includeGreekLaws: true,
        includeGreekCourtDecisions: false,
        includeEuropeanLaws: false,
        includeEuropeanCourtDecisions: false,
        includeGreekBibliography: false,
        includeForeignBibliography: false,
      })
      .returning()

    return defaultPrefs[0]
  }

  return prefs[0]
}

export const updateContractChatPreferences = async (
  userId: string,
  preferences: {
    includeGreekLaws?: boolean
    includeGreekCourtDecisions?: boolean
    includeEuropeanLaws?: boolean
    includeEuropeanCourtDecisions?: boolean
    includeGreekBibliography?: boolean
    includeForeignBibliography?: boolean
  }
) => {
  const locale = getLocaleFromCookies()
  await db
    .update(user_contract_chat_preferences)
    .set({
      ...preferences,
      updatedAt: new Date(),
    })
    .where(eq(user_contract_chat_preferences.userId, userId))

  revalidatePath(`/${locale}/contract-chat`)
}

export const getContracts = async (userId: string) => {
  return await db
    .select()
    .from(contract)
    .where(eq(contract.userId, userId))
    .orderBy(desc(contract.createdAt))
}

export const updateContractNote = async (contractId: string, note: string) => {
  const locale = getLocaleFromCookies()
  await db.update(contract).set({ note }).where(eq(contract.id, contractId))

  revalidatePath(`/${locale}/contract`)
  revalidatePath(`/${locale}/contract/${contractId}`)
}

export const getAcontractFile = async (contractId: string) => {
  return await db
    .select()
    .from(contract_files)
    .where(eq(contract_files.contract_id, contractId))
  // .limit(1)
}

export const createContract = async (userId: string) => {
  const locale = getLocaleFromCookies()
  const data = await db
    .insert(contract)
    .values({ userId, title: generateContractTitle(locale) })
    .returning({ contractId: contract.id })
  const contractId = data[0].contractId
  revalidatePath(`/${locale}/contract/`)
  return contractId
  //   redirect(`/contract/${contactChatId}`);
}

export const createMeaningfulContractTitle = async (
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
    .update(contract)
    .set({
      title: title.title,
    })
    .where(eq(contract.id, contractId))
  revalidatePath(`/${locale}/contract`)
  revalidatePath(`/${locale}/contract/${contractId}`)
}

const generateContractTitle = (locale: string) => {
  return locale === 'el'
    ? `Σύμβαση ${Math.floor(Math.random() * 10000).toFixed(0)}`
    : `Contract ${Math.floor(Math.random() * 10000).toFixed(0)}`
}

export const deleteContract = async (contractId: string) => {
  const locale = getLocaleFromCookies()
  await db.delete(contract).where(eq(contract.id, contractId))
  revalidatePath(`/${locale}/contract`)
  redirect(`/${locale}/contract`)
}

export const getSectionsOfContract = async (contractId: string) => {
  return await db
    .select()
    .from(contract_sections)
    .where(eq(contract_sections.contractId, contractId))
    .orderBy(asc(contract_sections.createdAt))
}

export const getDataFieldsOfContracts = async (contractId: string) => {
  return await db
    .select()
    .from(contract_data_fields)
    .where(eq(contract_data_fields.contractId, contractId))
    .orderBy(asc(contract_data_fields.createdAt))
}

export const saveContractDataFieldValue = async (
  contractId: string,
  fieldId: string,
  value: string
) => {
  const locale = getLocaleFromCookies()
  await db
    .update(contract_data_fields)
    .set({
      value,
    })
    .where(eq(contract_data_fields.id, fieldId))
  revalidatePath(`/${locale}/contract/${contractId}`)
}

export const getContractDrafts = async (contractId: string) => {
  const drafts = await db
    .select()
    .from(contract_drafts)
    .where(eq(contract_drafts.contractId, contractId))
    .orderBy(asc(contract_drafts.createdAt))

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

export const addContractDraft = async (
  contractId: string,
  draft: string,
  role: 'user' | 'assistant'
) => {
  const locale = getLocaleFromCookies()
  const draftWithRole = `[${role.toUpperCase()}] ${draft}`
  await db.insert(contract_drafts).values({
    draft: draftWithRole,
    contractId,
  })
  revalidatePath(`/${locale}/contract/${contractId}`)
}

export const createSectionsOfContracts = async ({
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
    db.insert(contract_files).values({
      file_content: base64Source,
      file_name: fileName,
      file_path: '',
      file_size: fileSize.toString(),
      file_type: fileType,
      contract_id: contractId,
    }),
  ])

  if (!extractedText) return

  const generatedSections = await generateContractSections(extractedText!)

  const sectionInserts = generatedSections.sections.map((section) =>
    db.insert(contract_sections).values({
      contractId,
      title: section,
      description: '',
    })
  )

  const fieldInserts = generatedSections.fields.map((field) =>
    db.insert(contract_data_fields).values({
      contractId,
      field_name: field.field_name,
      field_type: field.field_type,
    })
  )

  await Promise.all([...sectionInserts, ...fieldInserts])

  revalidatePath(`/${locale}/contract/${contractId}`)
}

const analyzeDocument = async (base64Source: string) => {
  // const endpoint = process.env.DI_ENDPOINT
  // const key = process.env.DI_KEY
  // const client = DocumentIntelligence(endpoint!, new AzureKeyCredential(key!))
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

const generateContractSections = async (contract: string) => {
  const selectedModel = await getCachedLLMModelForSections()

  const { object } = await generateObject({
    // model: await getLLMModel('claude-3-5-sonnet@20240620'),
    // model: openai("gpt-4o"),
    // schema: ContractSectionSchema,
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
