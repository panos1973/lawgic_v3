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
import { useTranslations } from 'next-intl'

interface Props {
  variant?: string
}

const CreateNewCaseStudy: NextPage<Props> = ({ variant }) => {
  const auth = useAuth()
  const t = useTranslations('caseResearch.home')

  const [loading, setLoading] = useState<boolean>(false)

  const newcase = async () => {
    if (loading) return // Prevent multiple clicks
    setLoading(true)
    try {
      // Correct dynamic import for functions
      const { createCaseStudy } = await import(
        '@/app/[locale]/actions/case_study_actions'
      )
      await createCaseStudy(auth.userId!)
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
              className="md:w-full w-fit "
              variant={variant as any}
              size="sm"
              onClick={newcase}
              disabled={loading} // Disable button when loading
            >
              {loading ? (
                <Icons.spinner className="animate-spin w-4 h-4" />
              ) : (
                <>
                  <div className="md:hidden">{t('newMobile')}</div>

                  <div className="hidden md:block">{t('new')}</div>
                </>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('new')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

export default CreateNewCaseStudy
