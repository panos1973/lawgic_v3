import { Message } from 'ai'
import { unstable_noStore as noStore } from 'next/cache'
import ContractChat from '../contract_chat'
import {
  getAcontractFile,
  getContractDrafts,
  getContracts,
  getDataFieldsOfContracts,
  getSectionsOfContract,
} from '@/app/[locale]/actions/contract_action'
import {
  Contract,
  ContractDataField,
  ContractDraft,
  ContractFile,
  ContractSection,
} from '@/lib/types/types'
import { auth } from '@clerk/nextjs/server'

const ContractMessageHistory = async ({ id }: { id?: string }) => {
  noStore()
  const { userId } = auth()
  let contractFiles: ContractFile[] = []
  let sections: ContractSection[] = []
  let dataFields: ContractDataField[] = []
  let drafts: ContractDraft[] = []

  //   const drafts = await getContractSectionDrafts()
  //   console.log(dataFields);
  console.log(contractFiles)

  if (id) {
    contractFiles = (await getAcontractFile(id!)) as ContractFile[]
    sections = (await getSectionsOfContract(id!)) as ContractSection[]
    dataFields = (await getDataFieldsOfContracts(id!)) as ContractDataField[]
    drafts = (await getContractDrafts(id)) as ContractDraft[]
  }
  console.log('====================================')
  console.log(contractFiles)
  console.log('====================================')
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

export default ContractMessageHistory
