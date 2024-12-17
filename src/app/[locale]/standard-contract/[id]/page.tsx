import MessageHistoryLoader from '@/components/chat/messages/message_loader'
import { Suspense } from 'react'
import { unstable_noStore as noStore } from 'next/cache'
import StandardContractMessageHistory from '@/components/standard-contracts/messages/standard_contract_messages_history'

export const maxDuration = 60

const CasePage = ({ params }: { params: { id: string } }) => {
  noStore()
  return (
    <div className="flex">
      <div className="w-full">
        <Suspense fallback={<MessageHistoryLoader />}>
          <StandardContractMessageHistory id={params.id} />
        </Suspense>
      </div>
    </div>
  )
}

export default CasePage
