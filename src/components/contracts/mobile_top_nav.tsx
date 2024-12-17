import { NextPage } from 'next'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { Suspense } from 'react'
import ChatHistoryLoader from '../chat/chat_history_loader'
import { useTranslations } from 'use-intl'
import { getTranslations } from 'next-intl/server'
import CreateNewContractChat from './create_new_chat'
import ContractChatHistory from './contract_chat_history'
import { CloseCircle } from 'iconsax-react' // Import the close icon
import ContractChatLinks from './contract_chat_links'
import { auth } from '@clerk/nextjs/server'
import { unstable_noStore as noStore } from 'next/cache'
import { getContracts } from '@/app/[locale]/actions/contract_action'

interface Props {}

const ContractsMobileTopNav: NextPage<Props> = async () => {
  const t = await getTranslations('contract.home')
  noStore()
  const { userId } = auth()
  const contracts = await getContracts(userId!)
  const translations = await getTranslations('contract.home')
  const contractTranslations = {
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
    <>
      <div className="md:flex hidden w-full justify-between px-4 py-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              {t('history')}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="relative flex flex-col items-center">
              <DrawerClose asChild>
                <button className="absolute right-2 top-1 md:hidden">
                  <CloseCircle className="h-6 w-6" />
                </button>
              </DrawerClose>
              <DrawerTitle className="w-full text-center">
                {t('history')}
              </DrawerTitle>
              <DrawerDescription>{t('selectChatHistory')}</DrawerDescription>
            </DrawerHeader>
            <Suspense fallback={<ChatHistoryLoader />}>
              <ContractChatHistory />
            </Suspense>
            <DrawerFooter>
              {/* <Button>Submit</Button> */}
              {/* <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose> */}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <CreateNewContractChat />
      </div>
      <div className="md:hidden">
        <ContractChatLinks
          contracts={contracts}
          contractTranslations={contractTranslations}
        />
      </div>
    </>
  )
}

export default ContractsMobileTopNav
