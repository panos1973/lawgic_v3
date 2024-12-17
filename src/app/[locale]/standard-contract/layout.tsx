import type { Metadata } from 'next'
import { Suspense } from 'react'
import ChatHistoryLoader from '@/components/chat/chat_history_loader'
import { getTranslations } from 'next-intl/server'
import CreateNewStandardContractChat from '@/components/standard-contracts/create_new_standard_contract_chat'
import StandardContractChatHistory from '@/components/standard-contracts/standard_contract_chat_history'

export const metadata: Metadata = {
  title: 'Lawgic | Standard Contracts',
  description: 'Standard Contracts',
}

export default async function StandardContractsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const t = await getTranslations('standardContract.home')

  return (
    <>
      <div className="flex flex-col md:flex-row w-full">
        <div className="hidden md:block w-[15%] md:w-[20%]  border-r border-slate-100 h-[93svh]  bg-slate-50 py-4 overflow-y-hidden">
          <div className="px-2 pb-4">
            <CreateNewStandardContractChat variant="outline" />
          </div>
          <Suspense fallback={<ChatHistoryLoader />}>
            <StandardContractChatHistory />
          </Suspense>
        </div>
        <div className=" w-full  md:w-[85%]">{children}</div>
      </div>
    </>
  )
}
