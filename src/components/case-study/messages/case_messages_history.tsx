import { NextPage } from 'next'
import CaseChat from '../case_chat'
import { getMessagesOfAchat } from '@/app/[locale]/actions/chat_actions'
import { Message } from 'ai'
import { unstable_noStore as noStore } from 'next/cache'
import {
  getCaseStudyFiles,
  getCaseStudyMessages,
} from '@/app/[locale]/actions/case_study_actions'

const CaseMessageHistory = async ({ id }: { id: string }) => {
  noStore()
  const msg = await getCaseStudyMessages(id)
  const files: any = await getCaseStudyFiles(id)

  return (
    <div>
      <CaseChat
        caseId={id}
        prevMessages={msg as Message[]}
        files={files}
      />
    </div>
  )
}

export default CaseMessageHistory
