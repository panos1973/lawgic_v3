/* eslint-disable @next/next/no-img-element */
'use client'
import { useChat } from 'ai/react'
import { Button } from '../ui/button'
import { CloseCircle, DocumentDownload } from 'iconsax-react'
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
  addStandardContractDraft,
  createMeaningfulStandardContractTitle,
  saveStandardContractDataFieldValue,
} from '@/app/[locale]/actions/standard_contract_actions'

import { StopIcon } from '@radix-ui/react-icons'
import ContractResourcesMobile from './files/standard_contract_file_manager_mobile'
import ContractResourcesManager from './files/standard_contract_file_manager'
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
  const t = useTranslations('standardContract.chat')
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [showPrompts, setShowPrompts] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<string>(chatModels[1])
  const [showContinueMessage, setShowContinueMessage] = useState<boolean>(false)
  const [fieldsOpen, setFieldsOpen] = useState(false)
  const locale = useLocale()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const exportSpecificContractAsDoc = async (file: ContractFile) => {
    try {
      const base64Content = file.file_content.split(',')[1]
      const binaryContent = atob(base64Content)

      const arrayBuffer = new Uint8Array(binaryContent.length)
      for (let i = 0; i < binaryContent.length; i++) {
        arrayBuffer[i] = binaryContent.charCodeAt(i)
      }

      const zip = new PizZip(arrayBuffer.buffer)

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

      // Use FileSaver to save the document
      saveAs(out, `${file.file_name}_${new Date().toLocaleTimeString()}.docx`)
      toast.success(`Exported ${file.file_name}`)
    } catch (error) {
      console.error('Error exporting document:', error)
      toast.error(`Failed to export ${file.file_name}`)
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (!popoverRef.current?.contains(event.target as Node)) {
      setIsPopoverOpen(false)
    }
  }

  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Log the locale when the component renders
    console.log('Current locale:', locale)
  }, [locale])

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
    api: '/api/standard-contracts/chat',
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
      contract: contractFiles?.file_content ?? '',
      fields:
        fields?.map((f) => ({
          field_name: f.field_name,
          value: f.value,
        })) ?? [],
      locale,
    },

    async onFinish(message, options) {
      console.log(options.finishReason)

      if (messages.length === 0 && message.content) {
        await createMeaningfulStandardContractTitle(contractId, message.content)
      }

      await addStandardContractDraft(contractId, message.content, 'assistant')

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

  useEffect(() => {
    console.log(messages)

    if (userMessagesRef.current) {
      userMessagesRef.current.scrollTo({
        top: userMessagesRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
    if (assistantMessagesRef.current) {
      assistantMessagesRef.current.scrollTo({
        top: assistantMessagesRef.current.scrollHeight,
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
          await addStandardContractDraft(contractId, input, 'user')
          await handleSubmit()

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
    saveStandardContractDataFieldValue(contractId, value.id, value.value)
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
        direction="horizontal"
        className="w-full h-full "
      >
        <ResizablePanel defaultSize={35}>
          {/* <ContractMessageHistory /> */}
          <div className="flex flex-col justify-between h-[80svh]  md:h-[88svh] w-full mx-auto stretch ">
            <div
              className=" md:h-[88svh]  flex flex-col "
              ref={userMessagesRef}
            >
              {contractFiles.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {/* Chapters of the Contract{" "} */}
                  <div className="max-h-[42svh] overflow-y-scroll no-scrollbar ">
                    <div className="px-4 py-4">
                      <p className="font-medium text-sm">
                        {t('title')}
                        <span className="text-sm font-light">
                          ({sections.length})
                        </span>
                      </p>
                      {/* {contractFiles && (
                        <p className="text-xs">{contractFiles.file_name}</p>
                      )} */}
                      {contractFiles.length > 0 && (
                        <div className="mt-0">{renderFileNames()}</div>
                      )}
                      <div className="grid grid-cols-1 gap-4 mx-2 mt-4">
                        {sections.map((section, i) => (
                          <div
                            key={section.id}
                            className=" border px-3 py-2 rounded-md hover:cursor-pointer hover:bg-slate-100"
                          >
                            <p className="text-xs font-medium">
                              {i + 1} - {section.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Fillable Fields{' '} */}
                  <div className="max-h-[42svh] overflow-y-scroll no-scrollbar border-y ">
                    <div className="px-4 py-4">
                      <Accordion
                        type="single"
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
                                <div
                                  className=""
                                  key={field.id}
                                >
                                  <Label className="text-xs">
                                    {field.field_name}
                                  </Label>
                                  <Input
                                    className="mt-1 text-xs"
                                    type={field.field_type}
                                    defaultValue={field.value}
                                    onChange={(e) =>
                                      saveDataField({
                                        id: field.id,
                                        value: e.target.value,
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
                <div className="p-6 w-full md:w-[75%] m-auto h-[90svh] ">
                  <p className="text-center text-sm font-medium mb-4">
                    Upload Contract
                  </p>
                  <UploadContractFile contractChatId={contractId} />
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={65}>
          <div className="py-4 px-4  flex flex-col justify-between h-[80svh]  md:h-[88svh] w-full mx-auto stretch ">
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
                    contractId={contractId}
                    contractFiles={contractFiles}
                    fields={fields}
                    messages={messages}
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
                  className="text-right px-4 text-sm cursor-pointer mb-2"
                  onClick={() => exportAllMessages(messages)}
                >
                  <div className="flex flex-row items-end justify-end gap-2">
                    <DocumentDownload size="20" /> {t('exportAllMessages')}
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
                      className="w-full bg-transparent focus:outline-none text-sm py-2 resize-none min-h-[5rem] "
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
                        Draft
                      </Button>
                    )}
                  </form>
                )}
                <div className="bg-zinc-50 border-t border-zinc-100 px-2 md:px-4 py-1  rounded-b-2xl">
                  <p className="text-center text-xs font-light text-gray-500">
                    {t('cautionMessage')}
                  </p>
                  <div className="flex items-center justify-between py-1 mt-1">
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
      </ResizablePanelGroup>
    </div>
  )
}

export default ContractChat
