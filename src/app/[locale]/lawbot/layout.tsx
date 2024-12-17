// layout.tsx

import { Suspense } from 'react'
import ChatHistory from '@/components/chat/chat_history'
import ChatHistoryLoader from '@/components/chat/chat_history_loader'
import CreateNewChat from '@/components/chat/create_new_chat'
import LawbotMobileTopNav from '@/components/chat/mobile_top_nav'

export const metadata = {
  title: 'Lawgic',
  description: 'Lawbot',
}

export default async function LawbotLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="hidden md:block w-[15%] md:w-[20%] h-[93svh] border-r border-slate-100 bg-slate-50 py-4 overflow-y-hidden">
        <div className="px-2 pb-4">
          <CreateNewChat variant="outline" />
        </div>

        <Suspense fallback={<ChatHistoryLoader />}>
          <ChatHistory />
        </Suspense>
      </div>
      <div className="md:hidden">
        <LawbotMobileTopNav />
      </div>
      <div className="w-full md:w-[85%] ">{children}</div>
    </div>
  )
}
