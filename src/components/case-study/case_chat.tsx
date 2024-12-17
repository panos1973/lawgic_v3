/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client'

import { Message, useChat } from 'ai/react'
import { Button } from '../ui/button'
import {
  ArrowDown,
  ArrowRight,
  CloseCircle,
  Document,
  DocumentDownload,
  More,
  Send2,
  TickCircle,
} from 'iconsax-react'
import { Icons } from '../icons'
import MessageTile from './messages/message_tile'
import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { NextPage } from 'next'
import {
  addMessage,
  createMeaningfulchatTitle,
} from '@/app/[locale]/actions/chat_actions'
import FileManagerModal from './files/file_manager_modal'
import { CaseStudyFile } from '@/lib/types/types'
import {
  createMeaningfulcaseResearchTitle,
  getCaseResearchPreferences,
  saveCaseMessage,
  updateCaseResearchPreferences,
} from '@/app/[locale]/actions/case_study_actions'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import ChatModelSelector from '../misc/chat_model_selector'
import { chatModels } from '@/lib/consts'
import ResourcesManager from './resources_manager'
import ResourcesMobile from './resources_mobile'
import { useLocale, useTranslations } from 'use-intl'
import { StopIcon } from '@radix-ui/react-icons'
import { exportAllMessages } from '../misc/export_all_messages'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'

interface Props {
  caseId: string
  prevMessages: Message[]
  files: CaseStudyFile[]
}

