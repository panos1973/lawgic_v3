import { wrapAISDKModel } from 'langsmith/wrappers/vercel'
import { traceable, getCurrentRunTree } from 'langsmith/traceable'
import { VoyageAIClient, VoyageAI } from 'voyageai'
import { elasticsearchRetrieverHybridSearch } from '@/lib/retrievers/elasticsearch_retriever'
import { postgressRetriever } from '@/lib/retrievers/postgress_retriever'
import { streamText, tool, convertToCoreMessages } from 'ai'
import { z } from 'zod'
import { LAW_CHAT_PROMPTS } from '@/lib/prompts/law_chat'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { cookies } from 'next/headers'
import { decodeEscapedString } from '@/lib/decoding'
import { createPostgressVectorStore } from '../../actions/chat_actions'
// Allow streaming responses up to 30 seconds
export const maxDuration = 30

// max number of tokens to output
const maxOutputTokenSize = 4000
// use voyage ai for reranking
const useVoyage = true
// max number of characters to retrieve in the reranker
const max_law_characters_v1 = 175_000
const max_law_characters_v2 = 100_000
const max_pastcase_characters = 250_000
// number of documents to return
const reranked_k = 15
// return decisions in the reranked results
// const includeGreekCourtDecisions = false

// retrieve and filter data from the retrievers function
async function retrieveAndFilterData(
  query: string,
  index: string,
  maxCharacters: number,
  model_name?: string
) {
  try {
    let retrieved_data: string[] = []
    if (process.env.USE_POSTGRES_EMBEDDINGS === 'true') {
      console.log('using postgres retriever')
      retrieved_data = await postgressRetriever(query)
    } else {
      console.log('using elasticsearch retriever')
      retrieved_data = await elasticsearchRetrieverHybridSearch(query, {
        knn_k: 200,
        knn_num_candidates: 1000,
        rrf_rank_window_size: 200,
        rrf_rank_constant: 20,
        index: index,
        model_name: model_name,
      })
      retrieved_data = retrieved_data.map(decodeEscapedString)
    }
    let total_characters = 0
    const filtered_data = []

    for (const doc of retrieved_data) {
      if (total_characters + doc.length <= maxCharacters) {
        filtered_data.push(doc)
        total_characters += doc.length
      } else {
        console.log('max_characters reached in ', filtered_data.length)
        break
      }
    }

    return filtered_data
  } catch (error) {
    console.error('Error in retrieveAndFilterData:', error)
    return []
  }
}

async function processUploadedFiles(chatId: any) {
  try {
    const vectorStore = await createPostgressVectorStore(chatId)
    console.log('Vector store created for chat files')

    const results = await vectorStore.similaritySearch('filename_fetch', 5)
    console.log(`Similarity search executed with ${results.length} results`)

    const chatFileNames = Array.from(
      new Set(
        results.map((result) => result.metadata?.fileName).filter(Boolean)
      )
    )
    console.log(`Chat file names extracted: ${chatFileNames.length} files`)

    return {
      chatFiles: chatFileNames,
      chatFileDetails: results.map((result) => ({
        filename: result.metadata?.fileName ?? 'Undefined filename',
        content_preview: result.pageContent.slice(0, 100) + '...',
        full_content: result.pageContent,
      })),
    }
  } catch (error) {
    console.error('Error in processUploadedFiles:', error)
    return { chatFiles: [], chatFileDetails: [] }
  }
}

// Helper function to generate collection strings based on preferences
function getCollectionStrings(preferences: any, locale: string) {
  const collections: any = {
    en: {
      availableCollections: '',
      searchInstructions: '',
    },
    el: {
      availableCollections: '',
      searchInstructions: '',
    },
  }

  const {
    includeGreekLaws,
    includeGreekCourtDecisions,
    includeEuropeanLaws,
    includeEuropeanCourtDecisions,
  } = preferences

  let enCollections = []
  let elCollections = []

  if (includeGreekLaws) {
    enCollections.push(
      '• Greek Laws Collection (collection_law_embeddings): Contains Greek legislation up to 2023',
      '• Greek Laws 2024 Collection (collection_law_embeddings_2024): Contains latest Greek legislation from 2024'
    )
    elCollections.push(
      '• Συλλογή Ελληνικής Νομοθεσίας (collection_law_embeddings): Περιέχει την ελληνική νομοθεσία έως το 2023',
      '• Συλλογή Νέας Ελληνικής Νομοθεσίας 2024 (collection_law_embeddings_2024): Περιέχει την πιο πρόσφατη ελληνική νομοθεσία του 2024'
    )
  }

  if (includeGreekCourtDecisions) {
    enCollections.push(
      '• Past Cases Collection (pastcase_collection): Contains historical court decisions and case law'
    )
    elCollections.push(
      '• Συλλογή Νομολογίας (pastcase_collection): Περιέχει ιστορικές δικαστικές αποφάσεις και νομολογία'
    )
  }

  collections.en.availableCollections = enCollections.join('\n')
  collections.el.availableCollections = elCollections.join('\n')

  return collections[locale]
}

