'use client'

import { NextPage } from 'next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CloseCircle, Trash, Note, TickCircle } from 'iconsax-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePathname } from 'next/navigation'
import {
  cn,
  formatDateToCustomFormat,
  relativeTimeFromDates,
} from '@/lib/utils'
import { toast } from 'sonner'
import {
  deleteContract,
  updateContractNote,
} from '@/app/[locale]/actions/contract_action'
import { Contract } from '@/lib/types/types'
import { Suspense, useState } from 'react'
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
import ChatHistoryLoader from '../chat/chat_history_loader'
import CreateNewContractChat from './create_new_chat'

interface Props {
  contracts: Contract[]
  contractTranslations: {
    note?: string
    selectChatHistory: string
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

const ContractChatLinks: NextPage<Props> = ({
  contracts,
  contractTranslations,
}) => {
  const path = usePathname()
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [isMassDelete, setIsMassDelete] = useState(false)
  const [visibleNoteContractId, setVisibleNoteContractId] = useState<
    string | null
  >(null)
  const [notes, setNotes] = useState<{ [contractId: string]: string }>({})
  const locale = useLocale() || 'el'

  const handleCheckboxChange = (contractId: string) => {
    setSelectedContracts((prev) =>
      prev.includes(contractId)
        ? prev.filter((id) => id !== contractId)
        : [...prev, contractId]
    )
  }

  const handleMassDelete = async () => {
    try {
      await toast.promise(
        Promise.all(
          selectedContracts.map((contractId) => deleteContract(contractId))
        ),
        {
          loading: `${contractTranslations.massDeleteToastLoading}...`,
          success: contractTranslations.massDeleteToastSuccess,
          error: "Oops! Couldn't Delete, try again",
        }
      )
      setSelectedContracts([])
      setIsMassDelete(false)
    } catch {
      toast.error('Failed to delete selected contracts, please try again.')
    }
  }

  const toggleNoteVisibility = (contractId: string) => {
    setVisibleNoteContractId((prev) =>
      prev === contractId ? null : contractId
    )
  }

  const handleSaveNote = async (contractId: string, note: string) => {
    try {
      await updateContractNote(contractId, note)
      setNotes((prevNotes) => ({
        ...prevNotes,
        [contractId]: note,
      }))
      toast.success('Note saved successfully.')
    } catch (error) {
      toast.error('Failed to save the note. Please try again.')
    }
    setVisibleNoteContractId(null)
  }

  return (
    <div>
      <div className="md:hidden flex  w-full justify-between px-4 py-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              {contractTranslations.history}
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
                {contractTranslations.history}
              </DrawerTitle>
              <DrawerDescription>
                {contractTranslations.selectChatHistory}
              </DrawerDescription>
            </DrawerHeader>
            <Suspense fallback={<ChatHistoryLoader />}>
              <div className="overflow-y-scroll max-h-[83svh] no-scrollbar ">
                {contracts.length > 0 && (
                  <HistoryHeader
                    selectedChats={selectedContracts}
                    handleMassDelete={handleMassDelete}
                    setSelectedChats={setSelectedContracts}
                    isMassDelete={isMassDelete}
                    setIsMassDelete={setIsMassDelete}
                    chatHistoryTranslations={contractTranslations}
                  />
                )}

                {contracts.map((contract) => (
                  <div
                    className={cn(
                      'py-3 hover:cursor-pointer px-2 flex flex-col justify-center items-center',
                      {
                        'border-r-2 border-primary bg-slate-200': path.endsWith(
                          contract.id
                        ),
                      }
                    )}
                    key={contract.id}
                  >
                    <div className="flex space-x-4 justify-between items-center w-full">
                      {isMassDelete && (
                        <input
                          type="checkbox"
                          checked={selectedContracts.includes(contract.id)}
                          onChange={() => handleCheckboxChange(contract.id)}
                        />
                      )}
                      {visibleNoteContractId === contract.id ? (
                        <Link
                          href={`/${locale}/contract/${contract.id}`}
                          className="w-full"
                        >
                          <div className="w-full">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="min-w-1/2">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {contract.title}
                                    </p>
                                    <input
                                      type="text"
                                      maxLength={80}
                                      placeholder={contractTranslations.note}
                                      value={
                                        notes[contract.id] ||
                                        contract.note ||
                                        ''
                                      }
                                      onChange={(e) =>
                                        setNotes((prevNotes) => ({
                                          ...prevNotes,
                                          [contract.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full text-xs text-[#c2032f] placeholder:text-[#c2032f] border-b border-dashed border-[#c2032f] bg-transparent focus:outline-none focus:border-solid my-1"
                                    />
                                    <p className="text-xs text-slate-500">
                                      {formatDateToCustomFormat(
                                        contract.createdAt!
                                      )}
                                    </p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 w-[280px]">
                                  <p>{contract.title}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </Link>
                      ) : (
                        <DrawerClose asChild>
                          <Link
                            href={`/${locale}/contract/${contract.id}`}
                            className="w-full"
                          >
                            <div className="w-full">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="min-w-1/2">
                                      <p className="text-sm font-medium line-clamp-2">
                                        {contract.title}
                                      </p>
                                      {contract.note && (
                                        <p className="text-xs text-[#c2032f] my-1">
                                          {contract.note}
                                        </p>
                                      )}
                                      <p className="text-xs text-slate-500">
                                        {formatDateToCustomFormat(
                                          contract.createdAt!
                                        )}
                                      </p>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 w-[280px]">
                                    <p>{contract.title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </Link>
                        </DrawerClose>
                      )}
                      {!isMassDelete && (
                        <div className="flex items-center space-x-2">
                          {visibleNoteContractId === contract.id ? (
                            <TickCircle
                              size={15}
                              className="cursor-pointer"
                              onClick={() =>
                                handleSaveNote(
                                  contract.id,
                                  notes[contract.id] || contract.note || ''
                                )
                              }
                            />
                          ) : (
                            <Note
                              size={15}
                              className="cursor-pointer"
                              onClick={() => toggleNoteVisibility(contract.id)}
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
                                  toast.promise(deleteContract(contract.id), {
                                    loading: `${contractTranslations.deleteToastLoading}...`,
                                    success:
                                      contractTranslations.deleteToastSuccess,
                                    error: "Oops! Couldn't Delete, try again",
                                  })
                                }}
                              >
                                {contractTranslations.deleteConfirmation}
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
        <CreateNewContractChat />
      </div>
      <div className="md:block hidden">
        {contracts.length > 0 && (
          <HistoryHeader
            selectedChats={selectedContracts}
            handleMassDelete={handleMassDelete}
            setSelectedChats={setSelectedContracts}
            isMassDelete={isMassDelete}
            setIsMassDelete={setIsMassDelete}
            chatHistoryTranslations={contractTranslations}
          />
        )}

        {contracts.map((contract) => (
          <div
            className={cn(
              'py-3 hover:cursor-pointer px-2 flex flex-col justify-center items-center',
              {
                'border-r-2 border-primary bg-slate-200': path.endsWith(
                  contract.id
                ),
              }
            )}
            key={contract.id}
          >
            <div className="flex space-x-4 justify-between items-center w-full">
              {isMassDelete && (
                <input
                  type="checkbox"
                  checked={selectedContracts.includes(contract.id)}
                  onChange={() => handleCheckboxChange(contract.id)}
                />
              )}

              <Link
                href={`/${locale}/contract/${contract.id}`}
                className="w-full"
              >
                <div className="w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="min-w-1/2">
                          <p className="text-sm font-medium line-clamp-2">
                            {contract.title}
                          </p>
                          {visibleNoteContractId === contract.id ? (
                            <input
                              type="text"
                              maxLength={80}
                              placeholder={contractTranslations.note}
                              value={notes[contract.id] || contract.note || ''}
                              onChange={(e) =>
                                setNotes((prevNotes) => ({
                                  ...prevNotes,
                                  [contract.id]: e.target.value,
                                }))
                              }
                              className="w-full text-xs text-[#c2032f] placeholder:text-[#c2032f] border-b border-dashed border-[#c2032f] bg-transparent focus:outline-none focus:border-solid my-1"
                            />
                          ) : (
                            contract.note && (
                              <p className="text-xs text-[#c2032f] my-1">
                                {contract.note}
                              </p>
                            )
                          )}
                          <p className="text-xs text-slate-500">
                            {formatDateToCustomFormat(contract.createdAt!)}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 w-[280px]">
                        <p>{contract.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Link>

              {!isMassDelete && (
                <div className="flex items-center space-x-2">
                  {visibleNoteContractId === contract.id ? (
                    <TickCircle
                      size={15}
                      className="cursor-pointer"
                      onClick={() =>
                        handleSaveNote(
                          contract.id,
                          notes[contract.id] || contract.note || ''
                        )
                      }
                    />
                  ) : (
                    <Note
                      size={15}
                      className="cursor-pointer"
                      onClick={() => toggleNoteVisibility(contract.id)}
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
                          toast.promise(deleteContract(contract.id), {
                            loading: `${contractTranslations.deleteToastLoading}...`,
                            success: contractTranslations.deleteToastSuccess,
                            error: "Oops! Couldn't Delete, try again",
                          })
                        }}
                      >
                        {contractTranslations.deleteConfirmation}
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

export default ContractChatLinks
