import { NextPage } from 'next'
import Chat from '../chat'
import {
  getChatFiles,
  getMessagesOfAchat,
} from '@/app/[locale]/actions/chat_actions'
import { Message } from 'ai'
import { unstable_noStore as noStore } from 'next/cache'

const MessageHistory = async ({ id }: { id: string }) => {
  noStore()
  const data = await getMessagesOfAchat(id)
  const files: any = await getChatFiles(id)
  // console.log(data)

  return (
    <div>
      <Chat
        chatId={id}
        prevMessages={data as Message[]}
        files={files}
      />
    </div>
  )
}

export default MessageHistory
