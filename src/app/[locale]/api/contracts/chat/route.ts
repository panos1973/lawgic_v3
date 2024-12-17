import { OpenAIEmbeddings } from '@langchain/openai'
import { wrapAISDKModel } from 'langsmith/wrappers/vercel'
import { streamText, tool, convertToCoreMessages, StreamData } from 'ai'
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import db from '@/db/drizzle'
import {
  addMessage,
  createMeaningfulchatTitle,
} from '@/app/[locale]/actions/chat_actions'
import { LAW_CHAT_PROMPTS } from '@/lib/prompts/law_chat'
import { CASE_STUDY_PROMPTS } from '@/lib/prompts/case_study'
import {
  createPostgressVectorStore,
  saveCaseMessage,
} from '@/app/[locale]/actions/case_study_actions'
import { getLLMModel } from '@/lib/models/llmModelFactory'
import { CONTRACT_PROMPTS } from '@/lib/prompts/contract'
// import { saveContractMessage } from "@/app/[locale]/actions/contract_action";
import { cookies } from 'next/headers'
// Allow streaming responses up to 30 seconds
export const maxDuration = 30
const maxOutputTokenSize = 4000

export async function POST(req: Request) {
  try {
    const { messages, contractId, model, contract, fields, locale } =
      await req.json()
    // const data = new StreamData();
    // data.append({ outputTokenExceeded: false });
    // console.log(fields);
    console.log('snkds')

    // let cookieStore = cookies();
    // let locale = (cookieStore.get("NEXT_LOCALE")?.value as string) ?? "el";
    console.log(locale)

    let selectedModel = await getLLMModel('claude-3-5-sonnet@20240620')

    const result = await streamText({
      model: wrapAISDKModel(selectedModel, { name: 'contract' }),
      headers: {
        'anthropic-beta': 'max-tokens-3-5-sonnet-2024-07-15',
      },
      maxTokens: maxOutputTokenSize,
      system: CONTRACT_PROMPTS[locale],
      messages: convertToCoreMessages([
        {
          content: `Contracts : ${contract}, Replace the particulars with these data: ${fields} `,
          role: 'user',
          experimental_providerMetadata: {
            anthropic: { cacheControl: { type: 'ephemeral' } },
          },
        },
        ...messages,
      ]),

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
