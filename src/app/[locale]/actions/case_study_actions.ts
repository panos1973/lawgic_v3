'use server'
import db from '@/db/drizzle'
import {
  case_study,
  case_study_files,
  case_study_messages,
  user_case_research_preferences,
} from '@/db/schema'
import { asc, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import DocumentIntelligence from '@azure-rest/ai-document-intelligence'
import { AzureKeyCredential } from '@azure/core-auth'
import { put } from '@vercel/blob'
import pg from 'pg'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import {
  getLongRunningPoller,
  AnalyzeResultOperationOutput,
  isUnexpected,
} from '@azure-rest/ai-document-intelligence'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { generateObject } from 'ai'
import { z } from 'zod'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { cookies } from 'next/headers'

let cachedLLMModel: any = null

const getLocaleFromCookies = () => {
  const cookieStore = cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  return localeCookie ? localeCookie.value : 'el' // Default to Greek
}

export const getCaseResearchPreferences = async (userId: string) => {
  const prefs = await db
    .select()
    .from(user_case_research_preferences)
    .where(eq(user_case_research_preferences.userId, userId))
    .limit(1)

  if (prefs.length === 0) {
    const defaultPrefs = await db
      .insert(user_case_research_preferences)
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

export const updateCaseResearchPreferences = async (
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
    .update(user_case_research_preferences)
    .set({
      ...preferences,
      updatedAt: new Date(),
    })
    .where(eq(user_case_research_preferences.userId, userId))

  revalidatePath(`/${locale}/case-research`)
}

export const getCaseStudies = async (userId: string) => {
  return await db
    .select()
    .from(case_study)
    .where(eq(case_study.userId, userId))
    .orderBy(desc(case_study.createdAt))
}

export const updateCaseStudyNote = async (
  caseStudyId: string,
  note: string
) => {
  const locale = getLocaleFromCookies()
  await db
    .update(case_study)
    .set({ note })
    .where(eq(case_study.id, caseStudyId))

  revalidatePath(`/${locale}/case-research`)
  revalidatePath(`/${locale}/case-research/${caseStudyId}`)
}

export const createCaseStudy = async (userId: string) => {
  const locale = getLocaleFromCookies()
  const data = await db
    .insert(case_study)
    .values({ userId, title: generateCaseTitle(locale) })
    .returning({ caseStudyId: case_study.id })
  const caseStudyId = data[0].caseStudyId
  revalidatePath(`/${locale}/case-research`)
  redirect(`/${locale}/case-research/${caseStudyId}`)
}

export const createMeaningfulcaseResearchTitle = async (
  caseId: string,
  context: string
) => {
  const locale = getLocaleFromCookies()

  if (!cachedLLMModel) {
    cachedLLMModel = await getLLMModel('claude-3-haiku@20240307')
  }

  const { object: title } = await generateObject({
    model: cachedLLMModel,
    system: `
      You can generate meaningful case research titles 
      based on chat context.
      Titles must be compact and meaningful.
      Use the context provided to generate title.
      Titles must be no longer than 120 characters.
      The title should always be in ${locale === 'el' ? 'Greek' : 'English'}.
      `,
    prompt: `Generate a title based on this context: ${context}`,
    schema: z.object({
      title: z.string().describe('Title of the case research'),
    }),
  })

  await db
    .update(case_study)
    .set({
      title: title.title,
    })
    .where(eq(case_study.id, caseId))

  // Revalidate paths to update the frontend
  revalidatePath(`/${locale}/case-research`)
  revalidatePath(`/${locale}/case-research/${caseId}`)
}

const generateCaseTitle = (locale: string) => {
  return locale === 'el'
    ? `Έρευνα Περίπτωσης ${Math.floor(Math.random() * 10000).toFixed(0)}`
    : `Case Research ${Math.floor(Math.random() * 10000).toFixed(0)}`
}

export const deleteCaseStudy = async (caseStudyId: string) => {
  const locale = getLocaleFromCookies()
  await db.delete(case_study).where(eq(case_study.id, caseStudyId))
  revalidatePath(`/${locale}/case-research`)
  redirect(`/${locale}/case-research`)
}

export const getCaseStudy = async (caseStudyId: string) => {
  return await db
    .select()
    .from(case_study)
    .where(eq(case_study.id, caseStudyId))
}

export const getCaseStudyFiles = async (caseStudyId: string) => {
  return await db
    .select()
    .from(case_study_files)
    .where(eq(case_study_files.case_study_id, caseStudyId))
    .orderBy(desc(case_study_files.createdAt))
}

export const deleteCaseStudyFile = async (
  caseStudyFileId: string,
  caseId: string
) => {
  const locale = getLocaleFromCookies()
  await db
    .delete(case_study_files)
    .where(eq(case_study_files.id, caseStudyFileId))
  revalidatePath(`/${locale}/case-research/${caseId}`)
}

export const getCaseStudyMessages = async (caseStudyId: string) => {
  return await db
    .select()
    .from(case_study_messages)
    .where(eq(case_study_messages.case_study_id, caseStudyId))
    .orderBy(asc(case_study_messages.createdAt))
}
export const saveCaseMessage = async (
  caseStudyId: string,
  role: string,
  message: string
) => {
  const locale = getLocaleFromCookies()
  const data = await db
    .insert(case_study_messages)
    .values({
      content: message,
      case_study_id: caseStudyId,
      role,
    })
    .returning({ caseStudyMessageId: case_study_messages.id })
  const caseStudyMessageId = data[0].caseStudyMessageId
  revalidatePath(`/${locale}/case-research`)
  revalidatePath(`/${locale}/case-research/${caseStudyId}`)
  // return caseStudyMessageId;
}

//File upload code

export const saveCaseFile = async ({
  caseStudyId,
  base64Source,
  fileName,
  fileSize,
  fileType,
}: {
  caseStudyId: string
  base64Source: string
  fileName: string
  fileType: string
  fileSize: number
}) => {
  const locale = getLocaleFromCookies()
  const formatted64 = base64Source.split(',')[1]
  const extractedText = await analyzeDocument(formatted64)
  if (extractedText) {
    const splittedDocuments = await splitDocuments(extractedText)
    const documents = splittedDocuments.map(
      (doc) =>
        new Document({
          pageContent: doc,
          metadata: { fileName, caseStudyId },
        })
    )
    const vectorStore = await createPostgressVectorStore(caseStudyId)
    await vectorStore.addDocuments(documents)
    await db.insert(case_study_files).values({
      case_study_id: caseStudyId,
      file_name: fileName,
      file_content: extractedText,
      file_blob: formatted64,
      file_path: 'storage',
      file_size: fileSize.toString(),
      file_type: fileType,
    })
    revalidatePath(`/${locale}/case-research/${caseStudyId}`)
  }
}

const analyzeDocument = async (base64Source: string) => {
  const endpoint = process.env.DI_ENDPOINT
  const key = process.env.DI_KEY
  const client = DocumentIntelligence(endpoint!, new AzureKeyCredential(key!))
  const initialResponse = await client
    .path('/documentModels/{modelId}:analyze', 'prebuilt-read')
    .post({
      contentType: 'application/json',
      body: {
        base64Source,
      },
      queryParameters: { locale: 'en-IN' },
    })

  if (isUnexpected(initialResponse)) {
    throw initialResponse.body.error
  }
  const poller = await getLongRunningPoller(client, initialResponse)
  const result = (await poller.pollUntilDone())
    .body as AnalyzeResultOperationOutput

  // console.log(result);
  // let content: string = "";

  // if (result.analyzeResult?.pages) {
  //   console.log(result.analyzeResult.pages.length);

  //   for (const page of result.analyzeResult.pages) {
  //     if (page && page.lines) {
  //       page.lines.forEach((line) => {
  //         content += line.content;
  //       });
  //     }
  //   }
  // }
  // console.log(content);

  return result.analyzeResult?.content
}

const splitDocuments = async (content: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 6000,
    chunkOverlap: 100,
  })
  const splitDocuments = await splitter.splitText(content)
  return splitDocuments
}

export const getAggregatedResultsByFilename = async (
  query: string,
  vectorStore: any
) => {
  const results = await vectorStore.similaritySearch(query, 5)

  const aggregatedResults = results.reduce((acc: any, result: any) => {
    const filename = result.metadata?.fileName || 'Unknown file'
    acc[filename] = (acc[filename] || '') + result.pageContent + ' '
    return acc
  }, {} as { [key: string]: string })

  Object.entries(aggregatedResults).forEach(
    ([filename, content]: any, index) => {
      console.log(`Aggregated Content for File ${index + 1}:`, {
        filename,
        content_preview: content.slice(0, 100) + '...',
        content,
      })
    }
  )

  return aggregatedResults
}

export const createPostgressVectorStore = async (caseStudyId: string) => {
  const reusablePool = new pg.Pool({
    host: 'c-publisize-postgress.rcf5qaewuyzyua.postgres.cosmos.azure.com',
    port: 5432,
    user: 'citus',
    password: 'Db_pass123',
    database: 'citus',
    ssl: true,
  })
  const originalConfig = {
    pool: reusablePool,
    tableName: 'case_files_embedding',
    collectionName: caseStudyId,
    collectionTableName: 'case_files_collection',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'document',
      metadataColumnName: 'metadata',
    },
  }
  const embeddings = new OpenAIEmbeddings()
  const pgvectorStore = new PGVectorStore(embeddings, originalConfig)
  return pgvectorStore
}
