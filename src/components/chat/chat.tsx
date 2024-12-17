'use client'

import { Message, useChat } from 'ai/react'
import { Button } from '../ui/button'
import {
  ArrowDown,
  CloseCircle,
  DocumentDownload,
  Send2,
  StopCircle,
  TickCircle,
} from 'iconsax-react'
import { Icons } from '../icons'
import MessageTile from './messages/message_tile'
import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  getLawbotPreferences,
  updateLawbotPreferences,
} from '@/app/[locale]/actions/chat_actions'
import { NextPage } from 'next'
import {
  addMessage,
  createMeaningfulchatTitle,
} from '@/app/[locale]/actions/chat_actions'
import ChatModelSelector from '../misc/chat_model_selector'
import { chatModels } from '@/lib/consts'
import { toast } from 'sonner'
import { useLocale, useTranslations } from 'use-intl'
import { StopIcon } from '@radix-ui/react-icons'
import { unified } from 'unified'
import markdown from 'remark-parse'
import docx from 'remark-docx'
import { saveAs } from 'file-saver'
import { exportAllMessages } from '../misc/export_all_messages'
import ResourcesManager from './resources_manager'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Switch } from '../ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

interface Props {
  chatId: string
  prevMessages: Message[]
  files: any
}

const Chat: NextPage<Props> = ({ chatId, prevMessages, files }) => {
  const t = useTranslations('lawbot.chat')
  const tcase = useTranslations('caseResearch.chat')
  const formRef = useRef<HTMLFormElement>(null)
  const { user } = useUser()
  const [selectedModel, setSelectedModel] = useState<string>(chatModels[1])
  const [includeLawbotAnswers, SetIncludeLawbotAnswers] =
    useState<boolean>(true)
  const [includeGreekLaws, setIncludeGreekLaws] = useState<boolean>(true)
  const [includeGreekCourtDecisions, setIncludeGreekCourtDecisions] =
    useState<boolean>(false)
  const [includeEuropeanLaws, setIncludeEuropeanLaws] = useState<boolean>(false)
  const [includeEuropeanCourtDecisions, setIncludeEuropeanCourtDecisions] =
    useState<boolean>(false)
  const [includeGreekBibliography, setIncludeGreekBibliography] =
    useState<boolean>(false)
  const [includeForeignBibliography, setIncludeForeignBibliography] =
    useState<boolean>(false)
  const [includeClientDocuments, setIncludeClientDocuments] =
    useState<boolean>(false)
  const [currentRunId, setCurrentRunId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [searchText, setSearchText] = useState<string | null>(null)
  const [showContinueMessage, setShowContinueMessage] = useState<boolean>(false)
  const locale = useLocale()
  const isUserScrollingRef = useRef(false)
  const messageBoxRef = useRef<any>(null)

  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        try {
          const prefs = await getLawbotPreferences(user.id)
          setIncludeGreekLaws(prefs.includeGreekLaws)
          setIncludeGreekCourtDecisions(prefs.includeGreekCourtDecisions)
          setIncludeEuropeanLaws(prefs.includeEuropeanLaws)
          setIncludeEuropeanCourtDecisions(prefs.includeEuropeanCourtDecisions)
          setIncludeGreekBibliography(prefs.includeGreekBibliography)
          setIncludeForeignBibliography(prefs.includeForeignBibliography)
        } catch (error) {
          console.error('Error loading preferences:', error)
          toast.error('Failed to load preferences')
        }
      }
    }

    loadPreferences()
  }, [user?.id])

  // Add preference update handler
  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!user?.id) return

    try {
      await updateLawbotPreferences(user.id, { [key]: value })
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    }
  }

  const preferenceItems = [
    {
      key: 'includeGreekLaws',
      title: `${tcase('greekLawsTitle')}`,
      state: includeGreekLaws,
      setState: setIncludeGreekLaws,
      enabled: true,
    },
    {
      key: 'includeGreekCourtDecisions',
      title: `${tcase('greekCourtDecisionsTitle')}`,
      state: includeGreekCourtDecisions,
      setState: setIncludeGreekCourtDecisions,
      enabled: true,
    },
    {
      key: 'includeEuropeanLaws',
      title: `${tcase('europeanLawsTitle')}`,
      // state: includeEuropeanLaws,
      state: false,
      setState: setIncludeEuropeanLaws,
      enabled: false,
    },
    {
      key: 'includeEuropeanCourtDecisions',
      title: `${tcase('europeanCourtDecisionsTitle')}`,
      // state: includeEuropeanCourtDecisions,
      state: false,
      setState: setIncludeEuropeanCourtDecisions,
      enabled: false,
    },
    // {
    //   key: 'includeGreekBibliography',
    //   title: `${tcase('greekBibliographyTitle')}`,
    //   // state: includeGreekBibliography,
    //   state: false,
    //   setState: setIncludeGreekBibliography,
    //   enabled: false,
    // },
    // {
    //   key: 'includeForeignBibliography',
    //   title: `${tcase('foreignBibliographyTitle')}`,
    //   // state: includeForeignBibliography,
    //   state: false,
    //   setState: setIncludeForeignBibliography,
    //   enabled: false,
    // },
  ]

  const openFileInChat = (filename: string, searchText: string) => {
    setSelectedFile(null)
    setSearchText('')

    setTimeout(() => {
      setSelectedFile(filename)
      setSearchText(searchText)
    }, 0)
  }

  const handleResetFileSelection = () => {
    setSelectedFile(null)
    setSearchText(null)
  }

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    append,
  } = useChat({
    maxToolRoundtrips: 2,
    initialMessages: prevMessages,
    body: {
      chatId,
      model: selectedModel,
      locale,
      preferences: {
        includeGreekLaws,
        includeGreekCourtDecisions,
        includeEuropeanLaws,
        includeEuropeanCourtDecisions,
        includeGreekBibliography,
        includeForeignBibliography,
      },
    },
    onResponse(response) {
      const runId = response.headers.get('Run-Id')
      console.log('on response runId', runId)
      if (runId) {
        setCurrentRunId(runId)
      }
    },
    async onFinish(message, options) {
      console.log(options.finishReason)

      if (messages.length === 0 && message.content) {
        await createMeaningfulchatTitle(chatId, message.content)
      }

      if (
        options.finishReason === 'length' ||
        options.finishReason === 'unknown'
      ) {
        showContinueButton()
      }

      if (
        options.finishReason === 'stop' ||
        options.finishReason === 'length' ||
        options.finishReason === 'unknown'
      ) {
        await addMessage(chatId, message.role, message.content)
      }
    },
  })

  const scrollToBottom = () => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTo({
        top: messageBoxRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }
  const handleUserScroll = () => {
    if (messageBoxRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageBoxRef.current
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
      isUserScrollingRef.current = !isNearBottom
    }
  }

  useEffect(() => {
    if (error) {
      console.log(error)
      toast.error('Something went wrong!')
    }
  }, [error, messages])

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.addEventListener('scroll', handleUserScroll)
    }
    return () => {
      if (messageBoxRef.current) {
        messageBoxRef.current.removeEventListener('scroll', handleUserScroll)
      }
    }
  }, [])

  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom()
    }
  }, [messages, showContinueMessage])

  const submitMessage = async (e: any) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault()
      e.stopPropagation()
      await addMessage(chatId, 'user', input)
      handleSubmit()
      scrollToBottom()
    }
  }

  const showContinueButton = () => {
    setShowContinueMessage(true)
  }

  const continueChat = () => {
    append({
      content: t('continueButton'),
      role: 'user',
    })
    setShowContinueMessage(false)
  }

  return (
    <div className="flex">
      <div className="flex flex-col justify-between h-[80svh] md:h-[93svh] px-4 md:px-12 w-full py-8 md:py-6 mx-auto stretch ">
        <div
          className="overflow-y-scroll no-scrollbar flex flex-col no-scrollbar"
          ref={messageBoxRef}
        >
          {messages.map((m) =>
            m.content.length > 0 ? (
              <MessageTile
                message={m}
                key={m.id}
                isGenerating={isLoading}
                runId={currentRunId}
                chatId={chatId}
                scrollToBottom={scrollToBottom}
                append={append}
              />
            ) : (
              <p
                key={m.id}
                className="text-xs text-gray-599 mb-1 text-center"
              >
                {t('searching')}
              </p>
            )
          )}

          {showContinueMessage && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit py-2 px-4 rounded-full m-auto mb-2 text-[#9e3a34] "
              onClick={continueChat}
            >
              {t('continue')}
            </Button>
          )}
        </div>

        {!messages.length && (
          <div className="flex justify-center items-center h-[93svh]">
            <div className="w-full md:w-[50%]">
              <div className="border rounded-xl px-8 py-6">
                <div className=" flex items-center justify-start space-x-4 w-full mb-8">
                  <p className="font-medium  text-sm w-[70%]">
                    {t('placeYourQuestionToGetStart')}
                  </p>
                  <ArrowDown />
                </div>

                <p className="font-medium mt-2 text-xs text-slate-500">
                  {t('continueMessage')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0 ">
          {messages.length > 0 && (
            <div
              className="text-right px-4 md:text-sm text-xs cursor-pointer my-1"
              onClick={() => exportAllMessages(messages)}
            >
              <div className="flex flex-row items-end justify-end gap-2">
                <div className="hidden md:inline">
                  <DocumentDownload size="20" />
                </div>
                <div className="inline md:hidden">
                  <DocumentDownload size="16" />
                </div>
                {t('exportAllMessages')}
              </div>
            </div>
          )}
          <div className="rounded-2xl border w-[100%] md:shadow-2xl ">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="flex items-center px-4 md:py-1 py-2  "
            >
              <textarea
                className="w-full bg-transparent focus:outline-none text-sm md:pt-4 pb-4 resize-none"
                value={input}
                placeholder={t('chatPlaceholder')}
                onChange={handleInputChange}
                onKeyDown={submitMessage}
              />
              {isLoading ? (
                <div className="flex space-x-2">
                  <Icons.spinner
                    className="animate-spin m-auto h-6 w-6 text-red-600"
                    // color="#b8b9bc"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 border rounded-full h-6 w-6"
                    type="button"
                    onClick={stop}
                  >
                    <StopIcon color="#2e2d2d" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <Send2
                    size="22"
                    color="#2e2d2d"
                  />
                </Button>
              )}
            </form>
            <div className="bg-zinc-50 border-t border-zinc-100 md:px-4 px-2 py-2 rounded-b-2xl">
              <p className="text-center text-xs font-light text-gray-500">
                {t('cautionMessage')}
              </p>
              <div className="flex items-center justify-between py-1">
                <div className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-xs border rounded-full md:px-4 px-2 md:py-2 py-1 flex md:space-x-2 items-center">
                      <p className="font-medium md:text-xs text-[10px]">
                        {includeGreekLaws
                          ? tcase('enabled')
                          : tcase('disabled')}{' '}
                      </p>
                      {includeGreekLaws ? (
                        <TickCircle
                          size="18"
                          color="#37d67a"
                          variant="Bulk"
                        />
                      ) : (
                        <CloseCircle
                          size="18"
                          color="#e11c47"
                          variant="Bulk"
                        />
                      )}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[220px]">
                      <DropdownMenuLabel>
                        <p>{tcase('includeLawbotTitle')}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {preferenceItems.map((item, index) => (
                        <DropdownMenuItem
                          key={index}
                          className="justify-between"
                          onSelect={(e) => {
                            e.preventDefault()
                          }}
                        >
                          {item.title}
                          {item.enabled ? (
                            <Switch
                              checked={item.state}
                              onCheckedChange={(checked) => {
                                item.setState(checked)
                                handlePreferenceChange(item.key, checked)
                              }}
                            />
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      checked={false}
                                      disabled
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Coming Soon</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {/* <ChatModelSelector
                setModel={setSelectedModel}
                model={selectedModel}
              /> */}
                <div className="md:hidden">
                  {/* <ResourcesMobile
                    caseId={caseId}
                    files={files}
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden md:block w-[40%]">
        <ResourcesManager
          chatId={chatId}
          files={files}
          selectedFile={selectedFile}
          searchText={searchText}
          onCloseFile={handleResetFileSelection}
        />
      </div>
    </div>
  )
}

export default Chat
