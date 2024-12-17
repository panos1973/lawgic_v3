import { auth } from '@clerk/nextjs/server'
import { getChats } from '@/app/[locale]/actions/chat_actions'
import { unstable_noStore as noStore } from 'next/cache'
import ChatLinks from './chat_links'
import { getTranslations } from 'next-intl/server'

const ChatHistory = async () => {
  noStore()
  const { userId } = auth()
  //   const path = path

  const chats = await getChats(userId!)
  const translations = await getTranslations('lawbot.chat')
  const chatHistoryTranslations = {
    note: translations('note'),
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

  //   console.log(userId);
  //   console.log(chats);
  return (
    <div className="overflow-y-scroll max-h-[83svh] no-scrollbar ">
      {' '}
      {!chats.length && (
        <p className="text-sm text-center mt-4">
          {' '}
          Create a chat to get started
        </p>
      )}
      <ChatLinks
        chats={chats}
        chatHistoryTranslations={chatHistoryTranslations}
      />
    </div>
  )
}

export default ChatHistory
