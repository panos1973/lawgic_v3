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
  deleteCaseStudy,
  updateCaseStudyNote,
} from '@/app/[locale]/actions/case_study_actions'
import { CaseStudy } from '@/lib/types/types'
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
import CreateNewCaseStudy from './create_new_case_study'

interface Props {
  caseStudies: CaseStudy[]
  caseStudyTranslations: {
    selectResearchForChatHistory: string
    note?: string
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

const CaseStudyLinks: NextPage<Props> = ({
  caseStudies,
  caseStudyTranslations,
}) => {
  const path = usePathname()
  const [selectedCaseStudies, setSelectedCaseStudies] = useState<string[]>([])
  const [isMassDelete, setIsMassDelete] = useState(false)
  const [visibleNoteCaseStudyId, setVisibleNoteCaseStudyId] = useState<
    string | null
  >(null)
  const [notes, setNotes] = useState<{ [caseStudyId: string]: string }>({})
  const locale = useLocale() || 'el'

  const handleCheckboxChange = (caseStudyId: string) => {
    setSelectedCaseStudies((prev) =>
      prev.includes(caseStudyId)
        ? prev.filter((id) => id !== caseStudyId)
        : [...prev, caseStudyId]
    )
  }

  const handleMassDelete = async () => {
    try {
      await toast.promise(
        Promise.all(
          selectedCaseStudies.map((caseStudyId) => deleteCaseStudy(caseStudyId))
        ),
        {
          loading: `${caseStudyTranslations.massDeleteToastLoading}...`,
          success: caseStudyTranslations.massDeleteToastSuccess,
          error: "Oops! Couldn't Delete, try again",
        }
      )
      setSelectedCaseStudies([])
      setIsMassDelete(false)
    } catch {
      toast.error('Failed to delete selected case studies, please try again.')
    }
  }

  const toggleNoteVisibility = (caseStudyId: string) => {
    setVisibleNoteCaseStudyId((prev) =>
      prev === caseStudyId ? null : caseStudyId
    )
  }

  const handleSaveNote = async (caseStudyId: string, note: string) => {
    try {
      await updateCaseStudyNote(caseStudyId, note)
      setNotes((prevNotes) => ({
        ...prevNotes,
        [caseStudyId]: note,
      }))
      toast.success('Note saved successfully.')
    } catch (error) {
      toast.error('Failed to save the note. Please try again.')
    }
    setVisibleNoteCaseStudyId(null)
  }

  return (
    <div>
      <div className="md:hidden flex w-full justify-between px-4 py-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="sm"
            >
              {caseStudyTranslations.history}
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
                {caseStudyTranslations.history}
              </DrawerTitle>
              <DrawerDescription>
                {caseStudyTranslations.selectResearchForChatHistory}
              </DrawerDescription>
            </DrawerHeader>
            <Suspense fallback={<ChatHistoryLoader />}>
              <div className="overflow-y-scroll max-h-[83svh] no-scrollbar ">
                {caseStudies.length > 0 && (
                  <HistoryHeader
                    selectedChats={selectedCaseStudies}
                    handleMassDelete={handleMassDelete}
                    setSelectedChats={setSelectedCaseStudies}
                    isMassDelete={isMassDelete}
                    setIsMassDelete={setIsMassDelete}
                    chatHistoryTranslations={caseStudyTranslations}
                  />
                )}

                {caseStudies.map((caseStudy) => (
                  <div
                    className={cn(
                      'py-3 hover:cursor-pointer px-2 flex flex-col justify-center items-center',
                      {
                        'border-r-2 border-primary bg-slate-200': path.endsWith(
                          caseStudy.id
                        ),
                      }
                    )}
                    key={caseStudy.id}
                  >
                    <div className="flex space-x-4 justify-between items-center w-full">
                      {isMassDelete && (
                        <input
                          type="checkbox"
                          checked={selectedCaseStudies.includes(caseStudy.id)}
                          onChange={() => handleCheckboxChange(caseStudy.id)}
                        />
                      )}
                      {visibleNoteCaseStudyId === caseStudy.id ? (
                        <Link
                          href={`/${locale}/case-research/${caseStudy.id}`}
                          className="w-full"
                        >
                          <div className="w-full">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="min-w-1/2">
                                    <p className="text-sm font-medium line-clamp-2">
                                      {caseStudy.title}
                                    </p>
                                    <input
                                      type="text"
                                      maxLength={80}
                                      placeholder={caseStudyTranslations.note}
                                      value={
                                        notes[caseStudy.id] ||
                                        caseStudy.note ||
                                        ''
                                      }
                                      onChange={(e) =>
                                        setNotes((prevNotes) => ({
                                          ...prevNotes,
                                          [caseStudy.id]: e.target.value,
                                        }))
                                      }
                                      className="w-full text-xs text-[#c2032f] placeholder:text-[#c2032f] border-b border-dashed border-[#c2032f] bg-transparent focus:outline-none focus:border-solid my-1"
                                    />
                                    <p className="text-xs text-slate-500">
                                      {formatDateToCustomFormat(
                                        caseStudy.createdAt!
                                      )}
                                    </p>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="bg-slate-900 w-[280px]">
                                  <p>{caseStudy.title}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </Link>
                      ) : (
                        <DrawerClose asChild>
                          <Link
                            href={`/${locale}/case-research/${caseStudy.id}`}
                            className="w-full"
                          >
                            <div className="w-full">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="min-w-1/2">
                                      <p className="text-sm font-medium line-clamp-2">
                                        {caseStudy.title}
                                      </p>
                                      {caseStudy.note && (
                                        <p className="text-xs text-[#c2032f] my-1">
                                          {caseStudy.note}
                                        </p>
                                      )}
                                      <p className="text-xs text-slate-500">
                                        {formatDateToCustomFormat(
                                          caseStudy.createdAt!
                                        )}
                                      </p>
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 w-[280px]">
                                    <p>{caseStudy.title}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </Link>
                        </DrawerClose>
                      )}

                      {!isMassDelete && (
                        <div className="flex items-center space-x-2">
                          {visibleNoteCaseStudyId === caseStudy.id ? (
                            <TickCircle
                              size={15}
                              className="cursor-pointer"
                              onClick={() =>
                                handleSaveNote(
                                  caseStudy.id,
                                  notes[caseStudy.id] || caseStudy.note || ''
                                )
                              }
                            />
                          ) : (
                            <Note
                              size={15}
                              className="cursor-pointer"
                              onClick={() => toggleNoteVisibility(caseStudy.id)}
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
                                  toast.promise(deleteCaseStudy(caseStudy.id), {
                                    loading: `${caseStudyTranslations.deleteToastLoading}...`,
                                    success:
                                      caseStudyTranslations.deleteToastSuccess,
                                    error: "Oops! Couldn't Delete, try again",
                                  })
                                }}
                              >
                                {caseStudyTranslations.deleteConfirmation}
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
        <CreateNewCaseStudy />
      </div>
      <div className="md:block hidden">
        {caseStudies.length > 0 && (
          <HistoryHeader
            selectedChats={selectedCaseStudies}
            handleMassDelete={handleMassDelete}
            setSelectedChats={setSelectedCaseStudies}
            isMassDelete={isMassDelete}
            setIsMassDelete={setIsMassDelete}
            chatHistoryTranslations={caseStudyTranslations}
          />
        )}

        {caseStudies.map((caseStudy) => (
          <div
            className={cn(
              'py-3 hover:cursor-pointer px-2 flex flex-col justify-center items-center',
              {
                'border-r-2 border-primary bg-slate-200': path.endsWith(
                  caseStudy.id
                ),
              }
            )}
            key={caseStudy.id}
          >
            <div className="flex space-x-4 justify-between items-center w-full">
              {isMassDelete && (
                <input
                  type="checkbox"
                  checked={selectedCaseStudies.includes(caseStudy.id)}
                  onChange={() => handleCheckboxChange(caseStudy.id)}
                />
              )}

              <Link
                href={`/${locale}/case-research/${caseStudy.id}`}
                className="w-full"
              >
                <div className="w-full">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="min-w-1/2">
                          <p className="text-sm font-medium line-clamp-2">
                            {caseStudy.title}
                          </p>
                          {visibleNoteCaseStudyId === caseStudy.id ? (
                            <input
                              type="text"
                              maxLength={80}
                              placeholder={caseStudyTranslations.note}
                              value={
                                notes[caseStudy.id] || caseStudy.note || ''
                              }
                              onChange={(e) =>
                                setNotes((prevNotes) => ({
                                  ...prevNotes,
                                  [caseStudy.id]: e.target.value,
                                }))
                              }
                              className="w-full text-xs text-[#c2032f] placeholder:text-[#c2032f] border-b border-dashed border-[#c2032f] bg-transparent focus:outline-none focus:border-solid my-1"
                            />
                          ) : (
                            caseStudy.note && (
                              <p className="text-xs text-[#c2032f] my-1">
                                {caseStudy.note}
                              </p>
                            )
                          )}
                          <p className="text-xs text-slate-500">
                            {formatDateToCustomFormat(caseStudy.createdAt!)}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-900 w-[280px]">
                        <p>{caseStudy.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Link>

              {!isMassDelete && (
                <div className="flex items-center space-x-2">
                  {visibleNoteCaseStudyId === caseStudy.id ? (
                    <TickCircle
                      size={15}
                      className="cursor-pointer"
                      onClick={() =>
                        handleSaveNote(
                          caseStudy.id,
                          notes[caseStudy.id] || caseStudy.note || ''
                        )
                      }
                    />
                  ) : (
                    <Note
                      size={15}
                      className="cursor-pointer"
                      onClick={() => toggleNoteVisibility(caseStudy.id)}
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
                          toast.promise(deleteCaseStudy(caseStudy.id), {
                            loading: `${caseStudyTranslations.deleteToastLoading}...`,
                            success: caseStudyTranslations.deleteToastSuccess,
                            error: "Oops! Couldn't Delete, try again",
                          })
                        }}
                      >
                        {caseStudyTranslations.deleteConfirmation}
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

export default CaseStudyLinks
