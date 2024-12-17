'use client'
import { useState } from 'react'
import { NextPage } from 'next'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'
import { Icons } from '../icons'
import { useTranslations } from 'next-intl'

interface Props {
  variant?: string
}

const CreateNewChat: NextPage<Props> = ({ variant }) => {
  const auth = useAuth()
  const t = useTranslations('lawbot.chat')

  const [loading, setLoading] = useState<boolean>(false)

  const newchat = async () => {
    if (loading) return // Prevent multiple clicks
    setLoading(true)
    try {
      const { addChat } = await import('@/app/[locale]/actions/chat_actions')
      await addChat({ userId: auth.userId! })
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
              className="md:w-full w-fit"
              size="sm"
              variant={variant as any}
              onClick={newchat}
              disabled={loading}
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

export default CreateNewChat
