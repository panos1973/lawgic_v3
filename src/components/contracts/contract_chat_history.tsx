import { auth } from '@clerk/nextjs/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getContracts } from '@/app/[locale]/actions/contract_action'
import ContractChatLinks from './contract_chat_links'
import { getTranslations } from 'next-intl/server'

const ContractChatHistory = async () => {
  noStore()
  const { userId } = auth()
  const contracts = await getContracts(userId!)
  const translations = await getTranslations('contract.home')
  const contractTranslations = {
    note: translations('note'),
    selectChatHistory: translations('selectChatHistory'),
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
      <ContractChatLinks
        contracts={contracts}
        contractTranslations={contractTranslations}
      />
    </div>
  )
}

export default ContractChatHistory
