import { wrapAISDKModel } from 'langsmith/wrappers/vercel'
import { streamText, convertToCoreMessages } from 'ai'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { STANDARD_CONTRACT_PROMPTS } from '@/lib/prompts/standard_contract'
import { getDataFieldsOfStandardContracts } from '@/app/[locale]/actions/standard_contract_actions'

export const maxDuration = 30
const maxOutputTokenSize = 4000

export async function POST(req: Request) {
  try {
    const { messages, contractId, model, contract, fields, locale } =
      await req.json()

    const contractFields = await getDataFieldsOfStandardContracts(contractId)
    console.log('Fetched Contract Data Fields:', contractFields)

    console.log('snkds')
    console.log(locale)

    let formattedUserInstructions =
      fields && fields.length > 0
        ? fields
            .map(
              (f: { field_name: any; value: any }) =>
                `${f.field_name}: ${f.value}`
            )
            .join('\n')
        : ''

    let systemPrompt = STANDARD_CONTRACT_PROMPTS[locale]
      .replace('{{CONTRACT_TEMPLATES}}', contract || '')
      .replace('{{USER_INSTRUCTIONS}}', formattedUserInstructions)
      .replace('{{CONTRACT_FIELDS}}', contractFields)

    let selectedModel = await getLLMModel('claude-3-5-sonnet@20240620')

    const result = await streamText({
      model: wrapAISDKModel(selectedModel, { name: 'contract' }),
      headers: {
        'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
      },
      maxTokens: maxOutputTokenSize,
      system: systemPrompt,
      messages: convertToCoreMessages([...messages]),

      async onFinish({ text, toolCalls, toolResults, usage, finishReason }) {
        //   if (finishReason === "stop" || finishReason === "length") {
        //     await saveContractMessage(contractChatId, "assistant", text);
        //   }
        //   data.close();
        // console.log(finishReason);
        // console.log(usage);
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.log(error)
    return new Response((error as any).message, { status: 500 })
  }
}
