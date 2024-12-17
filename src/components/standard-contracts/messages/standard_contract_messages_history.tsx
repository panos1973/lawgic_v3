import { Message } from 'ai'
import { unstable_noStore as noStore } from 'next/cache'
import ContractChat from '../standard_contract_chat'
import {
  getAStandardContractFile,
  getStandardContractDrafts,
  getDataFieldsOfStandardContracts,
  getSectionsOfStandardContract,
} from '@/app/[locale]/actions/standard_contract_actions'
import {
  Contract,
  ContractDataField,
  ContractDraft,
  ContractFile,
  ContractSection,
} from '@/lib/types/types'
import { auth } from '@clerk/nextjs/server'

const StandardContractMessageHistory = async ({ id }: { id?: string }) => {
  noStore()
  const { userId } = auth()
  let contractFiles: ContractFile[] = []
  let sections: ContractSection[] = []
  let dataFields: ContractDataField[] = []
  let drafts: ContractDraft[] = []

  if (id) {
    contractFiles = (await getAStandardContractFile(id!)) as any
    sections = (await getSectionsOfStandardContract(id!)) as any
    dataFields = (await getDataFieldsOfStandardContracts(
      id!
    )) as ContractDataField[]
    drafts = (await getStandardContractDrafts(id)) as any
  }

  // console.log('====================================')
  // console.log(drafts)
  // console.log('====================================')
  return (
    <div>
      <ContractChat
        contractId={id ?? ''}
        sections={sections as ContractSection[]}
        fields={dataFields as ContractDataField[]}
        contractFiles={contractFiles as any}
        drafts={drafts}
      />
    </div>
  )
}

export default StandardContractMessageHistory
