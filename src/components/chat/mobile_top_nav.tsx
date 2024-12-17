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
import ChatHistoryLoader from './chat_history_loader'
import ChatHistory from './chat_history'
import CreateNewChat from './create_new_chat'
import { useTranslations } from 'use-intl'
import { getTranslations } from 'next-intl/server'
import { CloseCircle } from 'iconsax-react'
import ChatLinks from './chat_links'
import { auth } from '@clerk/nextjs/server'
import { getChats } from '@/app/[locale]/actions/chat_actions'
import { unstable_noStore as noStore } from 'next/cache'

interface Props {}

const LawbotMobileTopNav: NextPage<Props> = async () => {
  const t = await getTranslations('lawbot.chat')

  noStore()
  const { userId } = auth()
  //   const path = path

  const chats = await getChats(userId!)
  const translations = await getTranslations('lawbot.chat')
  const chatHistoryTranslations = {
    selectConvForChatHistory: translations('selectConvForChatHistory'),
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
      <div className=" w-full justify-between px-4 py-2 md:flex hidden">
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
              <DrawerDescription>
                {t('selectConvForChatHistory')}
              </DrawerDescription>
            </DrawerHeader>
            <Suspense fallback={<ChatHistoryLoader />}>
              <ChatHistory />
            </Suspense>
            <DrawerFooter>
              {/* <Button>Submit</Button> */}
              {/* <DrawerClose>
              <Button variant="outline">Cancel</Button>
            </DrawerClose> */}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <CreateNewChat />
      </div>
      <div className="md:hidden">
        <ChatLinks
          chats={chats}
          chatHistoryTranslations={chatHistoryTranslations}
        />
      </div>
    </>
  )
}

export default LawbotMobileTopNav
