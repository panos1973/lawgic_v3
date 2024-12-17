import type { Metadata } from 'next'

import { Suspense } from 'react'
import ChatHistory from '@/components/chat/chat_history'
import ChatHistoryLoader from '@/components/chat/chat_history_loader'
import CreateNewChat from '@/components/chat/create_new_chat'
import CaseStudyHistory from '@/components/case-study/case_study_history'
import CreateNewCaseStudy from '@/components/case-study/create_new_case_study'
import CaseMobileTopNav from '@/components/case-study/mobile_top_nav'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  title: 'Lawgic | Case Study',
  description: 'Case Study',
}

export default async function CaseStudyLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: { lang: string }
}>) {
  const t = await getTranslations('caseResearch.home')

  return (
    <div className="flex flex-col md:flex-row w-full">
      <div className="hidden md:block w-[15%] md:w-[20%]  border-r border-slate-100 h-[93svh]  bg-slate-50 py-4 overflow-y-hidden">
        <div className="px-2 pb-4">
          <CreateNewCaseStudy variant="outline" />
        </div>
        {/* <div className="flex mb-4 justify-between items-center px-2">
          <p className="text-xs font-semibold tracking-wide uppercase text-slate-600">
            {t("researches")}
          </p>
        </div> */}
        <Suspense fallback={<ChatHistoryLoader />}>
          <CaseStudyHistory />
        </Suspense>
      </div>
      <div className="md:hidden">
        <CaseMobileTopNav />
      </div>
      <div className=" w-full  md:w-[85%]">{children}</div>
    </div>
  )
}