const CaseChat: NextPage<Props> = ({ caseId, prevMessages, files }) => {
  const t = useTranslations('caseResearch.chat')
  const { user } = useUser()
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

  const [selectedModel, setSelectedModel] = useState<string>(chatModels[1])
  const locale = useLocale()
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [searchText, setSearchText] = useState<string | null>(null)
  const isUserScrollingRef = useRef(false)
  const messageBoxRef = useRef<any>(null)

  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        try {
          const prefs = await getCaseResearchPreferences(user.id)
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

  const handlePreferenceChange = async (key: string, value: boolean) => {
    if (!user?.id) return

    try {
      await updateCaseResearchPreferences(user.id, { [key]: value })
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast.error('Failed to update preferences')
    }
  }

  const preferenceItems = [
    {
      key: 'includeGreekLaws',
      title: `${t('greekLawsTitle')}`,
      state: includeGreekLaws,
      setState: setIncludeGreekLaws,
      enabled: true,
    },
    {
      key: 'includeGreekCourtDecisions',
      title: `${t('greekCourtDecisionsTitle')}`,
      state: includeGreekCourtDecisions,
      setState: setIncludeGreekCourtDecisions,
      enabled: true,
    },
    {
      key: 'includeEuropeanLaws',
      title: `${t('europeanLawsTitle')}`,
      // state: includeEuropeanLaws,
      state: false,
      setState: setIncludeEuropeanLaws,
      enabled: false,
    },
    {
      key: 'includeEuropeanCourtDecisions',
      title: `${t('europeanCourtDecisionsTitle')}`,
      // state: includeEuropeanCourtDecisions,
      state: false,
      setState: setIncludeEuropeanCourtDecisions,
      enabled: false,
    },
    // {
    //   key: 'includeGreekBibliography',
    //   title: `${t('greekBibliographyTitle')}`,
    //   // state: includeGreekBibliography,
    //   state: false,
    //   setState: setIncludeGreekBibliography,
    //   enabled: false,
    // },
    // {
    //   key: 'includeForeignBibliography',
    //   title: `${t('foreignBibliographyTitle')}`,
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

  const formRef = useRef<HTMLFormElement>(null)
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    data,
    append,
  } = useChat({
    api: '/api/case-study/chat',
    maxToolRoundtrips: 1,
    initialMessages: prevMessages,
    body: {
      caseId,
      includeGreekLaws,
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

    async onFinish(message, options) {
      console.log(options.finishReason)

      if (messages.length === 0 && message.content) {
        await createMeaningfulcaseResearchTitle(caseId, message.content)
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
        await saveCaseMessage(caseId, message.role, message.content)
      }
    },
  })
  const [caseFileData, setCaseFileData] = useState<string[]>([])
  const [lawbotData, setLawbotData] = useState<string>('')
  const [showContinueMessage, setShowContinueMessage] = useState<boolean>(false)

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
    if (data && data.length > 0) {
      setCaseFileData((data[0] as any).caseFileData)
    }
  }, [messages, data])

  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom()
    }
  }, [messages, showContinueMessage])

  const submitMessage = async (e: any) => {
    if (files.length > 0) {
      if (e.keyCode == 13 && e.shiftKey == false) {
        e.preventDefault()
        e.stopPropagation()
        await saveCaseMessage(caseId, 'user', input)
        handleSubmit()
        scrollToBottom()
      }
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
    scrollToBottom()
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
                append={append}
                caseId={caseId}
                onOpenFile={openFileInChat}
                scrollToBottom={scrollToBottom}
              />
            ) : (
              <p
                key={m.id}
                className="text-xs text-gray-600 mb-1 text-center"
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

        {messages.length === 0 && files.length > 0 && (
          <div className="flex justify-center items-center h-[93svh]">
            <div className="w-[70%]">
              <div className="border rounded-xl px-8 py-6">
                <div className=" flex space-x-4 w-full mb-2">
                  <p className="font-medium text-sm w-[70%]">
                    {t('startAnalysisMessage')}
                  </p>
                </div>
                <ArrowDown />
                <p className="font-medium mt-2 text-xs text-slate-500">
                  {t('continueMessage')}
                </p>
              </div>
            </div>
          </div>
        )}
        {files.length === 0 && (
          <div className="flex justify-center items-center h-[93svh]">
            <div className="w-full md:w-[70%] ">
              <div className="border rounded-xl px-8 py-6 flex flex-col">
                <div className=" flex space-x-4 w-full mb-2">
                  <p className="font-medium text-sm w-[70%]">
                    {t('noDocsToChat')}
                  </p>
                </div>
                <ArrowRight className="hidden md:block" />
                <ArrowDown className="self-end md:hidden" />
              </div>
            </div>
          </div>
        )}

        <div className="sticky bottom-0">
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

          <div className="rounded-2xl border w-[100%] md:shadow-2xl">
            <form
              onSubmit={handleSubmit}
              ref={formRef}
              className="flex items-center px-4"
            >
              <textarea
                className="w-full bg-transparent focus:outline-none text-sm pt-4 resize-none"
                value={input}
                placeholder={t('chatPlaceholder')}
                onChange={handleInputChange}
                disabled={!files.length}
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
                  disabled={!files.length}
                >
                  <Send2
                    size="22"
                    color="#2e2d2d"
                  />
                </Button>
              )}
            </form>
            <div className="bg-zinc-50 border-t border-zinc-100 px-2 md:px-4 py-1 rounded-b-2xl">
              <p className="text-center text-xs font-light text-gray-500">
                {t('cautionMessage')}
              </p>
              <div className="flex items-center justify-between py-1">
                <div className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-xs border rounded-full md:px-4 px-2 md:py-2 py-1 flex md:space-x-2 items-center">
                      <p className="font-medium md:text-xs text-[10px]">
                        {includeGreekLaws ? t('enabled') : t('disabled')}{' '}
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
                        <p>{t('includeLawbotTitle')}</p>
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
                  <ResourcesMobile
                    caseId={caseId}
                    files={files}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block w-[40%]">
        {/* <Button onClick={() => handleOpenFile('DPA Template 1 English.docx')}>
          Open DPA Template 1.docx
        </Button> */}
        <ResourcesManager
          caseStudyId={caseId}
          files={files}
          selectedFile={selectedFile}
          searchText={searchText}
          onCloseFile={handleResetFileSelection}
        />
      </div>
    </div>
  )
}

export default CaseChat
