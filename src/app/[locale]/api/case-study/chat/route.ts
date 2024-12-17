import { OpenAIEmbeddings } from '@langchain/openai'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { wrapAISDKModel } from 'langsmith/wrappers/vercel'
import { streamText, tool, convertToCoreMessages, StreamData } from 'ai'
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import db from '@/db/drizzle'
import { CASE_STUDY_PROMPTS } from '@/lib/prompts/case_study'
import {
  createPostgressVectorStore,
  saveCaseMessage,
} from '@/app/[locale]/actions/case_study_actions'
import { cookies } from 'next/headers'

export const maxDuration = 30
const maxOutputTokenSize = 4000

export async function POST(req: Request) {
  const { messages, caseId, model, includeLawbotAnswers, locale } =
    await req.json()
  const data = new StreamData()
  try {
    console.log('POST request initiated')

    let selectedModel = await getLLMModel('claude-3-5-sonnet@20241022')
    console.log('Model loaded')

    const vectorStore = await createPostgressVectorStore(caseId)
    console.log('Vector store created')

    const results = await vectorStore.similaritySearch('filename_fetch', 5)
    console.log(`Similarity search executed with ${results.length} results`)

    results.forEach((result, index) => {
      console.log(`Result ${index + 1}:`, {
        filename: result.metadata?.fileName ?? 'Undefined filename',
        content_preview: result.pageContent.slice(0, 100) + '...',
      })
    })

    const caseFileNames = Array.from(
      new Set(
        results.map((result) => result.metadata?.fileName).filter(Boolean)
      )
    )
    console.log(`Case file names extracted: ${caseFileNames.length} files`)

    const caseFileNamesString = `The following case files are available for reference: <case_file_name>${caseFileNames.join(
      ', '
    )}</case_file_name>. `
    const systemPrompt = `${caseFileNamesString}\n\n${CASE_STUDY_PROMPTS[locale]}`
    console.log('System prompt constructed')

    const result = await streamText({
      model: wrapAISDKModel(selectedModel, { name: 'case_study' }),
      system: systemPrompt,
      maxTokens: maxOutputTokenSize,
      tools: {
        answerQuestions: tool({
          description:
            'Use this to provide detailed, case-specific insights or responses based on uploaded documents and case context. Do not mention the answerQuestions function. ',
          parameters: z.object({
            query: z.string().describe('Query of the user'),
          }),
          execute: async ({ query }) => {
            console.log('Tool execution started with query:', query)

            try {
              const vectorStore = await createPostgressVectorStore(caseId)
              const results = await vectorStore.similaritySearch(query, 5)

              console.log('Detailed Similarity Search Results:')
              results.forEach((result, index) => {
                console.log(`Match ${index + 1}:`, {
                  filename: result.metadata?.fileName ?? 'Undefined filename',
                  content_preview: result.pageContent.slice(0, 100) + '...',
                })
              })

              const resultArray = results.map((result) => ({
                content: result.pageContent,
                filename: result.metadata?.fileName || 'Unknown file',
              }))

              data.append({ caseFileData: resultArray })

              if (includeLawbotAnswers) {
                const model = new OpenAIEmbeddings({
                  apiKey: process.env.OPENAI_API_KEY!,
                  model: 'text-embedding-3-large',
                })
                const embeddings = await model.embedQuery(query)
                const embeddedQuery = `[${embeddings.toString()}]`
                const dbResults = await db.execute(
                  sql`select * from match_documents_adaptive(${embeddedQuery}, 5)`
                )
                const lawbotData = dbResults.map((row) => row['document'])
                console.log('Lawbot data retrieval complete')

                return JSON.stringify({
                  case_data: resultArray,
                  lawbot_data: lawbotData,
                })
              }

              return JSON.stringify(resultArray)
            } catch (e: any) {
              console.log('Error in tool execution', e.message)
              return e
            }
          },
        }),
      },
      messages: convertToCoreMessages(messages),
      async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
        console.log(`Streaming finished with reason: ${finishReason}`)
        data.close()
      },
    })

    return result.toDataStreamResponse({ data })
  } catch (error: any) {
    console.error('Error in POST handler:', error.message)
    data.close()
    throw error
  }
}
