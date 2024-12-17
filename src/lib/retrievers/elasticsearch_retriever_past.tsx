import { Client } from '@elastic/elasticsearch'
import { OpenAIEmbeddings } from '@langchain/openai'
import { VoyageAIClient, VoyageAI } from 'voyageai'

// Create an Elasticsearch client
const client = new Client({
  cloud: { id: process.env.ELASTICSEARCH_CLOUD_ID! },
  auth: { apiKey: process.env.ELASTICSEARCH_API_KEY! },
})

export async function elasticsearchRetrieverHybridSearch(
  searchQuery: string,
  options: {
    index?: string
    knn_k?: number
    knn_num_candidates?: number
    rrf_rank_window_size?: number
    rrf_rank_constant?: number
    model_name?: string
  } = {}
): Promise<string[]> {
  const {
    index = 'pastcase_collection',
    knn_k = 50,
    knn_num_candidates = 100,
    rrf_rank_window_size = 50,
    rrf_rank_constant = 20,
    model_name = 'voyage-3',
  } = options

  let vectorQuery
  if (model_name == 'text-embedding-3-large') {
    const model = new OpenAIEmbeddings({
      apiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-3-large',
    })
    vectorQuery = await model.embedQuery(searchQuery)
  } else if (model_name == 'voyage-3') {
    const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY! })
    const voyage_response: VoyageAI.EmbedResponse = await client.embed({
      model: model_name,
      input: searchQuery,
      inputType: 'query',
    })
    vectorQuery = voyage_response?.data?.[0]?.embedding
  }

  try {
    const response = await client.search({
      index: index,
      retriever: {
        rrf: {
          retrievers: [
            {
              standard: {
                query: {
                  match: {
                    pageContent: searchQuery,
                  },
                },
              },
            },
            {
              knn: {
                field: 'embedding',
                query_vector: vectorQuery,
                k: knn_k,
                num_candidates: knn_num_candidates,
              },
            },
          ],
          rank_window_size: rrf_rank_window_size,
          rank_constant: rrf_rank_constant,
        },
      },
      _source: [
        'metadata.*', // Fetch all metadata fields
        'full_text', // Full text of the document
      ],
      size: rrf_rank_window_size,
    })

    // Log the Elasticsearch response
    console.log('Elasticsearch response:', JSON.stringify(response, null, 2))

    // Extract and process the hits
    const hits = response.hits.hits
    console.log('Extracted hits:', JSON.stringify(hits, null, 2))

    if (hits.length === 0) {
      return []
    }

    // Define the type for `_source`
    type SourceType = {
      metadata?: {
        court?: string
        decision_number?: string
        decision_date?: string
        case_type?: string
        main_laws?: string
        key_articles?: string
        primary_issue?: string
        monetary_amount?: string
        currency?: string
        important_dates?: string
        procedure_type?: string
        legal_field?: string
        outcome_type?: string
        court_level?: string
        ['File Name']?: string
        full_text?: string
      }
      full_text?: string
    }

    // Convert each hit into a single concatenated string
    const stringResults: string[] = hits.map((hit) => {
      const source = hit._source as SourceType
      const metadata = source?.metadata

      // Concatenate all fields for this hit
      const hitString = metadata
        ? Object.entries(metadata)
            .map(([key, value]) => (value ? `${key}: ${value}` : ''))
            .filter(Boolean)
            .join('\n')
        : ''

      const fullText = source?.full_text ? `Full Text: ${source.full_text}` : ''

      return [hitString, fullText].filter(Boolean).join('\n')
    })

    // Log the final array of strings for debugging
    console.log('Final String Results:', stringResults)

    return stringResults // Return the array of concatenated strings
  } catch (error) {
    console.error('Error performing hybrid search:', error)
    return []
  }
}
