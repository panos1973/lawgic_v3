/* eslint-disable @next/next/no-img-element */
'use client'
import { useChat } from 'ai/react'
import { Button } from '../ui/button'
import { CloseCircle, DocumentDownload, TickCircle } from 'iconsax-react'
import { Icons } from '../icons'
import MessageTile from './messages/message_tile'
import { useEffect, useRef, useState } from 'react'
import { NextPage } from 'next'
import {
  Contract,
  ContractDataField,
  ContractDraft,
  ContractFile,
  ContractSection,
} from '@/lib/types/types'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { chatModels } from '@/lib/consts'
import { useLocale, useTranslations } from 'use-intl'
import { SelectGroup } from '@radix-ui/react-select'
import {
  addContractDraft,
  createMeaningfulContractTitle,
  getContractChatPreferences,
  saveContractDataFieldValue,
  updateContractChatPreferences,
} from '@/app/[locale]/actions/contract_action'
import { StopIcon } from '@radix-ui/react-icons'
import ContractResourcesMobile from './files/contract_file_manager_mobile'
import ContractResourcesManager from './files/contract_file_manager'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '../ui/input'
import { useDebouncedCallback } from 'use-debounce'
import Markdown from 'markdown-to-jsx'
import UploadContractFile from './files/upload_file'
import Link from 'next/link'
import { exportAllMessages } from '../misc/export_all_messages'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Switch } from '../ui/switch'
import { useUser } from '@clerk/nextjs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
interface Props {
  contractId: string
  drafts: ContractDraft[]
  sections: ContractSection[]
  fields: ContractDataField[]
  contractFiles: any
}
const ContractChat: NextPage<Props> = ({
  contractId,
  drafts,
  sections,
  fields,
  contractFiles,
}) => {
  const t = useTranslations('contract.chat')
  const tcase = useTranslations('caseResearch.chat')
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
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [showPrompts, setShowPrompts] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>(chatModels[1])
  const [showContinueMessage, setShowContinueMessage] = useState<boolean>(false)
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const locale = useLocale()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.id) {
        try {
          const prefs = await getContractChatPreferences(user.id)
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
      await updateContractChatPreferences(user.id, { [key]: value })
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

  const exportSpecificContractAsDoc = async (file: {
    file_content: any
    file_name: any
  }) => {
    try {
      let fileContent = file.file_content

      // Check if the content is Base64 and corresponds to an image
      const base64Pattern = /^data:image\/([a-zA-Z]+);base64,/
      if (base64Pattern.test(fileContent)) {
        // Extract MIME type and Base64 data
        const mimeType = fileContent.match(base64Pattern)[1]
        const base64Data = fileContent.replace(base64Pattern, '')

        // Convert Base64 to Blob and download the image
        const binaryData = atob(base64Data)
        const byteArray = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i)
        }
        const blob = new Blob([byteArray], { type: `image/${mimeType}` })
        saveAs(blob, `${file.file_name}.${mimeType}`)
        toast.success(`Exported image: ${file.file_name}`)
        return
      }
      // Convert `fileContent` to a string if it’s a Blob or ArrayBuffer
      if (fileContent instanceof Blob) {
        // Handle Blob using FileReader
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsText(fileContent, 'utf-8')
        })
      } else if (fileContent instanceof ArrayBuffer) {
        // Handle ArrayBuffer directly with TextDecoder
        const textDecoder = new TextDecoder('utf-8')
        fileContent = textDecoder.decode(fileContent)
      }

      // Ensure `fileContent` is treated as a string
      if (typeof fileContent !== 'string') {
        console.error('file_content could not be converted to a string.')
        toast.error('Failed to process file content.')
        return
      }

      // Process as a Base64 string
      let base64Content = fileContent.split(',')[1]

      // Clean non-Base64 characters
      base64Content = base64Content.replace(/[^A-Za-z0-9+/=]/g, '')

      let binaryContent

      // Helper function to verify if content is a valid ZIP
      const isValidZip = (content: PizZip.LoadData) => {
        try {
          const testZip = new PizZip(content)
          return true
        } catch (error) {
          return false
        }
      }

      // Sequential decoding attempts
      try {
        binaryContent = atob(base64Content)
        if (!isValidZip(binaryContent)) {
          throw new Error('Invalid ZIP after atob decoding.')
        }
        console.log('Used atob for decoding.')
      } catch (error) {
        console.warn(
          'atob approach failed or produced invalid ZIP, trying UTF-8 encoding with decodeURIComponent...'
        )
        binaryContent = null
      }

      // UTF-8 encoding workaround
      if (!binaryContent) {
        try {
          binaryContent = decodeURIComponent(
            Array.from(atob(base64Content))
              .map(
                (char) =>
                  `%${('00' + char.charCodeAt(0).toString(16)).slice(-2)}`
              )
              .join('')
          )
          if (!isValidZip(binaryContent)) {
            throw new Error('Invalid ZIP after UTF-8 workaround.')
          }
          console.log('Used UTF-8 encoding workaround with decodeURIComponent.')
        } catch (error) {
          console.warn(
            'UTF-8 encoding workaround failed or produced invalid ZIP, trying Buffer for Base64 decoding...'
          )
          binaryContent = null
        }
      }

      // Buffer decoding for UTF-8 support
      if (!binaryContent) {
        try {
          const byteArray = Uint8Array.from(
            Buffer.from(base64Content, 'base64')
          )
          binaryContent = new TextDecoder('utf-8').decode(byteArray)
          if (!isValidZip(binaryContent)) {
            throw new Error('Invalid ZIP after Buffer decoding.')
          }
          console.log('Used Buffer for Base64 decoding.')
        } catch (error) {
          console.warn(
            'Buffer decoding failed or produced invalid ZIP, attempting chunked decoding...'
          )
          binaryContent = null
        }
      }

      // Chunked decoding to skip corrupt parts
      if (!binaryContent) {
        console.log('Starting chunked decoding...')
        binaryContent = ''
        for (let i = 0; i < base64Content.length; i += 1000) {
          const chunk = base64Content.slice(i, i + 1000)
          try {
            const decodedChunk = atob(chunk)
            binaryContent += decodedChunk
            console.log(`Decoded chunk at ${i}-${i + 1000}:`, decodedChunk)
          } catch (err) {
            console.warn(`Skipping invalid chunk at ${i}-${i + 1000}`)
          }
        }
        if (!isValidZip(binaryContent)) {
          console.error('Chunked decoding still produced an invalid ZIP.')
          binaryContent = null
        } else {
          console.log('Used chunked atob decoding to handle corrupted parts.')
        }
      }

      // Final fallback: Save `file.file_content` directly
      if (!binaryContent) {
        console.warn(
          'All decoding attempts failed. Saving raw file_content as a plain text file.'
        )

        const blob = new Blob([file.file_content], { type: 'text/plain' })
        saveAs(blob, `${file.file_name}_raw_recovery.txt`)
        toast.warning('Partial file recovered as raw text content.')
        return
      }

      // Convert binary content to Uint8Array for PizZip
      const byteArray = new Uint8Array(binaryContent.length)
      for (let i = 0; i < binaryContent.length; i++) {
        byteArray[i] = binaryContent.charCodeAt(i)
      }

      const zip = new PizZip(byteArray.buffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })

      doc.render()

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      saveAs(out, `${file.file_name}_${new Date().toLocaleTimeString()}.docx`)
      toast.success(`Exported ${file.file_name}`)
    } catch (error) {
      console.error('Error exporting document:', error)
      toast.error(`Failed to export ${file.file_name}`)
    }
  }

  const isMobile = window?.innerWidth < 768

  const handleClickOutside = (event: MouseEvent) => {
    if (!popoverRef.current?.contains(event.target as Node)) {
      setIsPopoverOpen(false)
    }
  }

  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPopoverOpen) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isPopoverOpen])

  const renderFileNames = () => {
    if (contractFiles.length === 1) {
      const file = contractFiles[0]
      return (
        <p
          className="text-xs underline cursor-pointer"
          onClick={() => exportSpecificContractAsDoc(file)}
        >
          {file.file_name}
        </p>
      )
    } else if (contractFiles.length > 1) {
      return (
        <div className="relative inline-block">
          <button
            className="text-xs text-nowrap underline cursor-pointer flex flex-row flex-nowrap gap-2 justify-evenly items-start"
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            {contractFiles.length} files used for template{' '}
            <DocumentDownload size="16" />
          </button>
          {isPopoverOpen && (
            <div
              ref={popoverRef}
              className="absolute mt-2 w-[200px] bg-white border rounded shadow-lg z-10 text-sm"
            >
              <ul>
                {contractFiles.map((file: any) => (
                  <li
                    key={file.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                    onClick={() => exportSpecificContractAsDoc(file)}
                  >
                    <span>{file.file_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )
    } else {
      return null
    }
  }

  const formRef = useRef<HTMLFormElement>(null)
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    data,
    append,
    stop,
  } = useChat({
    api: '/api/contracts/chat',
    maxToolRoundtrips: 2,
    initialMessages:
      drafts.map((d) => {
        return {
          content: d.draft,
          role: d.role,
          id: d.id,
          createdAt: d.createdAt,
        }
      }) ?? [],

    body: {
      contractId,
      contract: contractFiles?.file_content ?? null,
      fields:
        fields?.map((f) => {
          f.field_name, f.value
        }) ?? null,
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
        await createMeaningfulContractTitle(contractId, message.content)
      }

      await addContractDraft(contractId, message.content, 'assistant')

      if (
        options.finishReason === 'length' ||
        options.finishReason === 'unknown'
      ) {
        showContinueButton()
      }
    },
  })

  const userMessagesRef = useRef<any>(null)
  const assistantMessagesRef = useRef<any>(null)
  const isUserScrollingRef = useRef(false)

  const scrollToBottom = () => {
    if (assistantMessagesRef.current) {
      assistantMessagesRef.current.scrollTo({
        top: assistantMessagesRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }
  const handleUserScroll = () => {
    if (assistantMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        assistantMessagesRef.current
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50
      isUserScrollingRef.current = !isNearBottom
    }
  }

  useEffect(() => {
    if (assistantMessagesRef.current) {
      assistantMessagesRef.current.addEventListener('scroll', handleUserScroll)
    }
    return () => {
      if (assistantMessagesRef.current) {
        assistantMessagesRef.current.removeEventListener(
          'scroll',
          handleUserScroll
        )
      }
    }
  }, [])
  useEffect(() => {
    if (!isUserScrollingRef.current) {
      scrollToBottom()
    }
  }, [messages, showContinueMessage])
  // useEffect(() => {
  //   if (assistantMessagesRef.current) {
  //     assistantMessagesRef.current.scrollTo({
  //       top: assistantMessagesRef.current.scrollHeight,
  //       behavior: 'smooth',
  //     })
  //   }
  // }, [messages, data, error])

  useEffect(() => {
    console.log(messages)

    if (userMessagesRef.current) {
      userMessagesRef.current.scrollTo({
        top: userMessagesRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages, data, error])

  const showContinueButton = () => {
    setShowContinueMessage(true)
  }

  const handleAccordionToggle = () => {
    setFieldsOpen((prevState) => !prevState)
  }

  useEffect(() => {
    if (fieldsOpen && userMessagesRef.current) {
      userMessagesRef.current.scrollTop = userMessagesRef.current.scrollHeight
    }
  }, [fieldsOpen, messages])

  useEffect(() => {
    if (userMessagesRef.current) {
      userMessagesRef.current.scrollTop = userMessagesRef.current.scrollHeight
    }
  }, [messages, showPrompts])

  const submit = async (e: any) => {
    if (contractFiles) {
      if (e.keyCode == 13 && e.shiftKey == false) {
        e.preventDefault()
        e.stopPropagation()

        try {
          await addContractDraft(contractId, input, 'user')
          await handleSubmit()
          scrollToBottom()
          setInput('')
        } catch (error) {
          console.error('Error submitting the draft: ', error)
        }
      }
    }
  }

  const selectAprompt = (prompt: string) => {
    setInput(prompt)
    setShowPrompts(false)
  }

  const continueChat = () => {
    append({
      content: t('continueButton'),
      role: 'user',
    })
    setShowContinueMessage(false)
  }

  const saveDataField = useDebouncedCallback(async (value) => {
    saveContractDataFieldValue(contractId, value.id, value.value)
  }, 1000)

  const prompts = [
    'Create a draft from the uploaded contracts',
    'Draft an email regarding this contracts terms',
    'Draft a detailed report of legal disputes found on the contracts',
    'Compare two legal agreements and extract out information into a table',
    'Extract out all the possible details of the agreements',
    'Help me find the terms of the contracts',
    'Make a list of important statemnets found in the agreements',
    'Extract the stakeholders invloved in the agreements and make a table',
  ]

  return (
    <div className="flex border-t">
      <ResizablePanelGroup
        direction={`${isMobile ? 'vertical' : 'horizontal'}`}
        className="w-full h-full"
      >
        <ResizablePanel
          defaultSize={35}
          className="md:min-h-full md:max-h-full min-h-[30svh] max-h-[30svh] overflow-y-scroll md:overflow-visible" // Apply overflow scroll only on mobile
        >
          <div className="flex flex-col md:overflow-visible overflow-y-scroll justify-between h-full md:h-[88svh] w-full mx-auto stretch">
            <div className="md:h-[88svh] flex flex-col">
              {contractFiles.length > 0 ? (
                <div className="flex flex-col md:gap-5">
                  {/* Chapters of the Contract */}
                  <div className="max-h-[42svh] overflow-y-scroll no-scrollbar">
                    <div className="px-4 py-4">
                      <p className="font-medium text-sm">
                        {t('title')}
                        <span className="text-sm font-light">
                          ({sections.length})
                        </span>
                      </p>
                      {contractFiles.length > 0 && (
                        <div className="mt-0">{renderFileNames()}</div>
                      )}
                      <div className="grid grid-cols-1 gap-4 mx-2 mt-4">
                        {sections.map((section, i) => (
                          <div
                            key={section.id}
                            className="border px-3 py-2 rounded-md hover:cursor-pointer hover:bg-slate-100"
                          >
                            <p className="text-xs font-medium">
                              {i + 1} - {section.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Fillable Fields */}
                  <div className="max-h-[42svh] overflow-y-scroll  no-scrollbar border-y">
                    <div className="px-4 py-4">
                      <Accordion
                        type="single"
                        defaultValue="item-1"
                        collapsible
                      >
                        <AccordionItem value="item-1">
                          <AccordionTrigger onClick={handleAccordionToggle}>
                            <p className="font-medium text-sm">
                              {t('fieldsToFill')}
                              <span className="text-sm font-light">
                                ({fields.length})
                              </span>
                            </p>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              {fields.map((field) => (
                                <div key={field.id}>
                                  <Label className="text-xs">
                                    {field.field_name}
                                  </Label>
                                  <Input
                                    className="mt-1 text-xs"
                                    type={field.field_type}
                                    defaultValue={field.value}
                                    onChange={(e) =>
                                      saveDataField({
                                        value: e.target.value,
                                        id: field.id,
                                      })
                                    }
                                  />
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 w-full md:w-[75%] m-auto h-[90svh]">
                  <p className="text-center text-sm font-medium mb-4">
                    {t('uploadContract')}
                  </p>
                  <UploadContractFile contractChatId={contractId} />
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>

        {(!isMobile || (isMobile && contractFiles.length > 0)) && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={65}
              className="min-h-[50svh] max-h-[50svh] md:min-h-full md:max-h-full h-full "
            >
              <div className="py-4 px-4  flex flex-col justify-between h-full max-h-[48svh] md:max-h-full md:h-[88svh] w-full mx-auto stretch ">
                <p className="font-medium text-sm">Work Bench</p>

                <div
                  className="overflow-y-scroll no-scrollbar flex flex-col no-scrollbar"
                  ref={assistantMessagesRef}
                >
                  {messages.map((m) =>
                    m.content.length > 0 ? (
                      <MessageTile
                        message={m}
                        key={m.id}
                        isGenerating={isLoading}
                        runId={null}
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
                </div>

                <div className="sticky  bottom-0  py-2">
                  {showContinueMessage && (
                    <div className="flex justify-center mb-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-fit py-2 px-4 rounded-full text-[#9e3a34]"
                        onClick={continueChat}
                      >
                        {t('continue')}
                      </Button>
                    </div>
                  )}

                  {messages.length > 0 && (
                    <div
                      className="text-right px-4 md:text-sm text-xs cursor-pointer mb-2"
                      onClick={() => exportAllMessages(messages)}
                    >
                      <div className="flex flex-row items-end justify-end gap-2">
                        <div className="hidden md:inline">
                          <DocumentDownload size="20" />
                        </div>
                        <div className="inline md:hidden">
                          <DocumentDownload size="16" />
                        </div>{' '}
                        {t('exportAllMessages')}
                      </div>
                    </div>
                  )}
                  <div className="border w-[100%] ">
                    {showPrompts && (
                      <Select
                        open={showPrompts}
                        onValueChange={selectAprompt}
                      >
                        <SelectTrigger className="w-full border-none shadow-none h-14 ">
                          <SelectValue placeholder="Select a prompt" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl shadow-none py-2  text-ellipsis w-[92svw] md:w-full">
                          <SelectGroup>
                            <SelectLabel className="flex items-center justify-between w-full px-6">
                              <p> {t('prompts')} </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPrompts(false)}
                                className="rounded-full border-none p-0 h-6 w-6"
                              >
                                <CloseCircle size={18} />
                              </Button>{' '}
                            </SelectLabel>
                            <hr className="mt-1 mb-1" />
                            {prompts.map((prompt, i) => (
                              <SelectItem
                                key={i}
                                value={prompt}
                                className="py-2 px-6 rounded-xl hover:cursor-pointer text-ellipsis "
                              >
                                {prompt}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}

                    {!showPrompts && (
                      <form
                        onSubmit={handleSubmit}
                        ref={formRef}
                        className="flex items-center just px-4"
                      >
                        <textarea
                          className="w-full bg-transparent focus:outline-none md:text-sm text-xs py-2 resize-none md:min-h-[5rem] "
                          value={input}
                          placeholder={`${t('chatPlaceholder')}`}
                          onChange={handleInputChange}
                          disabled={!contractFiles}
                          onKeyDown={submit}
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
                            variant="outline"
                            size="sm"
                            disabled={!contractFiles}
                          >
                            {t('submit')}
                          </Button>
                        )}
                      </form>
                    )}
                    <div className="bg-zinc-50 border-t border-zinc-100 px-2 md:px-4 md:py-1  rounded-b-2xl md:block flex flex-row items-center justify-evenly">
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
                                        handlePreferenceChange(
                                          item.key,
                                          checked
                                        )
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
                        {/* <div className="md:hidden">
                  <ResourcesMobile
                    caseId={caseId}
                    files={files}
                  />
                </div> */}
                      </div>
                      <div className="flex items-center justify-between md:py-1 mt-1">
                        <div className="flex space-x-2">
                          <div className="md:hidden">
                            <ContractResourcesMobile />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}

export default ContractChat
