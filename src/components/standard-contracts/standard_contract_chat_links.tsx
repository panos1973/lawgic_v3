'use client'

import { NextPage } from 'next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Trash } from 'iconsax-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePathname } from 'next/navigation'
import { cn, relativeTimeFromDates } from '@/lib/utils'
import { toast } from 'sonner'
import { deleteStandardContract } from '@/app/[locale]/actions/standard_contract_actions'
import { Contract } from '@/lib/types/types'
import { useState } from 'react'
import HistoryHeader from '../misc/history_header'
import { useLocale } from 'next-intl'

interface Props {
  contracts: Contract[]
  contractTranslations: {
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

const StandardContractChatLinks: NextPage<Props> = ({
  contracts,
  contractTranslations,
}) => {
  const path = usePathname()
  const [selectedContracts, setSelectedContracts] = useState<string[]>([])
  const [isMassDelete, setIsMassDelete] = useState(false)
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
          selectedContracts.map((contractId) =>
            deleteStandardContract(contractId)
          )
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

  return (
    <div>
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
          className={cn('h-16 py-1 hover:cursor-pointer px-2', {
            'border-r-2 border-primary bg-slate-200': path.endsWith(
              contract.id
            ),
          })}
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
              href={`/${locale}/standard-contract/${contract.id}`}
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
                        <p className="text-xs text-slate-500">
                          {relativeTimeFromDates(contract.createdAt!)}
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
                      toast.promise(deleteStandardContract(contract.id), {
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
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StandardContractChatLinks
