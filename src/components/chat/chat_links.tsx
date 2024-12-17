'use client'

import { NextPage } from 'next'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CloseCircle, Trash, Note, TickCircle } from 'iconsax-react'
import {
  cn,
  formatDateToCustomFormat,
  relativeTimeFromDates,
} from '@/lib/utils'
import { toast } from 'sonner'
import { deleteChat, updateChatNote } from '@/app/[locale]/actions/chat_actions'
import { Chat } from '@/lib/types/types'
import { usePathname } from 'next/navigation'
import HistoryHeader from '../misc/history_header'
import { useLocale } from 'next-intl'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../ui/drawer'
import { Button } from '../ui/button'
import ChatHistoryLoader from './chat_history_loader'
import CreateNewChat from './create_new_chat'

interface Props {
  chats: Chat[]
  chatHistoryTranslations: {
    note?: string
    selectConvForChatHistory: string
    history: string
    massDelete: string
    cancel: string
    accept: string
    deleteConfirmation: string
    deleteToastSuccess: string
    deleteToastLoading: string
    massDeleteToastSuccess: string
    massDeleteToastLoading: string
  }
}

const ChatLinks: NextPage<Props> = ({ chats, chatHistoryTranslations }) => {
  const path = usePathname()
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [isMassDelete, setIsMassDelete] = useState(false)
  const [visibleNoteChatId, setVisibleNoteChatId] = useState<string | null>(
    null
  )
  const [notes, setNotes] = useState<{ [chatId: string]: string }>({})
  const locale = useLocale() || 'el'

  const handleCheckboxChange = (chatId: string) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    )
  }

  const handleMassDelete = async () => {
    try {
      await toast.promise(
        Promise.all(selectedChats.map((chatId) => deleteChat(chatId))),
        {
          loading: `${chatHistoryTranslations.massDeleteToastLoading}...`,
          success: chatHistoryTranslations.massDeleteToastSuccess,
          error: "Oops! Couldn't Delete, try again",
        }
      )
      setSelectedChats([])
      setIsMassDelete(false)
    } catch {
      toast.error('Failed to delete selected chats, please try again.')
    }
  }

  const handleIndividualDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      toast.success(chatHistoryTranslations.deleteToastSuccess)
    } catch {
      toast.error('Failed to delete chat, please try again.')
    }
  }

  const toggleNoteVisibility = (chatId: string) => {
    setVisibleNoteChatId((prev) => (prev === chatId ? null : chatId))
  }

  const handleSaveNote = async (chatId: string, note: string) => {
    try {
      await updateChatNote(chatId, note)
      setNotes((prevNotes) => ({
        ...prevNotes,
        [chatId]: note,
      }))
      toast.success('Note saved successfully.')
    } catch (error) {
      toast.error('Failed to save the note. Please try again.')
    }
    setVisibleNoteChatId(null)
  }

  return (
    <div>
      <div className="w-full justify-between px-4 py-2 md:hidden flex">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              {chatHistoryTranslations.history}
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
                {chatHistoryTranslations.history}
              </DrawerTitle>
              <DrawerDescription>
                {chatHistoryTranslations.selectConvForChatHistory}
              </DrawerDescription>
            </DrawerHeader>
            <Suspense fallback={<ChatHistoryLoader />}>
              <div className="overflow-y-scroll max-h-[83svh] no-scrollbar">
                {chats.length > 0 && (
                  <HistoryHeader
                    selectedChats={selectedChats}
                    handleMassDelete={handleMassDelete}
                    setSelectedChats={setSelectedChats}
                    isMassDelete={isMassDelete}
                    setIsMassDelete={setIsMassDelete}
                    chatHistoryTranslations={chatHistoryTranslations}
                  />
                )}

                {chats.map((chat) => (
                  <div
                    className={cn('py-2 px-2 space-y-10', {
                      'border-r-2 border-primary bg-slate-200': path.endsWith(
                        chat.id
                      ),
                    })}
                    key={chat.id}
                  >
                    <div className="flex space-x-4 justify-between items-center w-full">
                      {isMassDelete && (
                        <input
                          type="checkbox"
                          checked={selectedChats.includes(chat.id)}
                          onChange={() => handleCheckboxChange(chat.id)}
                        />
                      )}
                      {visibleNoteChatId === chat.id ? (
                        <Link
                          href={`/${locale}/lawbot/${chat.id}`}
                          className="w-full"
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="min-w-1/2">
                                  <p className="text-sm font-medium line-clamp-2">
                                    {chat.title}
                                  </p>
                                  <input
                                    type="text"
                                    maxLength={80}
                                    placeholder={chatHistoryTranslations.note}
                                    value={notes[chat.id] || chat.note || ''}
                                    onChange={(e) =>
                                      setNotes((prevNotes) => ({
                                        ...prevNotes,
                                        [chat.id]: e.target.value,
                                      }))
                                    }
                                    className="w-full text-xs text-[#c2032f] placeholder:text-[#c2032f] border-b border-dashed border-[#c2032f] bg-transparent focus:outline-none focus:border-solid my-1"
                                  />
                                  <p className="text-xs text-slate-500">
                                    {formatDateToCustomFormat(chat.createdAt!)}
                                  </p>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 w-[280px]">
                                <p>{chat.title}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Link>
                      ) : (
                        <DrawerClose asChild>
                          <Link
                            href={`/${locale}/lawbot/${chat.id}`}
                            className="w-full"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="min-w-1/2">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {chat.title}
                                    </p>
                                    {chat.note && (
                                      <p className="text-xs text-[#c2032f] my-1">
                                        {chat.note}
                                      </p>
                                    )}
                                    <p className="text-xs text-slate-500">
                                      {formatDateToCustomFormat(
                                        chat.createdAt!
                                      )}
                                    </p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 w-[280px]">
                                  <p>{chat.title}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Link>
                        </DrawerClose>
                      )}

                      {!isMassDelete && (
                        <div className="flex items-center space-x-2">
                          {visibleNoteChatId === chat.id ? (
                            <TickCircle
                              size={15}
                              className="cursor-pointer"
                              onClick={() =>
                                handleSaveNote(
                                  chat.id,
                                  notes[chat.id] || chat.note || ''
                                )
                              }
                            />
                          ) : (
                            <Note
                              size={15}
                              className="cursor-pointer"
                              onClick={() => toggleNoteVisibility(chat.id)}
                            />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Trash
                                size={15}
                                variant="Broken"
                                className="cursor-pointer"
                              />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                className="text-xs"
                                onClick={() => {
                                  toast.promise(deleteChat(chat.id), {
                                    loading: `${chatHistoryTranslations.deleteToastLoading}...`,
                                    success:
                                      chatHistoryTranslations.deleteToastSuccess,
                                    error: "Oops! Couldn't Delete, try again",
                                  })
                                  handleIndividualDelete(chat.id)
                                }}
                              >
                                {chatHistoryTranslations.deleteConfirmation}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Suspense>
            <DrawerFooter>{/* Add footer buttons if needed */}</DrawerFooter>
          </DrawerContent>
        </Drawer>
        <CreateNewChat />
      </div>
      <div className="md:block hidden">
        {chats.length > 0 && (
          <HistoryHeader
            selectedChats={selectedChats}
            handleMassDelete={handleMassDelete}
            setSelectedChats={setSelectedChats}
            isMassDelete={isMassDelete}
            setIsMassDelete={setIsMassDelete}
            chatHistoryTranslations={chatHistoryTranslations}
          />
        )}

        {chats.map((chat) => (
          <div
            className={cn('py-2 px-2 space-y-10', {
              'border-r-2 border-primary bg-slate-200': path.endsWith(chat.id),
            })}
            key={chat.id}
          >
            <div className="flex space-x-4 justify-between items-center w-full">
              {isMassDelete && (
                <input
                  type="checkbox"
                  checked={selectedChats.includes(chat.id)}
                  onChange={() => handleCheckboxChange(chat.id)}
                />
              )}

              <Link
                href={`/${locale}/lawbot/${chat.id}`}
                className="w-full"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="min-w-1/2">
                        <p className="text-sm font-medium line-clamp-2">
                          {chat.title}
                        </p>
                        {visibleNoteChatId === chat.id ? (
                          <input
                            type="text"
                            maxLength={80}
                            placeholder={chatHistoryTranslations.note}
                            value={notes[chat.id] || chat.note || ''}
                            onChange={(e) =>
                              setNotes((prevNotes) => ({
                                ...prevNotes,
                                [chat.id]: e.target.value,
                              }))
                            }
                            className="w-full text-xs text-[#c2032f] placeholder:text-[#c2032f] border-b border-dashed border-[#c2032f] bg-transparent focus:outline-none focus:border-solid my-1"
                          />
                        ) : (
                          chat.note && (
                            <p className="text-xs text-[#c2032f] my-1">
                              {chat.note}
                            </p>
                          )
                        )}
                        <p className="text-xs text-slate-500 ">
                          {formatDateToCustomFormat(chat.createdAt!)}
                        </p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-900 w-[280px]">
                      <p>{chat.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>

              {!isMassDelete && (
                <div className="flex items-center space-x-2">
                  {visibleNoteChatId === chat.id ? (
                    <TickCircle
                      size={15}
                      className="cursor-pointer"
                      onClick={() =>
                        handleSaveNote(
                          chat.id,
                          notes[chat.id] || chat.note || ''
                        )
                      }
                    />
                  ) : (
                    <Note
                      size={15}
                      className="cursor-pointer"
                      onClick={() => toggleNoteVisibility(chat.id)}
                    />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Trash
                        size={15}
                        variant="Broken"
                        className="cursor-pointer"
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="text-xs"
                        onClick={() => {
                          toast.promise(deleteChat(chat.id), {
                            loading: `${chatHistoryTranslations.deleteToastLoading}...`,
                            success: chatHistoryTranslations.deleteToastSuccess,
                            error: "Oops! Couldn't Delete, try again",
                          })
                          handleIndividualDelete(chat.id)
                        }}
                      >
                        {chatHistoryTranslations.deleteConfirmation}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatLinks
