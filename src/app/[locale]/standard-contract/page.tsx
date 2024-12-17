import { getTranslations } from 'next-intl/server'
import StandardContractMessageHistory from '@/components/standard-contracts/messages/standard_contract_messages_history'

const Page = async () => {
  const t = await getTranslations('standardContract.home')
  return <StandardContractMessageHistory />
}

export default Page
