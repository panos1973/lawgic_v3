import type { Metadata } from 'next'
import ContractsTopNav from '@/components/contracts/top_nav'
import CreateNewContractChat from '@/components/contracts/create_new_chat'
import { Suspense } from 'react'
import ChatHistoryLoader from '@/components/chat/chat_history_loader'
import ContractChatHistory from '@/components/contracts/contract_chat_history'
import { getTranslations } from 'next-intl/server'
import ContractsMobileTopNav from '@/components/contracts/mobile_top_nav'
import ContractHistoryLoader from '@/components/contracts/messages/history_loader'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Lawgic | Contracts',
  description: 'Contracts',
}

export default async function ContractsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const t = await getTranslations('contract.home')

  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="hidden md:block w-[15%] md:w-[20%] border-r border-slate-100 h-[93svh] bg-slate-50 py-4 overflow-y-hidden">
        <div className="px-2 pb-4">
          <CreateNewContractChat variant="outline" />
        </div>
        {/* <div className="flex mb-4 justify-between items-center px-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-600">
            {t('history')}
          </p>
        </div> */}
        <Suspense fallback={<ChatHistoryLoader />}>
          <ContractChatHistory />
        </Suspense>
      </div>
      <div className="md:hidden">
        <ContractsMobileTopNav />
      </div>
      <div className="w-full md:w-[85%]">{children}</div>
    </div>
  )
}
