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
import CreateNewContractChat from './create_new_standard_contract_chat'
import ContractChatHistory from './standard_contract_chat_history'

interface Props {}

const ContractsMobileTopNav: NextPage<Props> = async () => {
  const t = await getTranslations('contract.home')

  return (
    <div className="flex w-full justify-between px-4 py-2">
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
          <DrawerHeader>
            <DrawerTitle>{t('history')}</DrawerTitle>
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
  )
}

export default ContractsMobileTopNav
