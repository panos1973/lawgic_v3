'use server'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import db from '@/db/drizzle'
import {
  chat_files,
  chats,
  messages,
  user_lawbot_preferences,
} from '@/db/schema'
import { generateObject } from 'ai'
import { asc, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { cookies } from 'next/headers'
import pg from 'pg'
import DocumentIntelligence, {
  getLongRunningPoller,
  AnalyzeResultOperationOutput,
  isUnexpected,
} from '@azure-rest/ai-document-intelligence'
import { AzureKeyCredential } from '@azure/core-auth'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

let cachedLLMModel: any = null

const getLocaleFromCookies = () => {
  const cookieStore = cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')
  return localeCookie ? localeCookie.value : 'el' // Default to Greek
}

export const getLawbotPreferences = async (userId: string) => {
  const prefs = await db
    .select()
    .from(user_lawbot_preferences)
    .where(eq(user_lawbot_preferences.userId, userId))
    .limit(1)

  if (prefs.length === 0) {
    const defaultPrefs = await db
      .insert(user_lawbot_preferences)
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

export const updateLawbotPreferences = async (
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
    .update(user_lawbot_preferences)
    .set({
      ...preferences,
      updatedAt: new Date(),
    })
    .where(eq(user_lawbot_preferences.userId, userId))

  revalidatePath(`/${locale}/lawbot`)
}

export const getChats = async (userId: string) => {
  const data = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.createdAt))

  return data
}

export const updateChatNote = async (chatId: string, note: string) => {
  const locale = getLocaleFromCookies()
  await db.update(chats).set({ note }).where(eq(chats.id, chatId))

  revalidatePath(`/${locale}/lawbot/${chatId}`)
}

export const addChat = async ({
  title,
  userId,
}: {
  title?: string
  userId: string
}) => {
  const locale = getLocaleFromCookies()
  const ctitle = title ? title : generateChatTitle(locale)
  const data = await db
    .insert(chats)
    .values({
      title: ctitle,
      userId,
    })
    .returning({ chatId: chats.id })
  revalidatePath(`/${locale}/lawbot`)
  redirect(`/${locale}/lawbot/${data[0].chatId}`)
}

const generateChatTitle = (locale: string) => {
  return locale === 'el'
    ? `Νέα Συνομιλία ${Math.floor(Math.random() * 190).toFixed(0)}`
    : `New Chat ${Math.floor(Math.random() * 190).toFixed(0)}`
}

export const createMeaningfulchatTitle = async (
  chatId: string,
  context: string
) => {
  const locale = getLocaleFromCookies()

  // Cache the LLM model
  if (!cachedLLMModel) {
    cachedLLMModel = await getLLMModel('claude-3-haiku@20240307')
  }

  const { object: title } = await generateObject({
    model: cachedLLMModel,
    system: `
      You can generate meaningful conversation titles based on chat context.
      Titles must be compact and meaningful.
      Use the context provided to generate title.
      Titles must be no longer than 120 characters.
      The title should always be in ${locale === 'el' ? 'Greek' : 'English'}.
    `,
    prompt: `Generate a title based on this context: ${context}`,
    schema: z.object({
      title: z.string().describe('Title of the chat'),
    }),
  })

  await db
    .update(chats)
    .set({
      title: title.title,
    })
    .where(eq(chats.id, chatId))

  revalidatePath(`/${locale}/lawbot`)
  revalidatePath(`/${locale}/lawbot/${chatId}`)
}

export const addMessage = async (
  chatId: string,
  role: string,
  content: string
) => {
  const locale = getLocaleFromCookies()
  await db.insert(messages).values({
    chatId,
    content,
    role,
  })
  revalidatePath(`/${locale}/lawbot/${chatId}`)
}

export const getMessagesOfAchat = async (chatId: string) => {
  const data = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt))

  return data
}

export const deleteChat = async (chatId: string) => {
  const locale = getLocaleFromCookies()
  await db.delete(chats).where(eq(chats.id, chatId))
  revalidatePath(`/${locale}/lawbot`)
  redirect(`/${locale}/lawbot`)
}

export const getChatFiles = async (chatId: string) => {
  return await db
    .select()
    .from(chat_files)
    .where(eq(chat_files.chat_id, chatId))
    .orderBy(desc(chat_files.createdAt))
}

export const deleteChatFile = async (chatFileId: string, chatId: string) => {
  const locale = getLocaleFromCookies()
  await db.delete(chat_files).where(eq(chat_files.id, chatFileId))
  revalidatePath(`/${locale}/lawbot/${chatId}`)
}

//File upload code

export const saveChatFile = async ({
  chatId,
  base64Source,
  fileName,
  fileSize,
  fileType,
}: {
  chatId: string
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
    const documents = splittedDocuments.map((doc) => ({
      pageContent: doc,
      metadata: { fileName, chatId },
    }))
    const vectorStore = await createPostgressVectorStore(chatId)
    await vectorStore.addDocuments(documents)
    await db.insert(chat_files).values({
      chat_id: chatId,
      file_name: fileName,
      file_content: extractedText,
      file_blob: formatted64,
      file_path: 'storage',
      file_size: fileSize.toString(),
      file_type: fileType,
    })
    revalidatePath(`/${locale}/lawbot/${chatId}`)
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

  return result.analyzeResult?.content
}

const splitDocuments = async (content: string) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 6000,
    chunkOverlap: 100,
  })
  return await splitter.splitText(content)
}

export const createPostgressVectorStore = async (chatId: string) => {
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
    tableName: 'chat_files_embedding',
    collectionName: chatId,
    collectionTableName: 'chat_files_collection',
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
