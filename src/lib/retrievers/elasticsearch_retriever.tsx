import { Client } from '@elastic/elasticsearch'
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
    index = 'collection_law_embeddings',
    model_name = 'voyage-3',
    knn_k = 50,
    knn_num_candidates = 100,
    rrf_rank_window_size = 50,
    rrf_rank_constant = 20,
  } = options

  // Generate vector query using Voyage-3
  const voyageClient = new VoyageAIClient({
    apiKey: process.env.VOYAGE_API_KEY!,
  })
  const voyage_response: VoyageAI.EmbedResponse = await voyageClient.embed({
    model: model_name,
    input: searchQuery,
    inputType: 'query',
  })
  const vectorQuery = voyage_response?.data?.[0]?.embedding

  try {
    // Define source fields based on index
    const sourceFields =
      index === 'pastcase_collection'
        ? ['metadata.*', 'full_text']
        : [
            'pageContent',
            'metadata.fek_title',
            'metadata.fek_name',
            'metadata.year',
          ]

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
      _source: sourceFields,
      size: rrf_rank_window_size,
    })

    const hits = response.hits.hits
    if (hits.length === 0) {
      return []
    }

    // Process hits based on index type
    if (index === 'pastcase_collection') {
      // Type for pastcase_collection
      type PastCaseSourceType = {
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
        }
        full_text?: string
      }

      return hits.map((hit) => {
        const source = hit._source as PastCaseSourceType
        const metadata = source?.metadata

        const metadataString = metadata
          ? Object.entries(metadata)
              .map(([key, value]) => (value ? `${key}: ${value}` : ''))
              .filter(Boolean)
              .join('\n')
          : ''

        const fullText = source?.full_text
          ? `Full Text: ${source.full_text}`
          : ''

        return [metadataString, fullText].filter(Boolean).join('\n')
      })
    } else {
      // Type for collection_law_embeddings
      type LawEmbeddingsSourceType = {
        pageContent: string | null
        metadata: {
          year: number | null
          fek_title: string | null
          fek_name: string | null
          file_name: string | null
        }
      }

      return hits
        .map((hit) => {
          const source = hit._source as LawEmbeddingsSourceType
          return source.pageContent || ''
        })
        .filter((content) => content !== '')
    }
  } catch (error) {
    console.error('Error performing hybrid search:', error)
    return []
  }
}