export async function POST(req: Request) {
  // Use traceable inside the handler
  return await traceable(
    async () => {
      const { messages, chatId, model, locale, preferences } = await req.json()

      const {
        includeGreekLaws,
        includeGreekCourtDecisions,
        includeEuropeanLaws,
        includeEuropeanCourtDecisions,
        includeGreekBibliography,
        includeForeignBibliography,
      } = preferences || {
        includeGreekLaws: true,
        includeGreekCourtDecisions: false,
        includeEuropeanLaws: false,
        includeEuropeanCourtDecisions: false,
        includeGreekBibliography: false,
        includeForeignBibliography: false,
      }
      // let cookieStore = cookies();
      // let locale = (cookieStore.get("NEXT_LOCALE")?.value as string) ?? "el";
      // query: z.string().describe('Query of the user'),

      // Call the processUploadedFiles function
      // Fetch uploaded file data
      const uploadedFileData = await processUploadedFiles(chatId)
      console.log('Uploaded file data processed:', uploadedFileData)

      if (
        uploadedFileData.chatFileDetails &&
        uploadedFileData.chatFileDetails.length > 0
      ) {
        const fileContents = uploadedFileData.chatFileDetails
          .map(
            (file) =>
              `Filename: ${file.filename}\nContent Preview: ${file.full_content}`
          )
          .join('\n\n')

        // Merge the file content into the initial system message
        const initialSystemMessageIndex = messages.findIndex(
          (msg: { role: string }) => msg.role === 'system'
        )
        if (initialSystemMessageIndex !== -1) {
          messages[
            initialSystemMessageIndex
          ].content += `\n\nThe user has uploaded the following file(s). Use this information to enhance your analysis:\n${fileContents}`
        } else {
          // Add a fallback system message if none exists
          messages.unshift({
            role: 'system',
            content: `The user has uploaded the following file(s). Use this information to enhance your analysis:\n${fileContents}`,
          })
        }
      }

      console.log(locale)
      const now = new Date()
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${now.getFullYear()}`

      // Get collection strings based on preferences
      const collectionStrings = getCollectionStrings(preferences, locale)

      // Replace all template variablesW
      let promptWithDate = LAW_CHAT_PROMPTS[locale]
        .replace('{{currentDate}}', formattedDate)
        .replace(
          '{{availableCollections}}',
          collectionStrings.availableCollections
        )
        .replace('{{searchInstructions}}', collectionStrings.searchInstructions)
      let selectedModel = await getLLMModel('claude-3-5-sonnet@20241022')
      // console.log('prompt:', promptWithDate)
      const result = await streamText({
        model: wrapAISDKModel(selectedModel, { name: 'athena' }),
        system: promptWithDate,
        maxTokens: maxOutputTokenSize,
        tools: {
          answerLawQuestions: tool({
            description:
              'Answers questions related to Laws, Bibliography, and Past Cases',
            parameters: z.object({
              query: z
                .string()
                .describe(
                  'Exact user query as provided without modifications, paraphrasing, or any other alterations'
                ),
            }),
            execute: traceable(
              async ({ query }) => {
                // max number of characters to retrieve in the reranker
                const law_retrieved_data = await retrieveAndFilterData(
                  query,
                  'greek_laws_collection',
                  max_law_characters_v2,
                  'voyage-3'
                )
                console.log('answerLawQuestions', law_retrieved_data.length)
                let combined_retrieved_data = law_retrieved_data
                if (includeGreekCourtDecisions) {
                  const pastcase_retrieved_data = await retrieveAndFilterData(
                    query,
                    'pastcase_collection',
                    max_pastcase_characters
                  )
                  console.log(
                    'pastcase_retrieved_data',
                    pastcase_retrieved_data.length
                  )
                  combined_retrieved_data = [
                    ...law_retrieved_data,
                    ...pastcase_retrieved_data,
                  ]
                }
                if (!useVoyage) {
                  return combined_retrieved_data.slice(0, 15)
                }
                try {
                  const voyageClient = new VoyageAIClient({
                    apiKey: process.env.VOYAGE_API_KEY!,
                  })
                  const voyage_results: VoyageAI.RerankResponse =
                    await voyageClient.rerank({
                      model: 'rerank-1',
                      query: query,
                      documents: combined_retrieved_data,
                      topK: reranked_k,
                    })
                  console.log('voyage_results', voyage_results)
                  const ranked_results = voyage_results.data?.map((result) => {
                    const index = result.index
                    return index !== undefined
                      ? combined_retrieved_data[index]
                      : undefined
                  })
                  if (ranked_results) {
                    console.log(
                      'athena_rerankedAnswerLawQuestions',
                      ranked_results.length
                    )
                    return ranked_results
                  } else {
                    return combined_retrieved_data.slice(0, reranked_k * 2)
                  }
                } catch (e) {
                  console.error(e)
                  return combined_retrieved_data.slice(0, reranked_k * 2)
                }
              },
              { name: 'athena_retriever', run_type: 'retriever' }
            ),
          }),
        },
        messages: convertToCoreMessages(messages),
      })

      const runTree = getCurrentRunTree()
      const runId = runTree?.id ?? null

      // Return a new Response with the modified stream
      return new Response(result.toDataStream(), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'Run-Id': runId ?? '',
          'Uploaded-Files': Buffer.from(
            JSON.stringify(uploadedFileData.chatFiles)
          ).toString('base64'),
        },
      })
    },
    { name: 'athena_api' }
  )()
}
