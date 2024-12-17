'use client'
import { NextPage } from 'next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { useState } from 'react'
import { Icons } from '../icons'
import { useLocale, useTranslations } from 'use-intl'
import { useRouter } from 'next/navigation'

interface Props {
  variant?: string
}

const CreateNewStandardContractChat: NextPage<Props> = ({ variant }) => {
  const auth = useAuth()
  const t = useTranslations('standardContract.home')
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const locale = useLocale() || 'el'

  const newchat = async () => {
    if (loading) return // Prevent multiple clicks
    setLoading(true)

    try {
      // Correct dynamic import for the createContract function
      const { createStandardContract } = await import(
        '@/app/[locale]/actions/standard_contract_actions'
      )

      const contractId = await createStandardContract(auth.userId!)

      // Redirect to the new contract page using client-side router
      router.push(`/${locale}/standard-contract/${contractId}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="w-full"
              size="sm"
              variant={variant as any}
              onClick={newchat}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <Icons.spinner className="animate-spin w-4 h-4" />
              ) : (
                t('new')
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('new')}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default CreateNewStandardContractChat
