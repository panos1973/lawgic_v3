import { auth } from '@clerk/nextjs/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import StandardContractChatLinks from './standard_contract_chat_links'
import { getStandardContracts } from '@/app/[locale]/actions/standard_contract_actions'

const StandardContractChatHistory = async () => {
  noStore()
  const { userId } = auth()
  const contracts = await getStandardContracts(userId!)

  const translations = await getTranslations('standardContract.home')
  const contractTranslations = {
    history: translations('history'),
    massDelete: translations('massDelete'),
    cancel: translations('cancel'),
    accept: translations('accept'),
    deleteConfirmation: translations('deleteConfirmation'),
    deleteToastSuccess: translations('deleteToastSuccess'),
    deleteToastLoading: translations('deleteToastLoading'),
    massDeleteToastSuccess: translations('massDeleteToastSuccess'),
    massDeleteToastLoading: translations('massDeleteToastLoading'),
  }

  return (
    <div className="overflow-y-scroll max-h-[83svh] no-scrollbar">
      {!contracts.length && (
        <p className="text-sm text-center mt-4">
          Create a contract to get started
        </p>
      )}
      <StandardContractChatLinks
        contracts={contracts}
        contractTranslations={contractTranslations}
      />
    </div>
  )
}

export default StandardContractChatHistory
